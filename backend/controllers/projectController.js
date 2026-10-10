import db from '../config/db.js'

export async function getAllProjects(req, res) {
  try {
    const { search, client_id, construction_type_id, stage_id, status } = req.query
    let query = `
      SELECT p.*, c.client_name AS master_client_name, ct.construction_type_name AS master_type_name, st.stage_name AS master_stage_name 
      FROM projects p 
      LEFT JOIN clients c ON p.client_id = c.client_id 
      LEFT JOIN construction_types ct ON p.construction_type_id = ct.construction_type_id 
      LEFT JOIN construction_stages st ON p.construction_stage_id = st.stage_id 
      WHERE 1=1
    `
    const params = []

    if (search) {
      query += ' AND (p.project_name LIKE ? OR p.project_code LIKE ? OR p.client_name LIKE ? OR p.location LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (client_id) {
      query += ' AND p.client_id = ?'
      params.push(client_id)
    }

    if (construction_type_id) {
      query += ' AND p.construction_type_id = ?'
      params.push(construction_type_id)
    }

    if (stage_id) {
      query += ' AND p.construction_stage_id = ?'
      params.push(stage_id)
    }

    if (status !== undefined && status !== '') {
      query += ' AND p.status = ?'
      params.push(status === 'true' || status === '1' ? 1 : 0)
    }

    query += ' ORDER BY p.project_id DESC'

    const [rows] = await db.query(query, params)
    return res.json({ success: true, data: rows })
  } catch (error) {
    console.error('[Projects Error]', error)
    return res.status(500).json({ success: false, error: 'Database error fetching projects.' })
  }
}

export async function getProjectById(req, res) {
  try {
    const { id } = req.params
    const [rows] = await db.query('SELECT * FROM projects WHERE project_id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    return res.json({ success: true, data: rows[0] })
  } catch (error) {
    console.error('[Get Project By ID Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch project details.' })
  }
}

export async function createProject(req, res) {
  try {
    const {
      project_code, project_name, client_id, client_name, construction_type_id,
      construction_type_name, project_type_name, construction_stage_id, construction_stage_name,
      supervisor_id, supervisor_name, location, district, state, total_area, unit,
      estimated_budget, overall_progress_percentage, project_status, start_date,
      expected_completion_date, image, budget_estimation, status,
    } = req.body

    const code = project_code || `PRJ-2026-${Date.now().toString().slice(-3)}`
    const isStatus = status !== false && status !== 0 && status !== 'false'

    const budgetEstJSON = budget_estimation ? JSON.stringify(budget_estimation) : null

    const [result] = await db.query(
      `INSERT INTO projects 
      (project_code, project_name, client_id, client_name, construction_type_id, construction_type_name, 
       project_type_name, construction_stage_id, construction_stage_name, supervisor_id, supervisor_name, 
       location, district, state, total_area, unit, estimated_budget, overall_progress_percentage, 
       project_status, start_date, expected_completion_date, image, budget_estimation, status, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code, project_name, client_id || null, client_name || '', construction_type_id || null,
        construction_type_name || '', project_type_name || 'Standard Villa', construction_stage_id || null,
        construction_stage_name || 'Site Preparation', supervisor_id || null, supervisor_name || '',
        location || '', district || '', state || '', total_area || 0, unit || 'Sq. Ft',
        estimated_budget || 0, overall_progress_percentage || 0, project_status || 'In Progress',
        start_date || null, expected_completion_date || null, image || '', budgetEstJSON,
        isStatus ? 1 : 0, req.user?.user_id || 1,
      ]
    )

    const [created] = await db.query('SELECT * FROM projects WHERE project_id = ?', [result.insertId])
    return res.status(201).json({ success: true, data: created[0] })
  } catch (error) {
    console.error('[Create Project Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to create project.' })
  }
}

export async function updateProject(req, res) {
  try {
    const { id } = req.params
    const {
      project_code, project_name, client_id, client_name, construction_type_id,
      construction_type_name, project_type_name, construction_stage_id, construction_stage_name,
      supervisor_id, supervisor_name, location, district, state, total_area, unit,
      estimated_budget, overall_progress_percentage, project_status, start_date,
      expected_completion_date, image, budget_estimation, status,
    } = req.body

    const isStatus = status !== false && status !== 0 && status !== 'false'
    const budgetEstJSON = budget_estimation ? JSON.stringify(budget_estimation) : null

    await db.query(
      `UPDATE projects SET 
       project_code = ?, project_name = ?, client_id = ?, client_name = ?, construction_type_id = ?, 
       construction_type_name = ?, project_type_name = ?, construction_stage_id = ?, construction_stage_name = ?, 
       supervisor_id = ?, supervisor_name = ?, location = ?, district = ?, state = ?, total_area = ?, 
       unit = ?, estimated_budget = ?, overall_progress_percentage = ?, project_status = ?, start_date = ?, 
       expected_completion_date = ?, image = ?, budget_estimation = COALESCE(?, budget_estimation), status = ?, updated_by = ? 
       WHERE project_id = ?`,
      [
        project_code, project_name, client_id || null, client_name || '', construction_type_id || null,
        construction_type_name || '', project_type_name || 'Standard Villa', construction_stage_id || null,
        construction_stage_name || '', supervisor_id || null, supervisor_name || '', location || '',
        district || '', state || '', total_area || 0, unit || 'Sq. Ft', estimated_budget || 0,
        overall_progress_percentage || 0, project_status || 'In Progress', start_date || null,
        expected_completion_date || null, image || '', budgetEstJSON, isStatus ? 1 : 0,
        req.user?.user_id || 1, id,
      ]
    )

    const [updated] = await db.query('SELECT * FROM projects WHERE project_id = ?', [id])
    return res.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('[Update Project Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to update project.' })
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params
    await db.query('DELETE FROM projects WHERE project_id = ?', [id])
    return res.json({ success: true, message: 'Project deleted successfully.' })
  } catch (error) {
    console.error('[Delete Project Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete project.' })
  }
}

export async function getHousePlan(req, res) {
  try {
    const { id } = req.params
    const [rows] = await db.query('SELECT house_plan FROM projects WHERE project_id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }
    let plan = rows[0].house_plan
    if (typeof plan === 'string') {
      try { plan = JSON.parse(plan) } catch (e) { plan = null }
    }
    return res.json({ success: true, data: plan || null })
  } catch (error) {
    console.error('[Get House Plan Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to fetch house plan.' })
  }
}

export async function saveHousePlan(req, res) {
  try {
    const { id } = req.params
    const housePlanData = req.body
    const planJSON = housePlanData ? JSON.stringify(housePlanData) : null

    await db.query('UPDATE projects SET house_plan = ?, updated_at = NOW() WHERE project_id = ?', [planJSON, id])
    const [updated] = await db.query('SELECT house_plan FROM projects WHERE project_id = ?', [id])

    let plan = updated[0]?.house_plan
    if (typeof plan === 'string') {
      try { plan = JSON.parse(plan) } catch (e) { plan = null }
    }
    return res.json({ success: true, data: plan, message: 'House plan saved successfully.' })
  } catch (error) {
    console.error('[Save House Plan Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to save house plan.' })
  }
}

export async function deleteHousePlan(req, res) {
  try {
    const { id } = req.params
    await db.query('UPDATE projects SET house_plan = NULL, updated_at = NOW() WHERE project_id = ?', [id])
    return res.json({ success: true, message: 'House plan reset successfully.' })
  } catch (error) {
    console.error('[Delete House Plan Error]', error)
    return res.status(500).json({ success: false, error: 'Failed to delete house plan.' })
  }
}

export async function validateHousePlan(req, res) {
  try {
    const building = req.body || {}
    const issues = []

    if (!building.floors || !Array.isArray(building.floors) || building.floors.length === 0) {
      issues.push('Building must have at least one floor.')
    } else {
      building.floors.forEach((floor) => {
        if (!floor.rooms || !Array.isArray(floor.rooms) || floor.rooms.length === 0) {
          issues.push(`Floor ${floor.index ?? floor.name ?? 0} has no rooms.`)
        } else {
          floor.rooms.forEach((room) => {
            if (!room.polygon || !Array.isArray(room.polygon) || room.polygon.length < 3) {
              issues.push(`Room "${room.name || room.id}" has invalid polygon geometry.`)
            }
          })
        }
      })
    }

    const status = issues.length === 0 ? 'passed' : 'failed'
    return res.json({
      success: true,
      validation: {
        status,
        totalIssues: issues.length,
        issues,
      },
    })
  } catch (error) {
    console.error('[Validate House Plan Error]', error)
    return res.status(500).json({ success: false, error: 'House plan validation failed.' })
  }
}

