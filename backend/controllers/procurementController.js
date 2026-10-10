import db from '../config/db.js'
import { evaluateRFQQuotations } from '../services/recommendationService.js'

// Helper: Audit Log
async function logAudit(userId, action, module, details) {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, module, details) VALUES (?, ?, ?, ?)`,
      [userId || null, action, module, typeof details === 'object' ? JSON.stringify(details) : details]
    )
  } catch (e) {}
}

// 1. GET /api/materials/rfq
export async function getRFQs(req, res) {
  try {
    const [rfqs] = await db.query(
      `SELECT r.*, p.project_name, p.project_code,
              (SELECT COUNT(*) FROM rfq_items WHERE rfq_id = r.rfq_id) as item_count,
              (SELECT COUNT(*) FROM supplier_quotations WHERE rfq_id = r.rfq_id) as quotation_count
       FROM material_rfqs r
       LEFT JOIN projects p ON r.project_id = p.project_id
       ORDER BY r.rfq_id DESC`
    )

    // Attach items for each RFQ
    for (const r of rfqs) {
      const [items] = await db.query(
        `SELECT ri.*, i.item_code, i.item_name, i.unit 
         FROM rfq_items ri 
         JOIN items i ON ri.item_id = i.item_id 
         WHERE ri.rfq_id = ?`,
        [r.rfq_id]
      )
      r.items = items
    }

    return res.json({ success: true, data: rfqs })
  } catch (error) {
    console.error('[Get RFQs Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch RFQs.' })
  }
}

// 2. POST /api/materials/rfq (Create RFQ)
export async function createRFQ(req, res) {
  let connection
  try {
    const { title, project_id, required_delivery_date, remarks, items } = req.body

    if (!title || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'RFQ title and at least one item line are required.' })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const rfqCode = `RFQ-${Date.now().toString().slice(-6)}`

    const [result] = await connection.query(
      `INSERT INTO material_rfqs (rfq_code, title, project_id, required_delivery_date, status, remarks, created_by)
       VALUES (?, ?, ?, ?, 'PUBLISHED', ?, ?)`,
      [rfqCode, title, project_id || null, required_delivery_date || null, remarks || '', req.user?.user_id || 1]
    )

    const rfqId = result.insertId

    for (const item of items) {
      if (item.item_id && item.requested_quantity > 0) {
        await connection.query(
          `INSERT INTO rfq_items (rfq_id, item_id, requested_quantity) VALUES (?, ?, ?)`,
          [rfqId, item.item_id, Number(item.requested_quantity)]
        )
      }
    }

    await connection.commit()
    await logAudit(req.user?.user_id, 'CREATE_RFQ', 'PROCUREMENT', { rfq_id: rfqId, rfq_code: rfqCode })

    return res.status(201).json({ success: true, message: 'RFQ created successfully.', rfq_code: rfqCode, rfq_id: rfqId })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('[Create RFQ Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create RFQ.' })
  } finally {
    if (connection) connection.release()
  }
}

// 3. GET /api/materials/quotations
export async function getQuotations(req, res) {
  try {
    const { rfq_id } = req.query
    let query = `
      SELECT q.*, r.title as rfq_title, r.rfq_code, s.supplier_name, s.rating as supplier_rating, s.city as supplier_city
      FROM supplier_quotations q
      JOIN material_rfqs r ON q.rfq_id = r.rfq_id
      JOIN suppliers s ON q.supplier_id = s.supplier_id
      WHERE 1=1
    `
    const params = []
    if (rfq_id) {
      query += ' AND q.rfq_id = ?'
      params.push(rfq_id)
    }

    query += ' ORDER BY q.quotation_id DESC'

    const [quotes] = await db.query(query, params)

    for (const q of quotes) {
      const [items] = await db.query(
        `SELECT qi.*, i.item_code, i.item_name, i.unit 
         FROM quotation_items qi 
         JOIN items i ON qi.item_id = i.item_id 
         WHERE qi.quotation_id = ?`,
        [q.quotation_id]
      )
      q.items = items
    }

    return res.json({ success: true, data: quotes })
  } catch (error) {
    console.error('[Get Quotations Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch quotations.' })
  }
}

// 4. POST /api/materials/quotations (Submit Quotation)
export async function createQuotation(req, res) {
  let connection
  try {
    const { rfq_id, supplier_id, delivery_days, remarks, items } = req.body

    if (!rfq_id || !supplier_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'RFQ ID, Supplier ID, and quoted items are required.' })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    const qtnCode = `QTN-${Date.now().toString().slice(-6)}`

    // Calculate total amount
    let totalAmount = 0
    const processedItems = items.map((it) => {
      const qty = Number(it.quoted_quantity) || 1
      const price = Number(it.unit_price) || 0
      const tax = Number(it.tax_amount) || 0
      const disc = Number(it.discount_amount) || 0
      const lineTotal = qty * price + tax - disc
      totalAmount += lineTotal
      return { ...it, qty, price, tax, disc, lineTotal }
    })

    const [result] = await connection.query(
      `INSERT INTO supplier_quotations (quotation_code, rfq_id, supplier_id, delivery_days, status, remarks, total_amount)
       VALUES (?, ?, ?, ?, 'SUBMITTED', ?, ?)`,
      [qtnCode, rfq_id, supplier_id, Number(delivery_days) || 7, remarks || '', totalAmount]
    )

    const qId = result.insertId

    for (const item of processedItems) {
      await connection.query(
        `INSERT INTO quotation_items 
         (quotation_id, item_id, quoted_quantity, unit_price, tax_amount, discount_amount, line_total, has_certification, available_stock, moq)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          qId,
          item.item_id,
          item.qty,
          item.price,
          item.tax,
          item.disc,
          item.lineTotal,
          item.has_certification !== false ? 1 : 0,
          Number(item.available_stock) || 1000,
          Number(item.moq) || 1,
        ]
      )
    }

    await connection.commit()
    await logAudit(req.user?.user_id, 'CREATE_QUOTATION', 'PROCUREMENT', { quotation_id: qId, quotation_code: qtnCode })

    return res.status(201).json({ success: true, message: 'Quotation submitted successfully.', quotation_code: qtnCode, quotation_id: qId })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('[Create Quotation Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to submit quotation.' })
  } finally {
    if (connection) connection.release()
  }
}

// 5. GET /api/materials/rfq/:rfqId/recommendations (Trigger Multi-Criteria Supplier Recommendation Engine)
export async function getRFQRecommendations(req, res) {
  try {
    const { rfqId } = req.params
    const evaluationResult = await evaluateRFQQuotations(rfqId)
    return res.json({ success: true, data: evaluationResult })
  } catch (error) {
    console.error('[RFQ Recommendation Error]', error)
    return res.status(500).json({ success: false, error: error.message || 'Failed to calculate supplier recommendations.' })
  }
}

// 6. POST /api/materials/po/from-quotation (Accept Quotation & Generate Purchase Order)
export async function createPOFromQuotation(req, res) {
  let connection
  try {
    const { quotation_id, expected_delivery_date, delivery_location, remarks } = req.body

    if (!quotation_id) {
      return res.status(400).json({ success: false, error: 'Quotation ID is required.' })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Lock Quotation
    const [qRows] = await connection.query(`SELECT * FROM supplier_quotations WHERE quotation_id = ? FOR UPDATE`, [quotation_id])
    if (qRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, error: 'Quotation not found.' })
    }

    const quote = qRows[0]
    if (quote.status === 'ACCEPTED') {
      await connection.rollback()
      return res.status(400).json({ success: false, error: 'Quotation has already been accepted.' })
    }

    // Lock RFQ
    const [rfqRows] = await connection.query(`SELECT * FROM material_rfqs WHERE rfq_id = ? FOR UPDATE`, [quote.rfq_id])
    const rfq = rfqRows[0] || {}

    // Fetch Quotation Line Items
    const [qItems] = await connection.query(`SELECT * FROM quotation_items WHERE quotation_id = ?`, [quotation_id])

    const poCode = `PO-${Date.now().toString().slice(-6)}`

    // Create Purchase Order Header
    const [poResult] = await connection.query(
      `INSERT INTO purchase_orders 
       (po_code, quotation_id, rfq_id, project_id, supplier_id, expected_delivery_date, delivery_location, status, total_amount, paid_amount, remarks, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'ISSUED', ?, 0.00, ?, ?)`,
      [
        poCode,
        quotation_id,
        quote.rfq_id,
        rfq.project_id || null,
        quote.supplier_id,
        expected_delivery_date || rfq.required_delivery_date || null,
        delivery_location || 'Main Site Storage',
        quote.total_amount,
        remarks || `Derived from accepted quote ${quote.quotation_code}`,
        req.user?.user_id || 1,
      ]
    )

    const poId = poResult.insertId

    // Copy items into purchase_order_items
    for (const item of qItems) {
      await connection.query(
        `INSERT INTO purchase_order_items (po_id, item_id, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?)`,
        [poId, item.item_id, item.quoted_quantity, item.unit_price, item.line_total]
      )
    }

    // Reference PDF Rule: Mark selected quote ACCEPTED, other quotes for same RFQ REJECTED, RFQ CLOSED
    await connection.query(`UPDATE supplier_quotations SET status = 'ACCEPTED' WHERE quotation_id = ?`, [quotation_id])
    await connection.query(`UPDATE supplier_quotations SET status = 'REJECTED' WHERE rfq_id = ? AND quotation_id != ?`, [quote.rfq_id, quotation_id])
    await connection.query(`UPDATE material_rfqs SET status = 'CLOSED' WHERE rfq_id = ?`, [quote.rfq_id])

    await connection.commit()
    await logAudit(req.user?.user_id, 'ACCEPT_QUOTE_CREATE_PO', 'PROCUREMENT', { po_code: poCode, quotation_id })

    return res.status(201).json({
      success: true,
      message: `Quotation accepted. Purchase Order ${poCode} generated successfully!`,
      po_code: poCode,
      po_id: poId,
    })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('[Create PO Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create Purchase Order from quotation.' })
  } finally {
    if (connection) connection.release()
  }
}

// 7. GET /api/materials/po (Get Purchase Orders)
export async function getPOs(req, res) {
  try {
    const [pos] = await db.query(
      `SELECT po.*, s.supplier_name, p.project_name, p.project_code,
              (po.total_amount - po.paid_amount) as balance_due
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.supplier_id
       LEFT JOIN projects p ON po.project_id = p.project_id
       ORDER BY po.po_id DESC`
    )

    for (const p of pos) {
      const [items] = await db.query(
        `SELECT poi.*, i.item_code, i.item_name, i.unit 
         FROM purchase_order_items poi 
         JOIN items i ON poi.item_id = i.item_id 
         WHERE poi.po_id = ?`,
        [p.po_id]
      )
      p.items = items
    }

    return res.json({ success: true, data: pos })
  } catch (error) {
    console.error('[Get POs Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch Purchase Orders.' })
  }
}

// 8. PATCH /api/materials/po/:id/status (PO Status Update & Delivery Processing)
export async function updatePOStatus(req, res) {
  let connection
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['ISSUED', 'ACCEPTED', 'REJECTED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']
    const newStatus = String(status || '').toUpperCase()

    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ success: false, error: `Invalid status. Allowed: ${validStatuses.join(', ')}` })
    }

    connection = await db.getConnection()
    await connection.beginTransaction()

    // Lock PO
    const [poRows] = await connection.query(`SELECT * FROM purchase_orders WHERE po_id = ? FOR UPDATE`, [id])
    if (poRows.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, error: 'Purchase Order not found.' })
    }

    const po = poRows[0]

    // Reference PDF Rule: Cannot change status after PO is already DELIVERED
    if (po.status === 'DELIVERED') {
      await connection.rollback()
      return res.status(400).json({ success: false, error: 'Purchase Order is already DELIVERED. Status cannot be modified.' })
    }

    // Process Delivery Transition to DELIVERED
    if (newStatus === 'DELIVERED') {
      const [poItems] = await connection.query(`SELECT * FROM purchase_order_items WHERE po_id = ?`, [id])

      for (const item of poItems) {
        const qty = Number(item.quantity)
        const price = Number(item.unit_price)

        // Lock & Update Authoritative Central Inventory Stock
        const [itemRows] = await connection.query(`SELECT stock_quantity FROM items WHERE item_id = ? FOR UPDATE`, [item.item_id])
        if (itemRows.length > 0) {
          const currentStock = Number(itemRows[0].stock_quantity) || 0
          const newStock = currentStock + qty

          await connection.query(
            `UPDATE items SET stock_quantity = ?, unit_price = ? WHERE item_id = ?`,
            [newStock, price, item.item_id]
          )

          // Record DELIVERY inventory transaction
          const txnCode = `TXN-DELIV-${Date.now().toString().slice(-6)}`
          await connection.query(
            `INSERT INTO inventory_transactions 
             (transaction_code, item_id, movement_type, quantity, unit_cost, total_cost, project_id, supplier_id, reference_no, remarks, created_by)
             VALUES (?, ?, 'DELIVERY', ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              txnCode,
              item.item_id,
              qty,
              price,
              qty * price,
              po.project_id || null,
              po.supplier_id || null,
              po.po_code,
              `PO Delivery Received (${po.po_code})`,
              req.user?.user_id || 1,
            ]
          )
        }
      }

      await connection.query(
        `UPDATE purchase_orders SET status = 'DELIVERED', delivered_at = NOW() WHERE po_id = ?`,
        [id]
      )
    } else {
      await connection.query(`UPDATE purchase_orders SET status = ? WHERE po_id = ?`, [newStatus, id])
    }

    await connection.commit()
    await logAudit(req.user?.user_id, 'UPDATE_PO_STATUS', 'PROCUREMENT', { po_id: id, newStatus })

    return res.json({ success: true, message: `Purchase Order status updated to ${newStatus}.` })
  } catch (error) {
    if (connection) await connection.rollback()
    console.error('[Update PO Status Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update Purchase Order status.' })
  } finally {
    if (connection) connection.release()
  }
}

// 9. POST /api/materials/po/:id/payment (Add Payment to PO)
export async function addPOPayment(req, res) {
  try {
    const { id } = req.params
    const { amount } = req.body

    const payAmt = Number(amount)
    if (isNaN(payAmt) || payAmt <= 0) {
      return res.status(400).json({ success: false, error: 'Positive payment amount is required.' })
    }

    const [poRows] = await db.query(`SELECT * FROM purchase_orders WHERE po_id = ?`, [id])
    if (poRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Purchase Order not found.' })
    }

    const po = poRows[0]
    const currentPaid = Number(po.paid_amount) || 0
    const totalAmount = Number(po.total_amount) || 0
    const newPaid = Math.min(totalAmount, currentPaid + payAmt)

    await db.query(`UPDATE purchase_orders SET paid_amount = ? WHERE po_id = ?`, [newPaid, id])

    // Record system payment log if payments table exists
    const payCode = `PAY-PO-${Date.now().toString().slice(-6)}`
    try {
      await db.query(
        `INSERT INTO payments (payment_code, amount, payment_date, payment_method, status, notes)
         VALUES (?, ?, CURDATE(), 'Bank Transfer', 'Completed', ?)`,
        [payCode, payAmt, `Payment against PO ${po.po_code}`]
      )
    } catch (e) {}

    await logAudit(req.user?.user_id, 'PO_PAYMENT', 'PROCUREMENT', { po_id: id, payAmt, newPaid })

    return res.json({
      success: true,
      message: `Payment of ${payAmt} recorded successfully against PO ${po.po_code}.`,
      paid_amount: newPaid,
      remaining_balance: Math.max(0, totalAmount - newPaid),
    })
  } catch (error) {
    console.error('[Add PO Payment Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to record PO payment.' })
  }
}
