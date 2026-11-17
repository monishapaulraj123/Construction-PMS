import db from '../config/db.js'

const TYPE_CONFIG = {
  'CT-01': {
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    stages_count: 14,
    description: 'Independent homes, villas and apartments',
  },
  'Residential': {
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
    stages_count: 14,
    description: 'Independent homes, villas and apartments',
  },
  'CT-02': {
    icon: '🏥',
    image: 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?q=80&w=600&auto=format&fit=crop',
    stages_count: 9,
    description: 'Healthcare and medical facilities',
  },
  'Hospital': {
    icon: '🏥',
    image: 'https://images.unsplash.com/photo-1587351021355-a479a299d2f9?q=80&w=600&auto=format&fit=crop',
    stages_count: 9,
    description: 'Healthcare and medical facilities',
  },
  'CT-03': {
    icon: '🏫',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop',
    stages_count: 15,
    description: 'Educational campuses and institutions',
  },
  'College': {
    icon: '🏫',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop',
    stages_count: 15,
    description: 'Educational campuses and institutions',
  },
  'CT-04': {
    icon: '🏢',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    stages_count: 7,
    description: 'Offices, retail and mixed-use towers',
  },
  'Commercial Building': {
    icon: '🏢',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
    stages_count: 7,
    description: 'Offices, retail and mixed-use towers',
  },
  'CT-05': {
    icon: '🏭',
    image: '/images/categories/industrial_building.jpg',
    stages_count: 12,
    description: 'Factories, warehouses and plants',
  },
  'Industrial Building': {
    icon: '🏭',
    image: '/images/categories/industrial_building.jpg',
    stages_count: 12,
    description: 'Factories, warehouses and plants',
  },
  'CT-06': {
    icon: '🛣️',
    image: '/images/categories/road.jpg',
    stages_count: 0,
    description: 'Highways and road infrastructure',
  },
  'Road': {
    icon: '🛣️',
    image: '/images/categories/road.jpg',
    stages_count: 0,
    description: 'Highways and road infrastructure',
  },
}

export async function getAllConstructionTypes(req, res) {
  try {
    const { search, status } = req.query
    let query = 'SELECT * FROM construction_types WHERE 1=1'
    const params = []

    if (search) {
      query += ' AND (construction_type_name LIKE ? OR construction_type_code LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status !== undefined && status !== '') {
      query += ' AND status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' ORDER BY construction_type_id ASC'

    const [rows] = await db.query(query, params)
    const enriched = (rows || []).map((r) => {
      const def = TYPE_CONFIG[r.construction_type_code] || TYPE_CONFIG[r.construction_type_name] || {}
      return {
        ...r,
        icon: r.icon || def.icon || '🏗️',
        image: r.image || def.image || '/images/categories/industrial_building.jpg',
        stages_count: r.stages_count !== undefined ? r.stages_count : def.stages_count,
        description: def.description || r.description,
      }
    })
    return res.json({ success: true, data: enriched })
  } catch (error) {
    console.error('[ConstructionTypes Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching construction types.' })
  }
}

export async function createConstructionType(req, res) {
  try {
    const { construction_type_code, construction_type_name, description, status } = req.body

    const code = construction_type_code || `CT-${Date.now().toString().slice(-4)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    const [result] = await db.query(
      'INSERT INTO construction_types (construction_type_code, construction_type_name, description, status, created_by) VALUES (?, ?, ?, ?, ?)',
      [code, construction_type_name, description || '', isStatus ? 1 : 0, req.user?.user_id || 1]
    )

    const [created] = await db.query('SELECT * FROM construction_types WHERE construction_type_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create ConstructionType Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create construction type.' })
  }
}

export async function updateConstructionType(req, res) {
  try {
    const { id } = req.params
    const { construction_type_code, construction_type_name, description, status } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'

    await db.query(
      'UPDATE construction_types SET construction_type_code = ?, construction_type_name = ?, description = ?, status = ?, updated_by = ? WHERE construction_type_id = ?',
      [construction_type_code, construction_type_name, description || '', isStatus ? 1 : 0, req.user?.user_id || 1, id]
    )

    const [updated] = await db.query('SELECT * FROM construction_types WHERE construction_type_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update ConstructionType Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update construction type.' })
  }
}

export async function deleteConstructionType(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM construction_types WHERE construction_type_id = ?', [id])
    return res.json({ success: true, message: 'Construction type deleted successfully.' })
  } catch (error) {
    console.error('[Delete ConstructionType Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete construction type.' })
  }
}
