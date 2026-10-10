import db from '../config/db.js'

// Default weights matching the reference PDF functional specification exactly
const DEFAULT_WEIGHTS = {
  price: 30,
  delivery: 20,
  rating: 15,
  stock: 15,
  moq: 10,
  location: 5,
  quality: 5,
}

/**
 * Evaluate submitted supplier quotations for an RFQ using the Weighted Multi-Criteria Recommendation Algorithm
 * @param {number|string} rfqId 
 */
export async function evaluateRFQQuotations(rfqId) {
  // 1. Fetch RFQ details and requested items
  const [rfqRows] = await db.query(
    `SELECT r.*, p.location as project_location, p.city as project_city, p.pincode as project_pincode 
     FROM material_rfqs r 
     LEFT JOIN projects p ON r.project_id = p.project_id 
     WHERE r.rfq_id = ?`,
    [rfqId]
  )

  if (rfqRows.length === 0) {
    throw new Error(`RFQ with ID ${rfqId} not found.`)
  }

  const rfq = rfqRows[0]

  const [rfqItemRows] = await db.query(
    `SELECT item_id, requested_quantity FROM rfq_items WHERE rfq_id = ?`,
    [rfqId]
  )

  const totalRequestedItemCount = rfqItemRows.length || 1

  // 2. Fetch configurable weights from DB if available, fallback to DEFAULT_WEIGHTS
  let weights = { ...DEFAULT_WEIGHTS }
  try {
    const [weightRows] = await db.query(`SELECT criterion, weight_percent FROM recommendation_weights`)
    if (weightRows.length > 0) {
      weightRows.forEach((w) => {
        if (weights[w.criterion] !== undefined) {
          weights[w.criterion] = Number(w.weight_percent)
        }
      })
    }
  } catch (e) {
    // Fallback to DEFAULT_WEIGHTS
  }

  // 3. Fetch all active quotations for this RFQ
  const [quotations] = await db.query(
    `SELECT q.*, s.supplier_name, s.city as supplier_city, s.postal_code as supplier_postal_code, 
            s.rating as supplier_rating, s.certification as supplier_certification
     FROM supplier_quotations q
     JOIN suppliers s ON q.supplier_id = s.supplier_id
     WHERE q.rfq_id = ? AND q.status IN ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED')`,
    [rfqId]
  )

  if (quotations.length === 0) {
    return {
      rfq_id: rfqId,
      rfq_code: rfq.rfq_code,
      title: rfq.title,
      weights,
      evaluations: [],
      message: 'No quotations found for this RFQ.',
    }
  }

  // Calculate lowest quotation total among all candidate quotes for Price Scoring
  const minQuotationTotal = Math.min(...quotations.map((q) => Number(q.total_amount) || 1))

  // Calculate target delivery days: max(1, ceil((req_date - rfq_created_date)/days))
  const createdDate = new Date(rfq.created_at || Date.now())
  const reqDate = rfq.required_delivery_date ? new Date(rfq.required_delivery_date) : new Date(createdDate.getTime() + 7 * 86400000)
  const diffMs = Math.max(86400000, reqDate.getTime() - createdDate.getTime())
  const targetDeliveryDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  const evaluations = []

  // 4. Evaluate each quotation
  for (const q of quotations) {
    const [qItems] = await db.query(
      `SELECT qi.*, i.item_name, s.moq_default 
       FROM quotation_items qi
       JOIN items i ON qi.item_id = i.item_id
       LEFT JOIN suppliers s ON s.supplier_id = ?
       WHERE qi.quotation_id = ?`,
      [q.supplier_id, q.quotation_id]
    )

    const quotedItemCount = qItems.length || 1

    // A. Price Score (30%): (min_quotation_total / this_quotation_total) * 100
    const qTotal = Number(q.total_amount) || 1
    const priceScore = Math.min(100, (minQuotationTotal / qTotal) * 100)

    // B. Delivery Score (20%)
    const quotedDeliveryDays = Number(q.delivery_days) || 7
    let deliveryScore = 80
    if (quotedDeliveryDays <= targetDeliveryDays) {
      deliveryScore = Math.min(100, 80 + (targetDeliveryDays - quotedDeliveryDays) * 5)
    } else {
      deliveryScore = Math.max(0, 80 - (quotedDeliveryDays - targetDeliveryDays) * 10)
    }

    // C. Rating Score (15%)
    let ratingScore = 70 // Neutral baseline
    if (q.supplier_rating !== null && q.supplier_rating !== undefined) {
      ratingScore = Math.min(100, (Number(q.supplier_rating) / 5) * 100)
    }

    // D. Stock Availability Score (15%)
    let fullStockItems = 0
    let moqCompliantItems = 0
    let certifiedItems = 0

    qItems.forEach((item) => {
      const avail = Number(item.available_stock || 1000)
      const qty = Number(item.quoted_quantity || 1)
      const moq = Number(item.moq || item.moq_default || 1)

      if (avail >= qty) fullStockItems++
      if (qty >= moq) moqCompliantItems++
      if (item.has_certification || q.supplier_certification) certifiedItems++
    })

    const stockScore = (fullStockItems / quotedItemCount) * 100
    const moqScore = (moqCompliantItems / quotedItemCount) * 100

    // E. Location Score (5%)
    let locationScore = 80
    const supCity = (q.supplier_city || '').trim().toLowerCase()
    const prjCity = (rfq.project_city || rfq.project_location || '').trim().toLowerCase()
    const supZip = (q.supplier_postal_code || '').trim().slice(0, 3)
    const prjZip = (rfq.project_pincode || '').trim().slice(0, 3)

    if (supCity && prjCity && (supCity.includes(prjCity) || prjCity.includes(supCity))) {
      locationScore = 100
    } else if (supZip && prjZip && supZip === prjZip) {
      locationScore = 90
    }

    // F. Quality/Certification Score (5%)
    const qualityScore = 70 + 30 * (certifiedItems / quotedItemCount)

    // G. Coverage Adjustment
    const coveragePct = Math.min(100, (quotedItemCount / totalRequestedItemCount) * 100)

    // H. Calculate Weighted Final Score
    const rawScore =
      (priceScore * weights.price +
        deliveryScore * weights.delivery +
        ratingScore * weights.rating +
        stockScore * weights.stock +
        moqScore * weights.moq +
        locationScore * weights.location +
        qualityScore * weights.quality) /
      100

    const finalScore = Math.round(((rawScore * coveragePct) / 100) * 10) / 10

    // Generate Human-Readable Recommendation Reasons
    const reasons = []
    if (priceScore >= 95) reasons.push('Most competitive pricing among candidate quotes')
    if (deliveryScore >= 90) reasons.push(`Delivers within target (${quotedDeliveryDays} days)`)
    if (ratingScore >= 80) reasons.push(`High supplier quality rating (${Number(q.supplier_rating).toFixed(1)}/5)`)
    if (stockScore >= 100) reasons.push('100% full stock availability guaranteed')
    if (moqScore >= 100) reasons.push('Fully satisfies minimum order quantity requirements')
    if (locationScore >= 90) reasons.push('Local supplier in proximity to construction site')
    if (coveragePct >= 100) reasons.push('100% complete RFQ item coverage')

    evaluations.push({
      quotation_id: q.quotation_id,
      quotation_code: q.quotation_code,
      supplier_id: q.supplier_id,
      supplier_name: q.supplier_name,
      total_amount: Number(q.total_amount),
      delivery_days: quotedDeliveryDays,
      final_score: finalScore,
      coverage_percent: Math.round(coveragePct),
      breakdown: {
        price: { score: Math.round(priceScore), weight: weights.price },
        delivery: { score: Math.round(deliveryScore), weight: weights.delivery },
        rating: { score: Math.round(ratingScore), weight: weights.rating },
        stock: { score: Math.round(stockScore), weight: weights.stock },
        moq: { score: Math.round(moqScore), weight: weights.moq },
        location: { score: Math.round(locationScore), weight: weights.location },
        quality: { score: Math.round(qualityScore), weight: weights.quality },
      },
      reasons: reasons.length > 0 ? reasons : ['Meets standard project requirements'],
    })
  }

  // Sort descending by final_score
  evaluations.sort((a, b) => b.final_score - a.final_score)

  return {
    rfq_id: rfqId,
    rfq_code: rfq.rfq_code,
    title: rfq.title,
    target_delivery_days: targetDeliveryDays,
    weights,
    evaluations,
  }
}
