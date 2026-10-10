import db from '../config/db.js'

export async function getAllProperties(req, res) {
  try {
    const { search, seller_id, status, publication_status, verification_status } = req.query
    let query = 'SELECT * FROM properties WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (property_name LIKE ? OR property_code LIKE ? OR location LIKE ? OR survey_number LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (seller_id) {
      query += ' AND seller_id = ?'
      params.push(seller_id)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }

    if (publication_status) {
      query += ' AND publication_status = ?'
      params.push(publication_status)
    }

    if (verification_status) {
      query += ' AND verification_status = ?'
      params.push(verification_status)
    }

    query += ' ORDER BY property_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Properties Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching properties.' })
  }
}

export async function createProperty(req, res) {
  try {
    const {
      property_code, property_name, property_type, survey_number, location,
      district, state, pincode, area, unit, rate_per_unit, total_amount,
      seller_id, seller_name, seller_phone, seller_email, status, publication_status,
      verification_status, image, document_reference, description,
    } = req.body

    const code = property_code || `PROP-${Date.now().toString().slice(-3)}`

    const [result] = await db.query(
      `INSERT INTO properties 
      (property_code, property_name, property_type, survey_number, location, district, state, 
       pincode, area, unit, rate_per_unit, total_amount, seller_id, seller_name, seller_phone, 
       seller_email, status, publication_status, verification_status, image, document_reference, 
       description, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, property_name, property_type || 'Plot / Land', survey_number || '', location || '',
        district || '', state || '', pincode || '', area || 0, unit || 'Sq. Ft', rate_per_unit || 0,
        total_amount || 0, seller_id || req.user?.user_id || null, seller_name || '', seller_phone || '',
        seller_email || '', status || 'Approved', publication_status || 'Published', verification_status || 'Verified',
        image || '', document_reference || '', description || '', req.user?.user_id || 1,
      ]
    )

    const [created] = await db.query('SELECT * FROM properties WHERE property_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create Property Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create property.' })
  }
}

export async function updateProperty(req, res) {
  try {
    const { id } = req.params
    const {
      property_code, property_name, property_type, survey_number, location,
      district, state, pincode, area, unit, rate_per_unit, total_amount,
      status, publication_status, verification_status, image, document_reference, description,
    } = req.body

    await db.query(
      `UPDATE properties SET 
       property_code = COALESCE(?, property_code), 
       property_name = COALESCE(?, property_name), 
       property_type = COALESCE(?, property_type), 
       survey_number = COALESCE(?, survey_number), 
       location = COALESCE(?, location), 
       district = COALESCE(?, district), 
       state = COALESCE(?, state), 
       pincode = COALESCE(?, pincode), 
       area = COALESCE(?, area), 
       unit = COALESCE(?, unit), 
       rate_per_unit = COALESCE(?, rate_per_unit), 
       total_amount = COALESCE(?, total_amount), 
       status = COALESCE(?, status), 
       publication_status = COALESCE(?, publication_status), 
       verification_status = COALESCE(?, verification_status), 
       image = COALESCE(?, image), 
       document_reference = COALESCE(?, document_reference), 
       description = COALESCE(?, description), 
       updated_by = ? 
       WHERE property_id = ?`,
      [
        property_code, property_name, property_type, survey_number, location,
        district, state, pincode, area, unit, rate_per_unit, total_amount,
        status, publication_status, verification_status, image, document_reference, description,
        req.user?.user_id || 1, id,
      ]
    )

    const [updated] = await db.query('SELECT * FROM properties WHERE property_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Property Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update property.' })
  }
}

export async function deleteProperty(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM properties WHERE property_id = ?', [id])
    return res.json({ success: true, message: 'Property deleted successfully.' })
  } catch (error) {
    console.error('[Delete Property Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete property.' })
  }
}
