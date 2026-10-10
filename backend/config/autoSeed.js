import pool from './db.js'

function getValidStageId(id) {
  const num = Number(id);
  if (num >= 1 && num <= 9) return num;
  return 5;
}

function getValidConstructionTypeId(id) {
  const num = Number(id);
  if (num >= 1 && num <= 6) return num;
  return 1;
}

function getValidEmployeeTypeId(id) {
  const num = Number(id);
  if (num >= 1 && num <= 6) return num;
  return 1;
}

export async function runAutoSeed() {
  let connection
  try {
    connection = await pool.getConnection()
    console.log('[AutoSeed] Starting database seed check...')

    // 0. Schema updates / ensure columns exist
    try {
      await connection.query(`
        ALTER TABLE employees 
        ADD COLUMN completed_projects_list JSON NULL,
        ADD COLUMN completed_tasks_list JSON NULL
      `)
    } catch (e) {}

    // 1. Seed Users
    const users = [
  {
    "user_id": 1,
    "name": "Administrator",
    "email": "admin@constructionpms.in",
    "password_hash": "password123",
    "role": "ADMIN",
    "phone": "9840012345",
    "status": "Active",
    "created_at": "2025-01-01"
  },
  {
    "user_id": 501,
    "name": "Ravi",
    "email": "ravi.kumar@gmail.com",
    "password_hash": "password123",
    "role": "CLIENT",
    "phone": "9791122334",
    "status": "Active",
    "created_at": "2025-01-10"
  },
  {
    "user_id": 502,
    "name": "Anand",
    "email": "anand.sharma@gmail.com",
    "password_hash": "password123",
    "role": "CLIENT",
    "phone": "9840998877",
    "status": "Active",
    "created_at": "2025-01-15"
  },
  {
    "user_id": 201,
    "name": "Santhosh Landowners",
    "email": "santhosh@landowners.in",
    "password_hash": "password123",
    "role": "CLIENT",
    "phone": "9841029384",
    "status": "Active",
    "created_at": "2025-12-10"
  },
  {
    "user_id": 204,
    "name": "Selvam Realities",
    "email": "selvam@realities.in",
    "password_hash": "password123",
    "role": "CLIENT",
    "phone": "9843300112",
    "status": "Active",
    "created_at": "2026-02-01"
  },
  {
    "user_id": 601,
    "name": "Arun Supervisor",
    "email": "supervisor@pms.com",
    "password_hash": "password123",
    "role": "SUPERVISOR",
    "phone": "9840011223",
    "status": "Active",
    "created_at": "2026-02-01"
  },
  {
    "user_id": 602,
    "name": "Supervisor Lead",
    "email": "supervisor@constructionpms.in",
    "password_hash": "password123",
    "role": "SUPERVISOR",
    "phone": "9840011224",
    "status": "Active",
    "created_at": "2026-02-01"
  },
  {
    "user_id": 701,
    "name": "Deepak Worker",
    "email": "worker@pms.com",
    "password_hash": "password123",
    "role": "WORKER",
    "phone": "9840055667",
    "status": "Active",
    "created_at": "2026-02-01"
  },
  {
    "user_id": 702,
    "name": "Worker Specialist",
    "email": "worker@constructionpms.in",
    "password_hash": "password123",
    "role": "WORKER",
    "phone": "9840055668",
    "status": "Active",
    "created_at": "2026-02-01"
  }
]
    for (const u of users) {
      await connection.query(
        `INSERT INTO users (user_id, name, email, password_hash, role, phone, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role), status=VALUES(status)`,
        [u.user_id, u.name, u.email, u.password_hash || 'password123', u.role, u.phone || '', u.status || 'Active']
      )
    }

    // Link Employees to User Accounts
    await connection.query(`UPDATE employees SET user_id = 601 WHERE employee_id = 1 AND (user_id IS NULL OR user_id = 0)`).catch(() => {})
    await connection.query(`UPDATE employees SET user_id = 701 WHERE employee_id = 2 AND (user_id IS NULL OR user_id = 0)`).catch(() => {})

    console.log(`[AutoSeed] Verified ${users.length} users and linked employee user accounts`)


    // 2. Seed Employee Types
    const employeeTypes = [
  {
    "employee_type_id": 1,
    "employee_type_code": "ET-01",
    "employee_type_name": "Site Supervisor",
    "description": "Oversees day-to-day execution on site",
    "status": true,
    "created_at": "2025-11-02 10:00:00",
    "created_by": 1
  },
  {
    "employee_type_id": 2,
    "employee_type_code": "ET-02",
    "employee_type_name": "Civil Engineer",
    "description": "Structural design and site engineering",
    "status": true,
    "created_at": "2025-11-02 10:00:00",
    "created_by": 1
  },
  {
    "employee_type_id": 3,
    "employee_type_code": "ET-03",
    "employee_type_name": "Mason",
    "description": "Skilled masonry and brickwork labour",
    "status": true,
    "created_at": "2025-11-04 11:30:00",
    "created_by": 1
  },
  {
    "employee_type_id": 4,
    "employee_type_code": "ET-04",
    "employee_type_name": "Electrician",
    "description": "Electrical installation and wiring",
    "status": true,
    "created_at": "2025-11-06 09:15:00",
    "created_by": 1
  },
  {
    "employee_type_id": 5,
    "employee_type_code": "ET-05",
    "employee_type_name": "Plumber",
    "description": "Plumbing and sanitary fitting",
    "status": true,
    "created_at": "2025-11-08 14:20:00",
    "created_by": 1
  },
  {
    "employee_type_id": 6,
    "employee_type_code": "ET-06",
    "employee_type_name": "Safety Officer",
    "description": "Site safety compliance and audits",
    "status": false,
    "created_at": "2025-11-10 16:45:00",
    "created_by": 1
  }
]
    for (const et of employeeTypes) {
      await connection.query(
        `INSERT INTO employee_types (employee_type_id, employee_type_code, employee_type_name, description, status) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE employee_type_name=VALUES(employee_type_name), description=VALUES(description)`,
        [et.employee_type_id, et.employee_type_code, et.employee_type_name, et.description || '', et.status ? 1 : 0]
      )
    }
    console.log(`[AutoSeed] Verified ${employeeTypes.length} employee types`)

    // 3. Seed Item Categories
    const itemCategories = [
  {
    "category_id": 1,
    "category_code": "CAT-01",
    "category_name": "Cement",
    "description": "OPC, PPC and specialty cement",
    "items_count": 6,
    "image": "/images/categories/cement.jpg",
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "category_id": 2,
    "category_code": "CAT-02",
    "category_name": "Steel",
    "description": "TMT bars, structural steel",
    "items_count": 8,
    "image": "/images/categories/steel.jpg",
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "category_id": 3,
    "category_code": "CAT-03",
    "category_name": "Bricks",
    "description": "Clay, fly-ash and AAC blocks",
    "items_count": 5,
    "image": "/images/categories/bricks.jpg",
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "category_id": 4,
    "category_code": "CAT-04",
    "category_name": "Sand",
    "description": "River and M-sand",
    "items_count": 3,
    "image": "/images/categories/sand.jpg",
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "category_id": 5,
    "category_code": "CAT-05",
    "category_name": "Electrical",
    "description": "Wires, switches, DB panels & fittings",
    "items_count": 14,
    "image": "/images/categories/electrical.jpg",
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "category_id": 6,
    "category_code": "CAT-06",
    "category_name": "Plumbing",
    "description": "CPVC/UPVC pipes, sanitary fixtures & valves",
    "items_count": 11,
    "image": "/images/categories/plumbing.jpg",
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "category_id": 7,
    "category_code": "CAT-07",
    "category_name": "Tiles",
    "description": "Floor and wall vitrified tiles",
    "items_count": 9,
    "image": "/images/categories/tiles.jpg",
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "category_id": 8,
    "category_code": "CAT-08",
    "category_name": "Paint",
    "description": "Interior emulsions & weather-proof coats",
    "items_count": 7,
    "image": "/images/categories/paint.jpg",
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  }
]
    for (const cat of itemCategories) {
      await connection.query(
        `INSERT INTO item_categories (category_id, category_code, category_name, description, icon, image, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE category_name=VALUES(category_name), description=VALUES(description)`,
        [cat.category_id, cat.category_code, cat.category_name, cat.description || '', cat.icon || 'Package', cat.image || '', cat.status ? 1 : 0]
      )
    }
    console.log(`[AutoSeed] Verified ${itemCategories.length} item categories`)

    // 4. Seed Suppliers
    const suppliers = [
  {
    "supplier_id": 1,
    "supplier_code": "SUP-01",
    "supplier_name": "Sri Balaji Cement Traders",
    "phone": "9884401122",
    "alternate_phone": "9884401199",
    "email": "contact@sribalajicement.in",
    "address_line1": "No 45, GNT Road",
    "address_line2": "Redhills Industrial Estate",
    "city": "Chennai",
    "district": "Tiruvallur",
    "state": "Tamil Nadu",
    "pincode": "600052",
    "gst_number": "33AACST1234H1Z5",
    "contact_person": "Mohan",
    "pan_number": "AACST1234H",
    "bank_name": "HDFC Bank",
    "bank_branch": "Redhills",
    "account_number": "50200012345678",
    "ifsc_code": "HDFC0000456",
    "payment_terms": "Net 30 Days",
    "delivery_capability": "500 Bags / Day",
    "rating": 4.8,
    "remarks": "Reliable supplier for bulk UltraTech & ACC cement bags.",
    "status": true,
    "created_at": "2025-10-15 10:00:00",
    "created_by": 1
  },
  {
    "supplier_id": 2,
    "supplier_code": "SUP-02",
    "supplier_name": "Chennai Steel House",
    "phone": "9884401123",
    "alternate_phone": "9884401188",
    "email": "sales@chennaisteel.in",
    "address_line1": "102, Ambattur Industrial Estate",
    "address_line2": "Phase II",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600058",
    "gst_number": "33AACST5678H1Z5",
    "contact_person": "Prakash",
    "pan_number": "AACST5678H",
    "bank_name": "State Bank of India",
    "bank_branch": "Ambattur SME",
    "account_number": "310987654321",
    "ifsc_code": "SBIN0001122",
    "payment_terms": "Net 15 Days",
    "delivery_capability": "25 Tonnes / Day",
    "rating": 4.6,
    "remarks": "Authorized Tata Tiscon & JSW TMT distributor.",
    "status": true,
    "created_at": "2025-10-18 11:30:00",
    "created_by": 1
  },
  {
    "supplier_id": 3,
    "supplier_code": "SUP-03",
    "supplier_name": "Voltage Electricals",
    "phone": "9884401124",
    "alternate_phone": "9884401177",
    "email": "info@voltageelec.in",
    "address_line1": "78, Crosscut Road",
    "address_line2": "Gandhipuram",
    "city": "Coimbatore",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "pincode": "641012",
    "gst_number": "33AACST9012H1Z5",
    "contact_person": "Anitha",
    "pan_number": "AACST9012H",
    "bank_name": "ICICI Bank",
    "bank_branch": "Gandhipuram Branch",
    "account_number": "001505012345",
    "ifsc_code": "ICIC0000015",
    "payment_terms": "Immediate / COD",
    "delivery_capability": "Full Regional Express",
    "rating": 4.4,
    "remarks": "Stockist for Polycab wires, Legrand switches and Havells DB panels.",
    "status": true,
    "created_at": "2025-10-20 14:15:00",
    "created_by": 1
  },
  {
    "supplier_id": 4,
    "supplier_code": "SUP-04",
    "supplier_name": "AquaFlow Pipes & Fittings",
    "phone": "9884401125",
    "alternate_phone": "9884401166",
    "email": "orders@aquaflow.in",
    "address_line1": "14, West Veli Street",
    "address_line2": "Simmakkal",
    "city": "Madurai",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "pincode": "625001",
    "gst_number": "33AACST3456H1Z5",
    "contact_person": "Bala",
    "pan_number": "AACST3456H",
    "bank_name": "Canara Bank",
    "bank_branch": "Simmakkal Branch",
    "account_number": "120000987654",
    "ifsc_code": "CNRB0001200",
    "payment_terms": "Net 30 Days",
    "delivery_capability": "1000 Meters / Day",
    "rating": 4.2,
    "remarks": "Specialized CPVC, UPVC and SWR Astral pipes & fittings supplier.",
    "status": true,
    "created_at": "2025-10-22 16:00:00",
    "created_by": 1
  }
]
    for (const s of suppliers) {
      await connection.query(
        `INSERT INTO suppliers (supplier_id, supplier_code, supplier_name, contact_person, phone, email, city, district, state, gst_number, address, rating, supplied_materials, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE supplier_name=VALUES(supplier_name), phone=VALUES(phone)`,
        [
          s.supplier_id, s.supplier_code, s.supplier_name, s.contact_person || '', s.phone || '', s.email || '',
          s.city || 'Chennai', s.district || 'Chennai', s.state || 'Tamil Nadu', s.gst_number || '',
          (s.address_line1 || s.address || '') + (s.address_line2 ? ', ' + s.address_line2 : ''),
          s.rating || 4.5, s.supplied_materials || s.delivery_capability || '', s.status ? 1 : 0
        ]
      )
    }
    console.log(`[AutoSeed] Verified ${suppliers.length} suppliers`)

    // 5. Seed Items
    const items = [
  {
    "item_id": 1,
    "material_id": 1,
    "item_code": "ITM-001",
    "category_id": 1,
    "category_name": "Cement",
    "material_name": "OPC 53 Grade Cement",
    "item_name": "OPC 53 Grade Cement",
    "brand": "UltraTech",
    "description": "High performance structural 53 grade OPC cement bag",
    "supplier_id": 1,
    "supplier_name": "Sri Balaji Cement Traders",
    "quantity_inhand": 480,
    "unit_of_measure": "Bag (50kg)",
    "standard_rate": 420,
    "minimum_stock_level": 200,
    "image_url": "/images/categories/cement.jpg",
    "image": "/images/categories/cement.jpg",
    "status": true,
    "created_at": "2025-11-05 09:00:00",
    "created_by": 1
  },
  {
    "item_id": 2,
    "material_id": 2,
    "item_code": "ITM-002",
    "category_id": 2,
    "category_name": "Steel",
    "material_name": "TMT Bar 12mm Fe500",
    "item_name": "TMT Bar 12mm Fe500",
    "brand": "Tata Tiscon",
    "description": "High strength thermo-mechanically treated steel rebar",
    "supplier_id": 2,
    "supplier_name": "Chennai Steel House",
    "quantity_inhand": 1600,
    "unit_of_measure": "Kg",
    "standard_rate": 68,
    "minimum_stock_level": 2000,
    "image_url": "/images/categories/steel.jpg",
    "image": "/images/categories/steel.jpg",
    "status": true,
    "created_at": "2025-11-05 09:30:00",
    "created_by": 1
  },
  {
    "item_id": 3,
    "material_id": 3,
    "item_code": "ITM-003",
    "category_id": 3,
    "category_name": "Bricks",
    "material_name": "Red Clay Brick",
    "item_name": "Red Clay Brick",
    "brand": "Local Kiln",
    "description": "Standard kiln burned red brick for load-bearing masonry",
    "supplier_id": 1,
    "supplier_name": "Sri Balaji Cement Traders",
    "quantity_inhand": 8500,
    "unit_of_measure": "Piece",
    "standard_rate": 8,
    "minimum_stock_level": 5000,
    "image_url": "/images/categories/bricks.jpg",
    "image": "/images/categories/bricks.jpg",
    "status": true,
    "created_at": "2025-11-05 10:15:00",
    "created_by": 1
  },
  {
    "item_id": 4,
    "material_id": 4,
    "item_code": "ITM-004",
    "category_id": 4,
    "category_name": "Sand",
    "material_name": "River Sand",
    "item_name": "River Sand",
    "brand": "River Bed Gold",
    "description": "Screened natural river sand suitable for plastering",
    "supplier_id": 4,
    "supplier_name": "AquaFlow Pipes & Fittings",
    "quantity_inhand": 920,
    "unit_of_measure": "Cubic Ft",
    "standard_rate": 55,
    "minimum_stock_level": 800,
    "image_url": "/images/categories/sand.jpg",
    "image": "/images/categories/sand.jpg",
    "status": true,
    "created_at": "2025-11-05 11:00:00",
    "created_by": 1
  },
  {
    "item_id": 5,
    "material_id": 5,
    "item_code": "ITM-005",
    "category_id": 5,
    "category_name": "Electrical",
    "material_name": "Copper Wire 2.5mm",
    "item_name": "Copper Wire 2.5mm",
    "brand": "Polycab",
    "description": "Flame retardant multi-strand flexible copper wire coil",
    "supplier_id": 3,
    "supplier_name": "Voltage Electricals",
    "quantity_inhand": 1450,
    "unit_of_measure": "Meter",
    "standard_rate": 24,
    "minimum_stock_level": 1000,
    "image_url": "/images/categories/electrical.jpg",
    "image": "/images/categories/electrical.jpg",
    "status": true,
    "created_at": "2025-11-05 11:45:00",
    "created_by": 1
  }
]
    for (const it of items) {
      await connection.query(
        `INSERT INTO items (item_id, item_code, item_name, category_id, brand, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE item_name=VALUES(item_name), unit_price=VALUES(unit_price)`,
        [
          it.item_id, it.item_code, it.item_name || it.material_name, (it.category_id && it.category_id <= 8) ? it.category_id : 1, it.brand || '',
          it.unit || it.unit_of_measure || 'Unit', it.unit_price || it.standard_rate || 0,
          it.stock_quantity || it.quantity_inhand || 100, it.min_stock_level || it.minimum_stock_level || 10,
          (it.supplier_id && it.supplier_id <= 4) ? it.supplier_id : 1, it.status ? 1 : 0
        ]
      )
    }
    console.log(`[AutoSeed] Verified ${items.length} items`)

    // 6. Seed Employees (24 specialists)
    const employees = [
  {
    "employee_id": 101,
    "employee_code": "EMP-FL-01",
    "employee_type_id": 3,
    "employee_type_name": "Flooring Specialist",
    "first_name": "Santhosh",
    "last_name": "",
    "phone": "9840012353",
    "email": "santhosh.n@constructionpms.in",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "service": "Flooring",
    "specialization": "Vitrified & Italian Marble Tile Laying",
    "service_rate": 1600,
    "rate_unit": "Day",
    "serviceRate": 1600,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "Green Valley Residence",
    "current_work": "Tile Laying & Epoxy Grouting",
    "current_progress": 45,
    "completed_projects_count": 8,
    "completed_work_count": 13,
    "experience_years": 5.5,
    "qualification": "Flooring Master & Tile Specialist",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Green Valley Residence",
        "service": "Flooring",
        "completed_date": "Aug 2026",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Sunrise Villa",
        "service": "Flooring",
        "completed_date": "Jun 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "City Apartment",
        "service": "Flooring",
        "completed_date": "Apr 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Ocean View Enclave",
        "service": "Flooring",
        "completed_date": "Feb 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Royal Palms Block A",
        "service": "Flooring",
        "completed_date": "Dec 2025",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Skyline Towers",
        "service": "Flooring",
        "completed_date": "Oct 2025",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "project_name": "Heritage Heights",
        "service": "Flooring",
        "completed_date": "Aug 2025",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Grand Residency",
        "service": "Flooring",
        "completed_date": "May 2025",
        "duration": "15 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Floor surface preparation",
        "project_name": "Green Valley Residence",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "2×2 Vitrified Tile Installation",
        "project_name": "Green Valley Residence",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Tile Grouting & Finishing",
        "project_name": "Sunrise Villa",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Skirting Installation",
        "project_name": "City Apartment",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Italian Marble Polishing",
        "project_name": "Ocean View Enclave",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Waterproof Screeding",
        "project_name": "Royal Palms Block A",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Anti-Skid Bathroom Tile Laying",
        "project_name": "Skyline Towers",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Balcony Deck Flooring",
        "project_name": "Heritage Heights",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Granite Staircase Tread Fitting",
        "project_name": "Grand Residency",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Sub-Floor Leveling & Curing",
        "project_name": "Green Valley Residence",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Corner Bead & Edge Finishing",
        "project_name": "Sunrise Villa",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Epoxy Grouting & Sealing",
        "project_name": "City Apartment",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Post-Laying Floor Protection",
        "project_name": "Ocean View Enclave",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 102,
    "employee_code": "EMP-FL-02",
    "employee_type_id": 3,
    "employee_type_name": "Flooring Specialist",
    "first_name": "Arun",
    "last_name": "",
    "phone": "9840012399",
    "email": "arun.flooring@constructionpms.in",
    "city": "Coimbatore",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "service": "Flooring",
    "specialization": "Granite & Large Format Slab Laying",
    "service_rate": 2000,
    "rate_unit": "Day",
    "serviceRate": 2000,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 11,
    "completed_work_count": 18,
    "experience_years": 6,
    "qualification": "Senior Granite & Marble Mason",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Coimbatore Trade Center",
        "service": "Flooring",
        "completed_date": "Jul 2026",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "Avinashi Highway Commercial",
        "service": "Flooring",
        "completed_date": "May 2026",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Tech Park Lobby",
        "service": "Flooring",
        "completed_date": "Mar 2026",
        "duration": "19 days",
        "status": "Completed"
      },
      {
        "project_name": "Singanallur Mall",
        "service": "Flooring",
        "completed_date": "Jan 2026",
        "duration": "25 days",
        "status": "Completed"
      },
      {
        "project_name": "Kovai Villa Enclave",
        "service": "Flooring",
        "completed_date": "Nov 2025",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Peelamedu Apartment",
        "service": "Flooring",
        "completed_date": "Sep 2025",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "PSG Tech Block C",
        "service": "Flooring",
        "completed_date": "Jul 2025",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Trichy Road Complex",
        "service": "Flooring",
        "completed_date": "May 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Lotus Towers",
        "service": "Flooring",
        "completed_date": "Mar 2025",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Emerald Residency",
        "service": "Flooring",
        "completed_date": "Jan 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "Vanguard Office Suites",
        "service": "Flooring",
        "completed_date": "Nov 2024",
        "duration": "17 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Granite Counter & Slab Cladding",
        "project_name": "Coimbatore Trade Center",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Heavy Duty Industrial Tile Laying",
        "project_name": "Avinashi Highway Commercial",
        "duration": "8 days",
        "status": "Completed"
      },
      {
        "task_name": "Mirror Polish Finishing",
        "project_name": "Tech Park Lobby",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Granite Staircase Tread Fitting",
        "project_name": "Singanallur Mall",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Italian Marble Base Leveling",
        "project_name": "Kovai Villa Enclave",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Patterned Wooden Tile Installation",
        "project_name": "Peelamedu Apartment",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Acid Proof Flooring Setup",
        "project_name": "PSG Tech Block C",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Porcelain Tile Grouting",
        "project_name": "Trichy Road Complex",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Terrace Waterproof Tile Laying",
        "project_name": "Lotus Towers",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Skirting Joint Alignment",
        "project_name": "Emerald Residency",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Entrance Foyer Marble Inlay",
        "project_name": "Vanguard Office Suites",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Floor Cleaning & Sealing",
        "project_name": "Coimbatore Trade Center",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Grout Sealing & Waterproofing",
        "project_name": "Avinashi Highway Commercial",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Ramp Anti-Skid Groove Cutting",
        "project_name": "Peelamedu Apartment",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Kitchen Platform Granite Fitting",
        "project_name": "Kovai Villa Enclave",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Stair Nosing Installation",
        "project_name": "PSG Tech Block C",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Floor Expansion Joint Sealing",
        "project_name": "Singanallur Mall",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Surface Level Inspection & Sign-off",
        "project_name": "Lotus Towers",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 103,
    "employee_code": "EMP-FL-03",
    "employee_type_id": 3,
    "employee_type_name": "Flooring Specialist",
    "first_name": "Prakash",
    "last_name": "",
    "phone": "9840012388",
    "email": "prakash.flooring@constructionpms.in",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "service": "Flooring",
    "specialization": "Residential Vitrified & Wooden Flooring",
    "service_rate": 1450,
    "rate_unit": "Day",
    "serviceRate": 1450,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 6,
    "completed_work_count": 10,
    "experience_years": 4,
    "qualification": "Certified Tile Mason",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "ECR Beach House",
        "service": "Flooring",
        "completed_date": "Jul 2026",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "project_name": "Adyar Residential Plot",
        "service": "Flooring",
        "completed_date": "May 2026",
        "duration": "11 days",
        "status": "Completed"
      },
      {
        "project_name": "Velachery Apartment",
        "service": "Flooring",
        "completed_date": "Mar 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Residence",
        "service": "Flooring",
        "completed_date": "Jan 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "OMR Tech Duplex",
        "service": "Flooring",
        "completed_date": "Nov 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Thiruvanmiyur Villa",
        "service": "Flooring",
        "completed_date": "Sep 2025",
        "duration": "13 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Bedroom Wooden Plank Tile Laying",
        "project_name": "ECR Beach House",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Hall Vitrified Tile Installation",
        "project_name": "Adyar Residential Plot",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Kitchen Wall Dadoing",
        "project_name": "Velachery Apartment",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Balcony Anti-skid Tile Work",
        "project_name": "Anna Nagar Residence",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Tile Edge Chamfering & Grouting",
        "project_name": "OMR Tech Duplex",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Floor Screeding & Mortar Base",
        "project_name": "Thiruvanmiyur Villa",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Granite Threshold Fitting",
        "project_name": "ECR Beach House",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Skirting Fixing & Alignment",
        "project_name": "Velachery Apartment",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Bathroom Tile Waterproof Pointing",
        "project_name": "Anna Nagar Residence",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Floor Cleaning & Waxing",
        "project_name": "OMR Tech Duplex",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 104,
    "employee_code": "EMP-FL-04",
    "employee_type_id": 3,
    "employee_type_name": "Flooring Specialist",
    "first_name": "Suresh",
    "last_name": "",
    "phone": "9840012377",
    "email": "suresh.v@constructionpms.in",
    "city": "Salem",
    "district": "Salem",
    "state": "Tamil Nadu",
    "service": "Flooring",
    "specialization": "Commercial Granite & Heavy Duty Flooring",
    "service_rate": 1900,
    "rate_unit": "Day",
    "serviceRate": 1900,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "City Hospital Block B",
    "current_work": "Granite Flooring & Corridor Cladding",
    "current_progress": 65,
    "completed_projects_count": 14,
    "completed_work_count": 25,
    "experience_years": 7,
    "qualification": "Senior Master Tile & Stone Mason",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Salem Government Hospital",
        "service": "Flooring",
        "completed_date": "Aug 2026",
        "duration": "25 days",
        "status": "Completed"
      },
      {
        "project_name": "City Hospital Block B",
        "service": "Flooring",
        "completed_date": "Jun 2026",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Salem Railway Junction Mall",
        "service": "Flooring",
        "completed_date": "Apr 2026",
        "duration": "28 days",
        "status": "Completed"
      },
      {
        "project_name": "Steel Plant Admin Block",
        "service": "Flooring",
        "completed_date": "Feb 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Shevaroy Hotel Suite",
        "service": "Flooring",
        "completed_date": "Dec 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Yercaud Resort Villa",
        "service": "Flooring",
        "completed_date": "Oct 2025",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Mettur Thermal Complex",
        "service": "Flooring",
        "completed_date": "Aug 2025",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "Namakkal Transport Hub",
        "service": "Flooring",
        "completed_date": "Jun 2025",
        "duration": "19 days",
        "status": "Completed"
      },
      {
        "project_name": "Erode Textile Park",
        "service": "Flooring",
        "completed_date": "Apr 2025",
        "duration": "24 days",
        "status": "Completed"
      },
      {
        "project_name": "Karur Bank Building",
        "service": "Flooring",
        "completed_date": "Feb 2025",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Salem Tech Park Tower A",
        "service": "Flooring",
        "completed_date": "Dec 2024",
        "duration": "21 days",
        "status": "Completed"
      },
      {
        "project_name": "Green Valley Phase 1",
        "service": "Flooring",
        "completed_date": "Oct 2024",
        "duration": "17 days",
        "status": "Completed"
      },
      {
        "project_name": "Heritage Palace Banquet",
        "service": "Flooring",
        "completed_date": "Aug 2024",
        "duration": "26 days",
        "status": "Completed"
      },
      {
        "project_name": "Kaveri Hospital Block C",
        "service": "Flooring",
        "completed_date": "Jun 2024",
        "duration": "20 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Granite Corridor Slab Laying",
        "project_name": "Salem Government Hospital",
        "duration": "8 days",
        "status": "Completed"
      },
      {
        "task_name": "ICU Floor Vinyl & Anti-bacterial Laying",
        "project_name": "City Hospital Block B",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Mall Atrium Marble Medallion Fitting",
        "project_name": "Salem Railway Junction Mall",
        "duration": "9 days",
        "status": "Completed"
      },
      {
        "task_name": "Heavy Duty Epoxy Floor Coating",
        "project_name": "Steel Plant Admin Block",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Wooden Finish Laminate Installation",
        "project_name": "Shevaroy Hotel Suite",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Natural Stone Paving in Courtyard",
        "project_name": "Yercaud Resort Villa",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Factory Flooring Screeding & Hardening",
        "project_name": "Mettur Thermal Complex",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Kerb Stone & Paver Block Laying",
        "project_name": "Namakkal Transport Hub",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Polished Vitrified Tile Grouting",
        "project_name": "Erode Textile Park",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Vault Room Reinforced Slab Flooring",
        "project_name": "Karur Bank Building",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Elevator Lobby Granite Border Fitting",
        "project_name": "Salem Tech Park Tower A",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Living Room Marble Leveling",
        "project_name": "Green Valley Phase 1",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Banquet Hall Carpet Tile Setup",
        "project_name": "Heritage Palace Banquet",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Operation Theatre Seamless Flooring",
        "project_name": "Kaveri Hospital Block C",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Skirting Joint Epoxy Filling",
        "project_name": "City Hospital Block B",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Staircase Tread & Riser Granite Fixing",
        "project_name": "Salem Government Hospital",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Balcony Drain Slope Tile Fixing",
        "project_name": "Shevaroy Hotel Suite",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Bathroom Dado Waterproof Tile Work",
        "project_name": "Yercaud Resort Villa",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Dumbwaiter Shaft Tile Cladding",
        "project_name": "Kaveri Hospital Block C",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Entrance Steps Flame-Finished Granite",
        "project_name": "Salem Tech Park Tower A",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Floor Level Laser Survey & Marking",
        "project_name": "Salem Railway Junction Mall",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Sub-floor Moisture Barrier Membrane Setup",
        "project_name": "Steel Plant Admin Block",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Tile Spacer Alignment & Fixing",
        "project_name": "Erode Textile Park",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Chemical Wash & Stain Removal",
        "project_name": "Heritage Palace Banquet",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Quality Inspection & Handover",
        "project_name": "Namakkal Transport Hub",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 1,
    "employee_code": "EMP-101",
    "employee_type_id": 1,
    "employee_type_name": "Carpenter Master",
    "first_name": "Arun",
    "last_name": "",
    "phone": "9840012345",
    "email": "arun.kumar@constructionpms.in",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "service": "Carpentry",
    "specialization": "Residential Carpentry & Modular Kitchen",
    "service_rate": 1750,
    "rate_unit": "Day",
    "serviceRate": 1750,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 8,
    "completed_work_count": 12,
    "experience_years": 6,
    "qualification": "Master Wood Craftsman",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Green Valley Residence",
        "service": "Carpentry",
        "completed_date": "Jul 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Villa",
        "service": "Carpentry",
        "completed_date": "May 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Adyar Apartment",
        "service": "Carpentry",
        "completed_date": "Mar 2026",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "ECR Coastal Home",
        "service": "Carpentry",
        "completed_date": "Jan 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Velachery Duplex",
        "service": "Carpentry",
        "completed_date": "Nov 2025",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "OMR Penthouse",
        "service": "Carpentry",
        "completed_date": "Sep 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Mylapore Heritage Bungalow",
        "service": "Carpentry",
        "completed_date": "Jul 2025",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "Nungambakkam Suites",
        "service": "Carpentry",
        "completed_date": "May 2025",
        "duration": "13 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Teak Main Door Frame Fabrication",
        "project_name": "Green Valley Residence",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Modular Kitchen Carcass Assembly",
        "project_name": "Green Valley Residence",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Master Bedroom Wardrobe Shutter Fitting",
        "project_name": "Anna Nagar Villa",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "TV Unit & Crockery Cabinet Panelling",
        "project_name": "Adyar Apartment",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Flush Door Hinge & Lock Installation",
        "project_name": "ECR Coastal Home",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Wooden Ceiling Rafter Fitting",
        "project_name": "Velachery Duplex",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Plywood Loft Cover Construction",
        "project_name": "OMR Penthouse",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Carved Wood Window Frame Restoration",
        "project_name": "Mylapore Heritage Bungalow",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Laminate Edge Banding & Finishing",
        "project_name": "Nungambakkam Suites",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Bathroom Vaneer Vanity Counter Work",
        "project_name": "Green Valley Residence",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Pooja Unit Carving & Hardware Setup",
        "project_name": "Anna Nagar Villa",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Shoe Rack & Foyer Panelling",
        "project_name": "Adyar Apartment",
        "duration": "2 days",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 3,
    "employee_code": "EMP-103",
    "employee_type_id": 1,
    "employee_type_name": "Carpentry Specialist",
    "first_name": "Suresh",
    "last_name": "",
    "phone": "9840012347",
    "email": "suresh.iyer@constructionpms.in",
    "city": "Coimbatore",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "service": "Carpentry",
    "specialization": "Commercial Woodwork & Shuttering",
    "service_rate": 1650,
    "rate_unit": "Day",
    "serviceRate": 1650,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "City Hospital Block B",
    "current_work": "Door Frame & Shuttering",
    "current_progress": 45,
    "completed_projects_count": 11,
    "completed_work_count": 18,
    "experience_years": 5,
    "qualification": "Diploma in Civil Construction",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "City Hospital Block B",
        "service": "Carpentry",
        "completed_date": "Aug 2026",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Coimbatore IT Tower",
        "service": "Carpentry",
        "completed_date": "Jun 2026",
        "duration": "24 days",
        "status": "Completed"
      },
      {
        "project_name": "Kovai Shopping Center",
        "service": "Carpentry",
        "completed_date": "Apr 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Peelamedu Tech Park",
        "service": "Carpentry",
        "completed_date": "Feb 2026",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Singanallur College Block",
        "service": "Carpentry",
        "completed_date": "Dec 2025",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "Avinashi Highway Hotel",
        "service": "Carpentry",
        "completed_date": "Oct 2025",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Race Course Villa",
        "service": "Carpentry",
        "completed_date": "Aug 2025",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "PSG Hospital Annex",
        "service": "Carpentry",
        "completed_date": "Jun 2025",
        "duration": "19 days",
        "status": "Completed"
      },
      {
        "project_name": "Gandhipuram Commercials",
        "service": "Carpentry",
        "completed_date": "Apr 2025",
        "duration": "17 days",
        "status": "Completed"
      },
      {
        "project_name": "Saravanampatti Enclave",
        "service": "Carpentry",
        "completed_date": "Feb 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "R S Puram Duplex",
        "service": "Carpentry",
        "completed_date": "Dec 2024",
        "duration": "15 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Fire Rated Door Frame Installation",
        "project_name": "City Hospital Block B",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Acoustic Wall Wood Panelling",
        "project_name": "Coimbatore IT Tower",
        "duration": "8 days",
        "status": "Completed"
      },
      {
        "task_name": "Display Counter & Kiosk Woodwork",
        "project_name": "Kovai Shopping Center",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Formwork Plywood Shuttering",
        "project_name": "Peelamedu Tech Park",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Auditorium Stage Wood Work",
        "project_name": "Singanallur College Block",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Banquet Hall Wood Moulding",
        "project_name": "Avinashi Highway Hotel",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Teak Wood Window Shutter Assembly",
        "project_name": "Race Course Villa",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Nurse Station Counter Fabrication",
        "project_name": "PSG Hospital Annex",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Partition Wall Wooden Framework",
        "project_name": "Gandhipuram Commercials",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Modular Wardrobe Box Fixing",
        "project_name": "Saravanampatti Enclave",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Staircase Handrail Wood Carving",
        "project_name": "R S Puram Duplex",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Door Hardware & Mortise Lock Setup",
        "project_name": "City Hospital Block B",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Executive Cabin Veneer Panelling",
        "project_name": "Coimbatore IT Tower",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "FALSE Ceiling Wooden Gridwork",
        "project_name": "Peelamedu Tech Park",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Library Bookshelf Framing",
        "project_name": "Singanallur College Block",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Laminate Surface Pressing & Trimming",
        "project_name": "Avinashi Highway Hotel",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Window Sill Wooden Casing",
        "project_name": "Race Course Villa",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Polish & Lacquer Coating Check",
        "project_name": "R S Puram Duplex",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 6,
    "employee_code": "EMP-106",
    "employee_type_id": 1,
    "employee_type_name": "Carpenter Master",
    "first_name": "Manoj",
    "last_name": "",
    "phone": "9840012350",
    "email": "manoj.k@constructionpms.in",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "service": "Carpentry",
    "specialization": "Custom Teak Doors & Built-in Wardrobes",
    "service_rate": 2200,
    "rate_unit": "Day",
    "serviceRate": 2200,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "Green Valley Residence",
    "current_work": "Wardrobe Fitting",
    "current_progress": 70,
    "completed_projects_count": 14,
    "completed_work_count": 25,
    "experience_years": 9,
    "qualification": "Master Craftsman",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Poes Garden Residence",
        "service": "Carpentry",
        "completed_date": "Aug 2026",
        "duration": "28 days",
        "status": "Completed"
      },
      {
        "project_name": "Boat Club Villa",
        "service": "Carpentry",
        "completed_date": "Jun 2026",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "ECR Beach Palace",
        "service": "Carpentry",
        "completed_date": "Apr 2026",
        "duration": "30 days",
        "status": "Completed"
      },
      {
        "project_name": "Green Valley Residence",
        "service": "Carpentry",
        "completed_date": "Feb 2026",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Nungambakkam High Rise",
        "service": "Carpentry",
        "completed_date": "Dec 2025",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Alwarpet Duplex",
        "service": "Carpentry",
        "completed_date": "Oct 2025",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Kotturpuram Penthouse",
        "service": "Carpentry",
        "completed_date": "Aug 2025",
        "duration": "25 days",
        "status": "Completed"
      },
      {
        "project_name": "RA Puram Luxury Flat",
        "service": "Carpentry",
        "completed_date": "Jun 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Velachery IT Enclave",
        "service": "Carpentry",
        "completed_date": "Apr 2025",
        "duration": "19 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar West Villa",
        "service": "Carpentry",
        "completed_date": "Feb 2025",
        "duration": "17 days",
        "status": "Completed"
      },
      {
        "project_name": "T Nagar Commercial Complex",
        "service": "Carpentry",
        "completed_date": "Dec 2024",
        "duration": "21 days",
        "status": "Completed"
      },
      {
        "project_name": "Madipakkam Gated Layout",
        "service": "Carpentry",
        "completed_date": "Oct 2024",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Chromepet Residency",
        "service": "Carpentry",
        "completed_date": "Aug 2024",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "Guindy Tech Park Block 2",
        "service": "Carpentry",
        "completed_date": "Jun 2024",
        "duration": "26 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Burma Teak Main Entrance Door Carving",
        "project_name": "Poes Garden Residence",
        "duration": "9 days",
        "status": "Completed"
      },
      {
        "task_name": "Walk-in Closet Hardwood Fitting",
        "project_name": "Boat Club Villa",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Spiral Wooden Staircase Handrail",
        "project_name": "ECR Beach Palace",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "task_name": "Master Bedroom Wardrobe Construction",
        "project_name": "Green Valley Residence",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Veneer Panelling for TV Console",
        "project_name": "Nungambakkam High Rise",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Modular Island Kitchen Framing",
        "project_name": "Alwarpet Duplex",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Teak Window Shutter & Frame Fixing",
        "project_name": "Kotturpuram Penthouse",
        "duration": "8 days",
        "status": "Completed"
      },
      {
        "task_name": "Dining Room Crockery Cabinet",
        "project_name": "RA Puram Luxury Flat",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Acoustic Wood Panelling for Home Theater",
        "project_name": "Velachery IT Enclave",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Pooja Mandapam Teak Wood Carving",
        "project_name": "Anna Nagar West Villa",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Conference Table Teak Top Finishing",
        "project_name": "T Nagar Commercial Complex",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Balcony Decking Teak Joist Laying",
        "project_name": "Madipakkam Gated Layout",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Interior Flush Door Frame Anchoring",
        "project_name": "Chromepet Residency",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Office Cubicle Partition Woodwork",
        "project_name": "Guindy Tech Park Block 2",
        "duration": "8 days",
        "status": "Completed"
      },
      {
        "task_name": "Melamine Polish Base Preparation",
        "project_name": "Poes Garden Residence",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Soft-close Drawer Runner Installation",
        "project_name": "Green Valley Residence",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Hidden Magnetic Catch & Hinge Setup",
        "project_name": "Boat Club Villa",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Wooden Skirting Grooving & Polish",
        "project_name": "Alwarpet Duplex",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Laminate Pressing for Wardrobe Doors",
        "project_name": "Nungambakkam High Rise",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Corner Storage Carousel Unit Fitting",
        "project_name": "ECR Beach Palace",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Glass Inlay Wooden Window Frame",
        "project_name": "Kotturpuram Penthouse",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Study Desk Floating Shelf Assembly",
        "project_name": "RA Puram Luxury Flat",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Bed Headboard Wood Cushion Frame",
        "project_name": "Anna Nagar West Villa",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Lock & Brass Fitting Alignment",
        "project_name": "T Nagar Commercial Complex",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Quality Polish Audit",
        "project_name": "Poes Garden Residence",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 105,
    "employee_code": "EMP-CR-04",
    "employee_type_id": 1,
    "employee_type_name": "Carpentry Specialist",
    "first_name": "Balaji",
    "last_name": "",
    "phone": "9840012366",
    "email": "balaji.r@constructionpms.in",
    "city": "Madurai",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "service": "Carpentry",
    "specialization": "Residential Plywood & Laminate Woodwork",
    "service_rate": 1500,
    "rate_unit": "Day",
    "serviceRate": 1500,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 7,
    "completed_work_count": 11,
    "experience_years": 4.5,
    "qualification": "Diploma in Woodworking Technology",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Madurai Bypass Villa",
        "service": "Carpentry",
        "completed_date": "Jul 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "KK Nagar Apartment",
        "service": "Carpentry",
        "completed_date": "May 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Meenakshi Enclave",
        "service": "Carpentry",
        "completed_date": "Mar 2026",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Tallakulam Commercial Block",
        "service": "Carpentry",
        "completed_date": "Jan 2026",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Madurai Home",
        "service": "Carpentry",
        "completed_date": "Nov 2025",
        "duration": "11 days",
        "status": "Completed"
      },
      {
        "project_name": "Sellur Residency",
        "service": "Carpentry",
        "completed_date": "Sep 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "Mattuthavani Suites",
        "service": "Carpentry",
        "completed_date": "Jul 2025",
        "duration": "10 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Modular Kitchen Base Unit Assembly",
        "project_name": "Madurai Bypass Villa",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Plywood Loft Frame Construction",
        "project_name": "KK Nagar Apartment",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Bedroom Wardrobe Shutter Hanging",
        "project_name": "Meenakshi Enclave",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Reception Counter Wooden Framework",
        "project_name": "Tallakulam Commercial Block",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Teak Door Frame Fixing & Mortising",
        "project_name": "Anna Nagar Madurai Home",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Crockery Unit Laminate Pressing",
        "project_name": "Sellur Residency",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Window Wooden Casing & Shutter Work",
        "project_name": "Mattuthavani Suites",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Hydraulic Hinge & Soft Close Setup",
        "project_name": "Madurai Bypass Villa",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "TV Console Panelling Work",
        "project_name": "Meenakshi Enclave",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Edge Banding & Surface Touch-up",
        "project_name": "KK Nagar Apartment",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Shoe Cabinet & Foyer Partition",
        "project_name": "Tallakulam Commercial Block",
        "duration": "3 days",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 4,
    "employee_code": "EMP-104",
    "employee_type_id": 4,
    "employee_type_name": "Electrician",
    "first_name": "Vignesh",
    "last_name": "",
    "phone": "9840012348",
    "email": "vignesh.p@constructionpms.in",
    "city": "Madurai",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "service": "Electrical",
    "specialization": "Industrial Wiring & DB Panel Setup",
    "service_rate": 1400,
    "rate_unit": "Day",
    "serviceRate": 1400,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 9,
    "completed_work_count": 14,
    "experience_years": 4,
    "qualification": "ITI Electrical Technician",
    "gender": "Male",
    "employment_status": "Contract",
    "profile_image": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Madurai Auto Parts Plant",
        "service": "Electrical",
        "completed_date": "Jul 2026",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "KK Nagar Mall",
        "service": "Electrical",
        "completed_date": "May 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Granite Processing Factory",
        "service": "Electrical",
        "completed_date": "Mar 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "City Hospital Block B",
        "service": "Electrical",
        "completed_date": "Jan 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Substation Feeder Pillar Site",
        "service": "Electrical",
        "completed_date": "Nov 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Vadamalayan Hospital Annex",
        "service": "Electrical",
        "completed_date": "Sep 2025",
        "duration": "11 days",
        "status": "Completed"
      },
      {
        "project_name": "Mattuthavani Bus Stand Block",
        "service": "Electrical",
        "completed_date": "Jul 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "Ring Road Commercials",
        "service": "Electrical",
        "completed_date": "May 2025",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "project_name": "TVS Industrial Layout",
        "service": "Electrical",
        "completed_date": "Mar 2025",
        "duration": "14 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Main Distribution Board (MDB) Wiring",
        "project_name": "Madurai Auto Parts Plant",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "3-Phase Busbar Trunking & Earthing",
        "project_name": "KK Nagar Mall",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Cable Tray Routing & Heavy Armoured Cable Laying",
        "project_name": "Granite Processing Factory",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "ICU Bed Head Panel Wiring",
        "project_name": "City Hospital Block B",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Transformer Secondary Busbar Connection",
        "project_name": "Substation Feeder Pillar Site",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Emergency Lighting Circuit Setup",
        "project_name": "Vadamalayan Hospital Annex",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "High Mast Floodlight Cable Termination",
        "project_name": "Mattuthavani Bus Stand Block",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Switchgear Panel Testing & Calibration",
        "project_name": "Ring Road Commercials",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Copper Plate Earth Pit Installation",
        "project_name": "TVS Industrial Layout",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Wall Conduit Chipping & Box Embedding",
        "project_name": "Madurai Auto Parts Plant",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "MCB & ELCB Breakertest Inspection",
        "project_name": "KK Nagar Mall",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "DG Synchronizing Panel Cable Glanding",
        "project_name": "Granite Processing Factory",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "UPS Battery Bank Interconnection",
        "project_name": "City Hospital Block B",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Insulation Resistance Test",
        "project_name": "Substation Feeder Pillar Site",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 7,
    "employee_code": "EMP-107",
    "employee_type_id": 4,
    "employee_type_name": "Senior Electrician",
    "first_name": "Rajesh",
    "last_name": "",
    "phone": "9840012351",
    "email": "rajesh.k@constructionpms.in",
    "city": "Coimbatore",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "service": "Electrical",
    "specialization": "Commercial Conduiting & Smart Lighting",
    "service_rate": 1800,
    "rate_unit": "Day",
    "serviceRate": 1800,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "Tech Park IT Tower",
    "current_work": "DB Panel Fitting & Cable Laying",
    "current_progress": 80,
    "completed_projects_count": 12,
    "completed_work_count": 19,
    "experience_years": 7,
    "qualification": "Diploma Electrical Engg",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Tech Park IT Tower",
        "service": "Electrical",
        "completed_date": "Aug 2026",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "Avinashi Road Corporate Office",
        "service": "Electrical",
        "completed_date": "Jun 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "TIDEL Park Phase 2",
        "service": "Electrical",
        "completed_date": "Apr 2026",
        "duration": "25 days",
        "status": "Completed"
      },
      {
        "project_name": "Kovai Medical Center Annex",
        "service": "Electrical",
        "completed_date": "Feb 2026",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Brookefields Mall Suite",
        "service": "Electrical",
        "completed_date": "Dec 2025",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "PSG College Science Block",
        "service": "Electrical",
        "completed_date": "Oct 2025",
        "duration": "19 days",
        "status": "Completed"
      },
      {
        "project_name": "RS Puram Penthouse",
        "service": "Electrical",
        "completed_date": "Aug 2025",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Singanallur Commercial Plaza",
        "service": "Electrical",
        "completed_date": "Jun 2025",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Peelamedu Apartment Block",
        "service": "Electrical",
        "completed_date": "Apr 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Race Course Villa Enclave",
        "service": "Electrical",
        "completed_date": "Feb 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "Trichy Road Hotel",
        "service": "Electrical",
        "completed_date": "Dec 2024",
        "duration": "17 days",
        "status": "Completed"
      },
      {
        "project_name": "Peelamedu Software Park",
        "service": "Electrical",
        "completed_date": "Oct 2024",
        "duration": "21 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Server Room Dual Power DB Panel Setup",
        "project_name": "Tech Park IT Tower",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "DALI Smart Lighting System Wiring",
        "project_name": "Avinashi Road Corporate Office",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Substation HT Cable Termination & Jointing",
        "project_name": "TIDEL Park Phase 2",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Isolation Transformer & Medical DB Fitting",
        "project_name": "Kovai Medical Center Annex",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Showroom Track & Accent Lighting Circuit",
        "project_name": "Brookefields Mall Suite",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Laboratory Underground Cable Trenching",
        "project_name": "PSG College Science Block",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Home Automation Conduit & Sensor Wiring",
        "project_name": "RS Puram Penthouse",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Sub-main DB Power Distribution",
        "project_name": "Singanallur Commercial Plaza",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Conduit Drop & Switch Socket Mounting",
        "project_name": "Peelamedu Apartment Block",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Landscape Garden Lighting Cable Laying",
        "project_name": "Race Course Villa Enclave",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Kitchen Exhaust Heavy Cable Connection",
        "project_name": "Trichy Road Hotel",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Rooftop Solar Inverter AC DB Connection",
        "project_name": "Peelamedu Software Park",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Earthing Pit Resistance Measurement",
        "project_name": "Tech Park IT Tower",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Modular Switch Plate Alignment",
        "project_name": "Avinashi Road Corporate Office",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Cable Tagging & Schedule Documenting",
        "project_name": "TIDEL Park Phase 2",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Emergency Generator Changeover Test",
        "project_name": "Kovai Medical Center Annex",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "LED Strip Channel Fitting & Driver Wiring",
        "project_name": "RS Puram Penthouse",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Fire Alarm Loop Wiring",
        "project_name": "Singanallur Commercial Plaza",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Megger & Insulation Audit",
        "project_name": "Tech Park IT Tower",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 107,
    "employee_code": "EMP-EL-03",
    "employee_type_id": 4,
    "employee_type_name": "Electrical Specialist",
    "first_name": "Anbarasu",
    "last_name": "",
    "phone": "9840012355",
    "email": "anbarasu.t@constructionpms.in",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "service": "Electrical",
    "specialization": "Residential Wiring & DB Setup",
    "service_rate": 1550,
    "rate_unit": "Day",
    "serviceRate": 1550,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 10,
    "completed_work_count": 15,
    "experience_years": 5.5,
    "qualification": "Licensed Electrical Wireman",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Green Valley Villa Plot 14",
        "service": "Electrical",
        "completed_date": "Jul 2026",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "ECR Beach House",
        "service": "Electrical",
        "completed_date": "May 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Adyar Residential Villa",
        "service": "Electrical",
        "completed_date": "Mar 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Luxury Flat",
        "service": "Electrical",
        "completed_date": "Jan 2026",
        "duration": "11 days",
        "status": "Completed"
      },
      {
        "project_name": "Velachery Gated Villa",
        "service": "Electrical",
        "completed_date": "Nov 2025",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Mylapore Heritage House",
        "service": "Electrical",
        "completed_date": "Sep 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "OMR Duplex Flat",
        "service": "Electrical",
        "completed_date": "Jul 2025",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Kotturpuram Suite",
        "service": "Electrical",
        "completed_date": "May 2025",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "project_name": "Thiruvanmiyur Plot",
        "service": "Electrical",
        "completed_date": "Mar 2025",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Porur Heights",
        "service": "Electrical",
        "completed_date": "Jan 2025",
        "duration": "15 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Conduit Chipping & Wall Box Embedding",
        "project_name": "Green Valley Villa Plot 14",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Main Distribution Box Wiring & ELCB",
        "project_name": "ECR Beach House",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Finolex FRLS Copper Wire Pulling",
        "project_name": "Adyar Residential Villa",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Modular Switch Plate & Socket Fixing",
        "project_name": "Anna Nagar Luxury Flat",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Inverter Backup Circuit Wiring",
        "project_name": "Velachery Gated Villa",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Cove & Concealed LED Light Point Wiring",
        "project_name": "Mylapore Heritage House",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "3-Phase AC Outdoor Unit Power Point Setup",
        "project_name": "OMR Duplex Flat",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Geyser & Water Heater Power Outlet Wiring",
        "project_name": "Kotturpuram Suite",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Chemical Pipe Earth Pit Setup",
        "project_name": "Thiruvanmiyur Plot",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Staircase 2-Way Switch Control Wiring",
        "project_name": "Porur Heights",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Exhaust Fan & Chimney Socket Wiring",
        "project_name": "Green Valley Villa Plot 14",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Exterior Gate Light Conduit Routing",
        "project_name": "ECR Beach House",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "DB Circuit Load Balancing Check",
        "project_name": "Adyar Residential Villa",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Video Door Phone Cable Laying",
        "project_name": "Anna Nagar Luxury Flat",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Continuity & Voltage Testing",
        "project_name": "Velachery Gated Villa",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 108,
    "employee_code": "EMP-EL-04",
    "employee_type_id": 4,
    "employee_type_name": "Electrical Specialist",
    "first_name": "Karthik",
    "last_name": "",
    "phone": "9840012344",
    "email": "karthik.r@constructionpms.in",
    "city": "Salem",
    "district": "Salem",
    "state": "Tamil Nadu",
    "service": "Electrical",
    "specialization": "Industrial Substation & Commercial Electricals",
    "service_rate": 2100,
    "rate_unit": "Day",
    "serviceRate": 2100,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "Grand Mall Complex",
    "current_work": "Substation Transformer Wiring",
    "current_progress": 50,
    "completed_projects_count": 15,
    "completed_work_count": 22,
    "experience_years": 8,
    "qualification": "Senior Electrical Supervisor",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Salem Steel Plant Annex",
        "service": "Electrical",
        "completed_date": "Aug 2026",
        "duration": "26 days",
        "status": "Completed"
      },
      {
        "project_name": "Grand Mall Complex",
        "service": "Electrical",
        "completed_date": "Jun 2026",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "Salem Textile Mill",
        "service": "Electrical",
        "completed_date": "Apr 2026",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Namakkal Cold Storage",
        "service": "Electrical",
        "completed_date": "Feb 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Erode Processing Unit",
        "service": "Electrical",
        "completed_date": "Dec 2025",
        "duration": "24 days",
        "status": "Completed"
      },
      {
        "project_name": "Mettur Hydro Station Site",
        "service": "Electrical",
        "completed_date": "Oct 2025",
        "duration": "28 days",
        "status": "Completed"
      },
      {
        "project_name": "Karur Commercial Tower",
        "service": "Electrical",
        "completed_date": "Aug 2025",
        "duration": "19 days",
        "status": "Completed"
      },
      {
        "project_name": "Salem Hospital Extension",
        "service": "Electrical",
        "completed_date": "Jun 2025",
        "duration": "17 days",
        "status": "Completed"
      },
      {
        "project_name": "Yercaud Hotel Project",
        "service": "Electrical",
        "completed_date": "Apr 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Namakkal Transport Terminal",
        "service": "Electrical",
        "completed_date": "Feb 2025",
        "duration": "21 days",
        "status": "Completed"
      },
      {
        "project_name": "Steel Authority Substation",
        "service": "Electrical",
        "completed_date": "Dec 2024",
        "duration": "25 days",
        "status": "Completed"
      },
      {
        "project_name": "Erode Spinning Mill",
        "service": "Electrical",
        "completed_date": "Oct 2024",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Salem Bank Head Office",
        "service": "Electrical",
        "completed_date": "Aug 2024",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Kaveri Hospital Block A",
        "service": "Electrical",
        "completed_date": "Jun 2024",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Salem Railway IT Center",
        "service": "Electrical",
        "completed_date": "Apr 2024",
        "duration": "18 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "11KV HT Substation Transformer Cable Glanding",
        "project_name": "Salem Steel Plant Annex",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Commercial Escalator & Lift Power Wiring",
        "project_name": "Grand Mall Complex",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Capacitor Bank & APFC Panel Installation",
        "project_name": "Salem Textile Mill",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Refrigeration Compressor Motor Control Wiring",
        "project_name": "Namakkal Cold Storage",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Industrial Cable Tray Suspension Setup",
        "project_name": "Erode Processing Unit",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Control Room Relay & SCADA Cable Wiring",
        "project_name": "Mettur Hydro Station Site",
        "duration": "8 days",
        "status": "Completed"
      },
      {
        "task_name": "Building Management System (BMS) Panel Setup",
        "project_name": "Karur Commercial Tower",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "X-Ray & MRI Room Shielded Power Circuit",
        "project_name": "Salem Hospital Extension",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Outdoor Pathway Bollard Light Wiring",
        "project_name": "Yercaud Hotel Project",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Terminal Bus Station High Mast Earth Grid",
        "project_name": "Namakkal Transport Terminal",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Substation Vacuum Circuit Breaker (VCB) Setup",
        "project_name": "Steel Authority Substation",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Heavy Duty Motor Starter Panel Wiring",
        "project_name": "Erode Spinning Mill",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "UPS Room Battery Rack Power Cabling",
        "project_name": "Salem Bank Head Office",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Clean Room Sealed Electrical Conduit Fitting",
        "project_name": "Kaveri Hospital Block A",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Server Rack PDU Cable Glanding & Dressing",
        "project_name": "Salem Railway IT Center",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Substation Earth Mat Welding & Testing",
        "project_name": "Salem Steel Plant Annex",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Lightning Arrester Roof Conduiting",
        "project_name": "Grand Mall Complex",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Automatic Transfer Switch (ATS) Testing",
        "project_name": "Namakkal Cold Storage",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Thermographic Hotspot Inspection",
        "project_name": "Erode Processing Unit",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "HT Breaker Relay Calibration Check",
        "project_name": "Mettur Hydro Station Site",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Emergency Lighting Battery Backup Test",
        "project_name": "Karur Commercial Tower",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Electrical Inspectorate CEIG Approval Audit",
        "project_name": "Grand Mall Complex",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 5,
    "employee_code": "EMP-105",
    "employee_type_id": 5,
    "employee_type_name": "Plumber",
    "first_name": "Prakash",
    "last_name": "",
    "phone": "9840012349",
    "email": "prakash.m@constructionpms.in",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "service": "Plumbing",
    "specialization": "Sanitary Lines & CPVC Piping",
    "service_rate": 1350,
    "rate_unit": "Day",
    "serviceRate": 1350,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 5,
    "completed_work_count": 7,
    "experience_years": 4.5,
    "qualification": "ITI Plumbing Technician",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Green Valley Residence",
        "service": "Plumbing",
        "completed_date": "Jul 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Adyar Residential Plot",
        "service": "Plumbing",
        "completed_date": "May 2026",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Apartment",
        "service": "Plumbing",
        "completed_date": "Mar 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Velachery Duplex",
        "service": "Plumbing",
        "completed_date": "Jan 2026",
        "duration": "11 days",
        "status": "Completed"
      },
      {
        "project_name": "ECR Villa Site",
        "service": "Plumbing",
        "completed_date": "Nov 2025",
        "duration": "13 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Concealed CPVC Water Supply Line Chipping & Solvent Welding",
        "project_name": "Green Valley Residence",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "SWR Drainage Vertical Stack Pipe Fixing",
        "project_name": "Green Valley Residence",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Wall Hung WC Concealed Flush Tank Installation",
        "project_name": "Adyar Residential Plot",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Overhead Tank 2000L PVC Connection & Automatic Float Valve",
        "project_name": "Anna Nagar Apartment",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Kitchen Sink Drain Line & Trap Fitting",
        "project_name": "Velachery Duplex",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Pressure Testing of Hot & Cold Water Lines (10 Bar)",
        "project_name": "ECR Villa Site",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "CP Health Faucet & Concealed Diverter Fitting",
        "project_name": "Green Valley Residence",
        "duration": "2 days",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 109,
    "employee_code": "EMP-PL-02",
    "employee_type_id": 5,
    "employee_type_name": "Plumbing Specialist",
    "first_name": "Ramesh",
    "last_name": "",
    "phone": "9840012322",
    "email": "ramesh.babu@constructionpms.in",
    "city": "Coimbatore",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "service": "Plumbing",
    "specialization": "Commercial Plumbing & STP Line Setup",
    "service_rate": 1900,
    "rate_unit": "Day",
    "serviceRate": 1900,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "City Hospital Block B",
    "current_work": "Sanitary Line Routing & Shaft Piping",
    "current_progress": 60,
    "completed_projects_count": 13,
    "completed_work_count": 20,
    "experience_years": 7.5,
    "qualification": "Master Plumbing Technician",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "City Hospital Block B",
        "service": "Plumbing",
        "completed_date": "Aug 2026",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "Peelamedu Tech Park",
        "service": "Plumbing",
        "completed_date": "Jun 2026",
        "duration": "19 days",
        "status": "Completed"
      },
      {
        "project_name": "Coimbatore Mall Suite",
        "service": "Plumbing",
        "completed_date": "Apr 2026",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Kovai Medical Center Annex",
        "service": "Plumbing",
        "completed_date": "Feb 2026",
        "duration": "24 days",
        "status": "Completed"
      },
      {
        "project_name": "TIDEL Park Tower C",
        "service": "Plumbing",
        "completed_date": "Dec 2025",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Avinashi Road Hotel",
        "service": "Plumbing",
        "completed_date": "Oct 2025",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Singanallur Apartment Block",
        "service": "Plumbing",
        "completed_date": "Aug 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "RS Puram Villa",
        "service": "Plumbing",
        "completed_date": "Jun 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "PSG Student Hostel",
        "service": "Plumbing",
        "completed_date": "Apr 2025",
        "duration": "21 days",
        "status": "Completed"
      },
      {
        "project_name": "Peelamedu Commercial Plaza",
        "service": "Plumbing",
        "completed_date": "Feb 2025",
        "duration": "17 days",
        "status": "Completed"
      },
      {
        "project_name": "Peelamedu IT Hub",
        "service": "Plumbing",
        "completed_date": "Dec 2024",
        "duration": "25 days",
        "status": "Completed"
      },
      {
        "project_name": "Lotus Residency",
        "service": "Plumbing",
        "completed_date": "Oct 2024",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Gandhipuram Plaza",
        "service": "Plumbing",
        "completed_date": "Aug 2024",
        "duration": "16 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Hydro-Pneumatic Pump System Installation",
        "project_name": "City Hospital Block B",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "STP Treated Water Recirculation Pipe Laying",
        "project_name": "Peelamedu Tech Park",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Commercial Restroom Urinal Sensor & Flush Valve Fitting",
        "project_name": "Coimbatore Mall Suite",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Medical Waste Water Acid-Resistant Piping",
        "project_name": "Kovai Medical Center Annex",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Riser Shaft CPVC Main Header Line Connection",
        "project_name": "TIDEL Park Tower C",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Solar Water Heater Copper Manifold Piping",
        "project_name": "Avinashi Road Hotel",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Basement Sump Pump Dual Submersible Installation",
        "project_name": "Singanallur Apartment Block",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Grohe Concealed Thermostatic Shower Valve Fitting",
        "project_name": "RS Puram Villa",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Hostel Block 50-Seat Gang Toilet Piping",
        "project_name": "PSG Student Hostel",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Rainwater Harvesting Pit Pipe Routing",
        "project_name": "Peelamedu Commercial Plaza",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Fire Hydrant Wet Riser Pipe Clamping",
        "project_name": "Peelamedu IT Hub",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Sanitary Fixture Alignment & Silicone Sealing",
        "project_name": "Lotus Residency",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Grease Trap Installation for Restaurant Kitchen",
        "project_name": "Gandhipuram Plaza",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Underground Sewer Line Inspection Chamber Construction",
        "project_name": "City Hospital Block B",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "CP Brass Pillar Tap & Mixer Fitting",
        "project_name": "Peelamedu Tech Park",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Pipe Insulation for Chilled Water Line",
        "project_name": "Coimbatore Mall Suite",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Water Meter Manifold Assembly",
        "project_name": "Singanallur Apartment Block",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Air Vent Valve & Backflow Preventer Setup",
        "project_name": "TIDEL Park Tower C",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Drainage Smoke & Leakage Testing",
        "project_name": "PSG Student Hostel",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Plumbing System Handover Audit",
        "project_name": "City Hospital Block B",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 110,
    "employee_code": "EMP-PL-03",
    "employee_type_id": 5,
    "employee_type_name": "Plumbing Specialist",
    "first_name": "Selvam",
    "last_name": "",
    "phone": "9840012311",
    "email": "selvam.k@constructionpms.in",
    "city": "Madurai",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "service": "Plumbing",
    "specialization": "Residential & Villa Plumbing",
    "service_rate": 1600,
    "rate_unit": "Day",
    "serviceRate": 1600,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 9,
    "completed_work_count": 14,
    "experience_years": 6,
    "qualification": "Senior Plumber",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Madurai Bypass Villa",
        "service": "Plumbing",
        "completed_date": "Jul 2026",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "KK Nagar Duplex",
        "service": "Plumbing",
        "completed_date": "May 2026",
        "duration": "11 days",
        "status": "Completed"
      },
      {
        "project_name": "Meenakshi Flat Enclave",
        "service": "Plumbing",
        "completed_date": "Mar 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Tallakulam Suites",
        "service": "Plumbing",
        "completed_date": "Jan 2026",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Madurai Plot",
        "service": "Plumbing",
        "completed_date": "Nov 2025",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Sellur Villa Project",
        "service": "Plumbing",
        "completed_date": "Sep 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Mattuthavani Enclave",
        "service": "Plumbing",
        "completed_date": "Jul 2025",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Vadamalayan Avenue",
        "service": "Plumbing",
        "completed_date": "May 2025",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "project_name": "Madurai Ring Road Villa",
        "service": "Plumbing",
        "completed_date": "Mar 2025",
        "duration": "13 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "CPVC Underground Pipe Laying from Sump to Overhead Tank",
        "project_name": "Madurai Bypass Villa",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Bathroom Wall Concealed Shower & Basin Plumbing",
        "project_name": "KK Nagar Duplex",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Kitchen Sink Waste Coupling & Bottle Trap Installation",
        "project_name": "Meenakshi Flat Enclave",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Solar Hot Water Pipe Network Installation",
        "project_name": "Tallakulam Suites",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Septic Tank Inlet & Outlet PVC Pipe Connecting",
        "project_name": "Anna Nagar Madurai Plot",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Kohler & Jaquar Premium Fixture Fitting",
        "project_name": "Sellur Villa Project",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Washing Machine & RO Purifier Water Point Setup",
        "project_name": "Mattuthavani Enclave",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Drainage Floor Trap & Gratings Fixing",
        "project_name": "Vadamalayan Avenue",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Air Pressure Leakage Check for All Sanitary Lines",
        "project_name": "Madurai Ring Road Villa",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Terrace Overhead Tank Float Switch Wiring & Pipe Connection",
        "project_name": "Madurai Bypass Villa",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Garden Hose Bibcock Tap Installation",
        "project_name": "KK Nagar Duplex",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Health Faucet Angle Valve Fitting",
        "project_name": "Meenakshi Flat Enclave",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Submersible Sump Pump Motor Wiring & Fitting",
        "project_name": "Sellur Villa Project",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Pressure Gauge Inspection & Sign-off",
        "project_name": "Madurai Bypass Villa",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 111,
    "employee_code": "EMP-PL-04",
    "employee_type_id": 5,
    "employee_type_name": "Plumbing Specialist",
    "first_name": "Dinesh",
    "last_name": "",
    "phone": "9840012300",
    "email": "dinesh.v@constructionpms.in",
    "city": "Trichy",
    "district": "Trichy",
    "state": "Tamil Nadu",
    "service": "Plumbing",
    "specialization": "High Rise Plumbing & CPVC Pressure Lines",
    "service_rate": 1500,
    "rate_unit": "Day",
    "serviceRate": 1500,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "Ocean Enclave",
    "current_work": "CPVC Pressure Line Testing",
    "current_progress": 40,
    "completed_projects_count": 8,
    "completed_work_count": 12,
    "experience_years": 5,
    "qualification": "Certified Plumbing Inspector",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Trichy Central Tower",
        "service": "Plumbing",
        "completed_date": "Jul 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Ocean Enclave",
        "service": "Plumbing",
        "completed_date": "May 2026",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Srirangam Residency",
        "service": "Plumbing",
        "completed_date": "Mar 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Thillai Nagar Commercials",
        "service": "Plumbing",
        "completed_date": "Jan 2026",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "NIT Trichy Faculty Housing",
        "service": "Plumbing",
        "completed_date": "Nov 2025",
        "duration": "17 days",
        "status": "Completed"
      },
      {
        "project_name": "Cantonment Duplex Villa",
        "service": "Plumbing",
        "completed_date": "Sep 2025",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Kaveri Bank Building",
        "service": "Plumbing",
        "completed_date": "Jul 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "BHEL Officers Club",
        "service": "Plumbing",
        "completed_date": "May 2025",
        "duration": "11 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Multi-Storey Vertical Riser Pipe Clamping & Jointing",
        "project_name": "Trichy Central Tower",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Concealed CPVC Pressure Line Solvent Welding",
        "project_name": "Ocean Enclave",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "PRV (Pressure Reducing Valve) Installation on Mid-Floors",
        "project_name": "Srirangam Residency",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Commercial Restroom Urinal Sensor Auto-flush Piping",
        "project_name": "Thillai Nagar Commercials",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Hostel Overhead PVC Tank Distribution Ring Main",
        "project_name": "NIT Trichy Faculty Housing",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Wall Mounted Basin Mixer & Pillar Tap Assembly",
        "project_name": "Cantonment Duplex Villa",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Fire Hydrant Underground Loop Piping",
        "project_name": "Kaveri Bank Building",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Clubhouse Swimming Pool Recirculation Pipe Work",
        "project_name": "BHEL Officers Club",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Hydrostatic Pressure Testing @ 12 Bar",
        "project_name": "Trichy Central Tower",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Waste Water Gully Trap & Drain Pipe Laying",
        "project_name": "Ocean Enclave",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Water Softener Unit Pipe Interconnection",
        "project_name": "Srirangam Residency",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Sanitary Fixture Inspection",
        "project_name": "Thillai Nagar Commercials",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 8,
    "employee_code": "EMP-108",
    "employee_type_id": 3,
    "employee_type_name": "Master Painter",
    "first_name": "Karthik",
    "last_name": "",
    "phone": "9840012352",
    "email": "karthik.v@constructionpms.in",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "service": "Painting",
    "specialization": "Interior Emulsion & Texture Painting",
    "service_rate": 1500,
    "rate_unit": "Day",
    "serviceRate": 1500,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 10,
    "completed_work_count": 16,
    "experience_years": 6.5,
    "qualification": "Senior Painter",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Green Valley Residence",
        "service": "Painting",
        "completed_date": "Jul 2026",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "ECR Sea Breeze Coastal Plot",
        "service": "Painting",
        "completed_date": "May 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Duplex",
        "service": "Painting",
        "completed_date": "Mar 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Velachery Apartment",
        "service": "Painting",
        "completed_date": "Jan 2026",
        "duration": "11 days",
        "status": "Completed"
      },
      {
        "project_name": "Adyar Villa Enclave",
        "service": "Painting",
        "completed_date": "Nov 2025",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "OMR Penthouse Suite",
        "service": "Painting",
        "completed_date": "Sep 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "Kotturpuram Flat",
        "service": "Painting",
        "completed_date": "Jul 2025",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "project_name": "Thiruvanmiyur Bungalow",
        "service": "Painting",
        "completed_date": "May 2025",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Nungambakkam Commercials",
        "service": "Painting",
        "completed_date": "Mar 2025",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Mylapore Heritage Home",
        "service": "Painting",
        "completed_date": "Jan 2025",
        "duration": "12 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Wall Surface Putty Scraping & Sanding",
        "project_name": "Green Valley Residence",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Interior Acrylic Primer Base Coat Application",
        "project_name": "Green Valley Residence",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Double Coat Asian Paints Royale Emulsion Spraying",
        "project_name": "ECR Sea Breeze Coastal Plot",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Living Room Metallic Accent Texture Painting",
        "project_name": "Anna Nagar Duplex",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Exterior Apex Weather-proof Shield Coat",
        "project_name": "Velachery Apartment",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Ceiling Tractor Emulsion Painting",
        "project_name": "Adyar Villa Enclave",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Enamel Paint Touch-up on Metal Grills & Gates",
        "project_name": "OMR Penthouse Suite",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Melamine Clear Polish on Teak Door Panels",
        "project_name": "Kotturpuram Flat",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Damp-Proof Base Sealer Coating on Parapet Walls",
        "project_name": "Thiruvanmiyur Bungalow",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Stencil Patterned Design Wall Work",
        "project_name": "Nungambakkam Commercials",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Wood Stain Polish Application on Staircase Handrail",
        "project_name": "Mylapore Heritage Home",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Masking Tape Sealing for Dual-Tone Borders",
        "project_name": "Green Valley Residence",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Pop False Ceiling Primer & Paint Finish",
        "project_name": "ECR Sea Breeze Coastal Plot",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Paint Sheen & Uniformity Inspection",
        "project_name": "Anna Nagar Duplex",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Floor & Window Glass Cleaning Post Paint",
        "project_name": "Velachery Apartment",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Final Touch-up Audit with Client Handover",
        "project_name": "Green Valley Residence",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 112,
    "employee_code": "EMP-PA-02",
    "employee_type_id": 3,
    "employee_type_name": "Painting Specialist",
    "first_name": "Murugan",
    "last_name": "",
    "phone": "9840012319",
    "email": "murugan.s@constructionpms.in",
    "city": "Coimbatore",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "service": "Painting",
    "specialization": "Exterior Weather Proofing & Texture Coating",
    "service_rate": 1400,
    "rate_unit": "Day",
    "serviceRate": 1400,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "Green Valley Residence",
    "current_work": "Exterior Primer & Apex Shield Coat",
    "current_progress": 55,
    "completed_projects_count": 8,
    "completed_work_count": 13,
    "experience_years": 5,
    "qualification": "Certified Asian Paints Applicator",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Green Valley Residence",
        "service": "Painting",
        "completed_date": "Aug 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Coimbatore Corporate Tower",
        "service": "Painting",
        "completed_date": "Jun 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Peelamedu Mall Facade",
        "service": "Painting",
        "completed_date": "Apr 2026",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Avinashi Villa Enclave",
        "service": "Painting",
        "completed_date": "Feb 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "RS Puram Duplex",
        "service": "Painting",
        "completed_date": "Dec 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Singanallur High Rise",
        "service": "Painting",
        "completed_date": "Oct 2025",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "PSG Hostel Block",
        "service": "Painting",
        "completed_date": "Aug 2025",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Trichy Road Commercials",
        "service": "Painting",
        "completed_date": "Jun 2025",
        "duration": "14 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Exterior Scaffold Setup & Pressure Water Washing",
        "project_name": "Green Valley Residence",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Crack Bridging Elastomeric Putty Filling",
        "project_name": "Coimbatore Corporate Tower",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Exterior Primer Coat Spraying",
        "project_name": "Peelamedu Mall Facade",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Apex Ultima Dustproof Topcoat Application",
        "project_name": "Avinashi Villa Enclave",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Interior Washable Emulsion Roller Painting",
        "project_name": "RS Puram Duplex",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Scaffold High Level Spray Painting",
        "project_name": "Singanallur High Rise",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Enamel Coating on Window Safety Grills",
        "project_name": "PSG Hostel Block",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Boundary Wall Damp-Proof Coating",
        "project_name": "Trichy Road Commercials",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Granular Texture Wall Finish on Elevation",
        "project_name": "Green Valley Residence",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Door Frame Wood Polish & Varnishing",
        "project_name": "Coimbatore Corporate Tower",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Ceiling POP Repair & Putty Touch-up",
        "project_name": "Peelamedu Mall Facade",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Balcony Handrail Anti-Rust Primer",
        "project_name": "Avinashi Villa Enclave",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Final Color Shade Uniformity Inspection",
        "project_name": "RS Puram Duplex",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 113,
    "employee_code": "EMP-PA-03",
    "employee_type_id": 3,
    "employee_type_name": "Painting Specialist",
    "first_name": "Pandian",
    "last_name": "",
    "phone": "9840012338",
    "email": "pandian.m@constructionpms.in",
    "city": "Madurai",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "service": "Painting",
    "specialization": "Residential Interior & Putty Finishing",
    "service_rate": 1650,
    "rate_unit": "Day",
    "serviceRate": 1650,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 12,
    "completed_work_count": 19,
    "experience_years": 7,
    "qualification": "Senior Painter & Decorator",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Madurai Bypass Villa",
        "service": "Painting",
        "completed_date": "Jul 2026",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "KK Nagar Duplex",
        "service": "Painting",
        "completed_date": "May 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Meenakshi Heights",
        "service": "Painting",
        "completed_date": "Mar 2026",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Tallakulam Commercial Block",
        "service": "Painting",
        "completed_date": "Jan 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Home",
        "service": "Painting",
        "completed_date": "Nov 2025",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Sellur Residency",
        "service": "Painting",
        "completed_date": "Sep 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "Mattuthavani Suites",
        "service": "Painting",
        "completed_date": "Jul 2025",
        "duration": "11 days",
        "status": "Completed"
      },
      {
        "project_name": "Vadamalayan Avenue",
        "service": "Painting",
        "completed_date": "May 2025",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "project_name": "Ring Road Villa",
        "service": "Painting",
        "completed_date": "Mar 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "TVS Nagar Flat",
        "service": "Painting",
        "completed_date": "Jan 2025",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Alagarkoil Road Resort",
        "service": "Painting",
        "completed_date": "Nov 2024",
        "duration": "17 days",
        "status": "Completed"
      },
      {
        "project_name": "Simmakkal Plaza",
        "service": "Painting",
        "completed_date": "Sep 2024",
        "duration": "14 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Full Interior Wall 2-Coat Acrylic Putty Leveling",
        "project_name": "Madurai Bypass Villa",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Waterproof Primer Coat Application",
        "project_name": "KK Nagar Duplex",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Royale Luxury Silk Emulsion Double Coat",
        "project_name": "Meenakshi Heights",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "False Ceiling POP Putty & Seamless Finish",
        "project_name": "Tallakulam Commercial Block",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Accent Wall Geometric Pattern Painting",
        "project_name": "Anna Nagar Home",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Exterior Weather Proof Emulsion Painting",
        "project_name": "Sellur Residency",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Teak Door PU Polish Application",
        "project_name": "Mattuthavani Suites",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Metal Window Safety Grill Black Enamel Paint",
        "project_name": "Vadamalayan Avenue",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Damp Proofing Sealant Coating on Roof Slab",
        "project_name": "Ring Road Villa",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Wood Vaneer Polish Buffing",
        "project_name": "TVS Nagar Flat",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Resort Cottage Exterior Wood Stain",
        "project_name": "Alagarkoil Road Resort",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Showroom Ceiling Charcoal Paint Finish",
        "project_name": "Simmakkal Plaza",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Surface Sanding with 220-Grit Paper",
        "project_name": "Madurai Bypass Villa",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Masking & Edge Line Neatening",
        "project_name": "KK Nagar Duplex",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Stain Removing Chemical Wash",
        "project_name": "Meenakshi Heights",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Base Coat Color Matching Test",
        "project_name": "Tallakulam Commercial Block",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Post-painting Floor Protection Removal",
        "project_name": "Anna Nagar Home",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Final Sheen Uniformity Audit",
        "project_name": "Sellur Residency",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Client Sign-off & Paint Bucket Handover",
        "project_name": "Madurai Bypass Villa",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 114,
    "employee_code": "EMP-PA-04",
    "employee_type_id": 3,
    "employee_type_name": "Painting Specialist",
    "first_name": "Velu",
    "last_name": "",
    "phone": "9840012356",
    "email": "velu.p@constructionpms.in",
    "city": "Salem",
    "district": "Salem",
    "state": "Tamil Nadu",
    "service": "Painting",
    "specialization": "Residential Interior & Wall Primer",
    "service_rate": 1250,
    "rate_unit": "Day",
    "serviceRate": 1250,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 6,
    "completed_work_count": 9,
    "experience_years": 4,
    "qualification": "Certified Wall Painter",
    "gender": "Male",
    "employment_status": "Contract",
    "profile_image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Salem Junction Duplex",
        "service": "Painting",
        "completed_date": "Jul 2026",
        "duration": "11 days",
        "status": "Completed"
      },
      {
        "project_name": "Yercaud Villa",
        "service": "Painting",
        "completed_date": "May 2026",
        "duration": "10 days",
        "status": "Completed"
      },
      {
        "project_name": "Mettur Home Site",
        "service": "Painting",
        "completed_date": "Mar 2026",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Steel City Flat",
        "service": "Painting",
        "completed_date": "Jan 2026",
        "duration": "9 days",
        "status": "Completed"
      },
      {
        "project_name": "Namakkal Residence",
        "service": "Painting",
        "completed_date": "Nov 2025",
        "duration": "13 days",
        "status": "Completed"
      },
      {
        "project_name": "Erode Villa",
        "service": "Painting",
        "completed_date": "Sep 2025",
        "duration": "10 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Wall Putty Surface Prep & Smoothing",
        "project_name": "Salem Junction Duplex",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Interior Wall Primer Roller Coating",
        "project_name": "Yercaud Villa",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Tractor Emulsion Double Coat Painting",
        "project_name": "Mettur Home Site",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Door & Window Wood Polish Application",
        "project_name": "Steel City Flat",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Grill Anti-rust Painting",
        "project_name": "Namakkal Residence",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Ceiling Paint Touch-up Work",
        "project_name": "Erode Villa",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Exterior Wall Primer Application",
        "project_name": "Salem Junction Duplex",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Color Shade Patch Test",
        "project_name": "Yercaud Villa",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Final Cleanup & Site Handover",
        "project_name": "Mettur Home Site",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 2,
    "employee_code": "EMP-102",
    "employee_type_id": 2,
    "employee_type_name": "Civil Engineer",
    "first_name": "Deepak",
    "last_name": "",
    "phone": "9840012346",
    "email": "deepak.rao@constructionpms.in",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "service": "Interior",
    "specialization": "Structural & Interior Architecture Design",
    "service_rate": 3500,
    "rate_unit": "Day",
    "serviceRate": 3500,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "Green Valley Residence",
    "current_work": "Interior Wall Masonry & Framework",
    "current_progress": 60,
    "completed_projects_count": 11,
    "completed_work_count": 18,
    "experience_years": 8.5,
    "qualification": "M.Tech Structural Engineering",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Green Valley Residence",
        "service": "Interior",
        "completed_date": "Aug 2026",
        "duration": "30 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Villa",
        "service": "Interior",
        "completed_date": "Jun 2026",
        "duration": "25 days",
        "status": "Completed"
      },
      {
        "project_name": "Poes Garden Residence",
        "service": "Interior",
        "completed_date": "Apr 2026",
        "duration": "35 days",
        "status": "Completed"
      },
      {
        "project_name": "ECR Beach House",
        "service": "Interior",
        "completed_date": "Feb 2026",
        "duration": "28 days",
        "status": "Completed"
      },
      {
        "project_name": "Adyar Penthouse",
        "service": "Interior",
        "completed_date": "Dec 2025",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "Velachery Duplex",
        "service": "Interior",
        "completed_date": "Oct 2025",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "OMR Tech Executive Suite",
        "service": "Interior",
        "completed_date": "Aug 2025",
        "duration": "24 days",
        "status": "Completed"
      },
      {
        "project_name": "Nungambakkam Corporate Office",
        "service": "Interior",
        "completed_date": "Jun 2025",
        "duration": "32 days",
        "status": "Completed"
      },
      {
        "project_name": "Mylapore Heritage Home",
        "service": "Interior",
        "completed_date": "Apr 2025",
        "duration": "19 days",
        "status": "Completed"
      },
      {
        "project_name": "Kotturpuram Luxury Flat",
        "service": "Interior",
        "completed_date": "Feb 2025",
        "duration": "21 days",
        "status": "Completed"
      },
      {
        "project_name": "RA Puram Duplex",
        "service": "Interior",
        "completed_date": "Dec 2024",
        "duration": "26 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "3D Interior Architectural Layout & Furniture Planning",
        "project_name": "Green Valley Residence",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Gypsum POP False Ceiling Grid Design & Lighting Channel",
        "project_name": "Anna Nagar Villa",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Modular Kitchen Island & Quartz Top Detailing",
        "project_name": "Poes Garden Residence",
        "duration": "8 days",
        "status": "Completed"
      },
      {
        "task_name": "Living Room Veneer Wall Panelling & Hidden Door Setup",
        "project_name": "ECR Beach House",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Master Bathroom Marble Vanity & Glass Partition Design",
        "project_name": "Adyar Penthouse",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Bedroom Wardrobe Internal Organiser Framing",
        "project_name": "Velachery Duplex",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Executive Cabin Acoustic Wood Panelling",
        "project_name": "OMR Tech Executive Suite",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Reception Desk Corian Solid Surface Fabrication",
        "project_name": "Nungambakkam Corporate Office",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Pooja Mandapam Brass & Teak Carving Detailing",
        "project_name": "Mylapore Heritage Home",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Foyer Shoe Storage & Decorative Screen Partition",
        "project_name": "Kotturpuram Luxury Flat",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Staircase Glass Balustrade & Under-Stair Storage",
        "project_name": "RA Puram Duplex",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Lighting Cove & Ambient LED Strip Channel Fitting",
        "project_name": "Green Valley Residence",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Curtain Blind Box & Pelmet Construction",
        "project_name": "Anna Nagar Villa",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Wall Moulding & WPC Panel Installation",
        "project_name": "Poes Garden Residence",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Loose Furniture Procurement & Quality Verification",
        "project_name": "ECR Beach House",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Fabric & Color Palette Material Sample Approval",
        "project_name": "Adyar Penthouse",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Interior Styling & Snag List Resolution",
        "project_name": "Green Valley Residence",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Handover & Operation Manual Sign-off",
        "project_name": "Green Valley Residence",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 115,
    "employee_code": "EMP-IN-02",
    "employee_type_id": 2,
    "employee_type_name": "Interior Specialist",
    "first_name": "Priya",
    "last_name": "",
    "phone": "9840012370",
    "email": "priya.s@constructionpms.in",
    "city": "Coimbatore",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "service": "Interior",
    "specialization": "Residential Modular Interiors & Color Styling",
    "service_rate": 3200,
    "rate_unit": "Day",
    "serviceRate": 3200,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 9,
    "completed_work_count": 15,
    "experience_years": 6,
    "qualification": "B.Des Interior Architecture",
    "gender": "Female",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "RS Puram Luxury Villa",
        "service": "Interior",
        "completed_date": "Jul 2026",
        "duration": "24 days",
        "status": "Completed"
      },
      {
        "project_name": "Avinashi Road Penthouse",
        "service": "Interior",
        "completed_date": "May 2026",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Peelamedu Apartment",
        "service": "Interior",
        "completed_date": "Mar 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Race Course Villa",
        "service": "Interior",
        "completed_date": "Jan 2026",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "Peelamedu Tech Suite",
        "service": "Interior",
        "completed_date": "Nov 2025",
        "duration": "19 days",
        "status": "Completed"
      },
      {
        "project_name": "Singanallur Flat",
        "service": "Interior",
        "completed_date": "Sep 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Kovai Enclave",
        "service": "Interior",
        "completed_date": "Jul 2025",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Trichy Road Duplex",
        "service": "Interior",
        "completed_date": "May 2025",
        "duration": "21 days",
        "status": "Completed"
      },
      {
        "project_name": "Lotus Heights",
        "service": "Interior",
        "completed_date": "Mar 2025",
        "duration": "14 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Modular Acrylic Kitchen 3D Modeling & Installation",
        "project_name": "RS Puram Luxury Villa",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Master Bedroom Sliding Mirror Wardrobe Setup",
        "project_name": "Avinashi Road Penthouse",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "False Ceiling Peripheral Ambient Lighting",
        "project_name": "Peelamedu Apartment",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Living Room Fabric Wallpaper & Panelling",
        "project_name": "Race Course Villa",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Breakout Zone Wooden Slatted Ceiling",
        "project_name": "Peelamedu Tech Suite",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Kids Bedroom Bunk Bed & Storage Framing",
        "project_name": "Singanallur Flat",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Dining Area Fluted Panel Accent Wall",
        "project_name": "Kovai Enclave",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Home Office Floating Desk & Library Unit",
        "project_name": "Trichy Road Duplex",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Entry Foyer Console Mirror & Lighting",
        "project_name": "Lotus Heights",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Soft Furnishing Curtain Track Setup",
        "project_name": "RS Puram Luxury Villa",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Countertop Quartz Stone Polish Inspection",
        "project_name": "Avinashi Road Penthouse",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Crockery Unit Glass Door Hinge Fitting",
        "project_name": "Peelamedu Apartment",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Lighting Dimmer & Sensor Integration",
        "project_name": "Race Course Villa",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Deep Cleaning & Snagging Check",
        "project_name": "Peelamedu Tech Suite",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Client Final Walkthrough & Handover",
        "project_name": "RS Puram Luxury Villa",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 116,
    "employee_code": "EMP-IN-03",
    "employee_type_id": 2,
    "employee_type_name": "Interior Specialist",
    "first_name": "Gautham",
    "last_name": "",
    "phone": "9840012371",
    "email": "gautham.v@constructionpms.in",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "service": "Interior",
    "specialization": "Commercial fit-out & Ceiling Panelling",
    "service_rate": 3800,
    "rate_unit": "Day",
    "serviceRate": 3800,
    "rateUnit": "Day",
    "availability": "Assigned",
    "current_project_name": "Tech Park IT Tower",
    "current_work": "Acoustic Wall & Ceiling Panelling",
    "current_progress": 75,
    "completed_projects_count": 13,
    "completed_work_count": 21,
    "experience_years": 7.5,
    "qualification": "Senior Interior Architect",
    "gender": "Male",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Tech Park IT Tower",
        "service": "Interior",
        "completed_date": "Aug 2026",
        "duration": "28 days",
        "status": "Completed"
      },
      {
        "project_name": "Guindy Corporate Office",
        "service": "Interior",
        "completed_date": "Jun 2026",
        "duration": "22 days",
        "status": "Completed"
      },
      {
        "project_name": "OMR Cyber Hub",
        "service": "Interior",
        "completed_date": "Apr 2026",
        "duration": "30 days",
        "status": "Completed"
      },
      {
        "project_name": "Nungambakkam Financial Plaza",
        "service": "Interior",
        "completed_date": "Feb 2026",
        "duration": "25 days",
        "status": "Completed"
      },
      {
        "project_name": "T Nagar Retail Showroom",
        "service": "Interior",
        "completed_date": "Dec 2025",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Velachery Tech Center",
        "service": "Interior",
        "completed_date": "Oct 2025",
        "duration": "20 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Bank Branch",
        "service": "Interior",
        "completed_date": "Aug 2025",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "Adyar Office Complex",
        "service": "Interior",
        "completed_date": "Jun 2025",
        "duration": "19 days",
        "status": "Completed"
      },
      {
        "project_name": "ECR Resort Lobby",
        "service": "Interior",
        "completed_date": "Apr 2025",
        "duration": "21 days",
        "status": "Completed"
      },
      {
        "project_name": "Mylapore Clinic Interior",
        "service": "Interior",
        "completed_date": "Feb 2025",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Porur IT Annex",
        "service": "Interior",
        "completed_date": "Dec 2024",
        "duration": "24 days",
        "status": "Completed"
      },
      {
        "project_name": "Perungudi Tech Park",
        "service": "Interior",
        "completed_date": "Oct 2024",
        "duration": "27 days",
        "status": "Completed"
      },
      {
        "project_name": "Tambaram Mall Suite",
        "service": "Interior",
        "completed_date": "Aug 2024",
        "duration": "17 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Acoustic Wooden Baffle Ceiling Installation",
        "project_name": "Tech Park IT Tower",
        "duration": "7 days",
        "status": "Completed"
      },
      {
        "task_name": "Glass Partition Wall & Frameless Door Setup",
        "project_name": "Guindy Corporate Office",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Town Hall Auditorium Tiered Seating Framework",
        "project_name": "OMR Cyber Hub",
        "duration": "8 days",
        "status": "Completed"
      },
      {
        "task_name": "Executive Boardroom Veneer Table & Wall Cladding",
        "project_name": "Nungambakkam Financial Plaza",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Retail Display Racks & Spotlight Canopy",
        "project_name": "T Nagar Retail Showroom",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Cafeteria Open Ceiling Duct Paint & Metal Grid",
        "project_name": "Velachery Tech Center",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Bank Cash Counter Toughened Glass & Counter Panelling",
        "project_name": "Anna Nagar Bank Branch",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Workstation Partition Fabric Panel Assembly",
        "project_name": "Adyar Office Complex",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Resort Reception Desk Marble & Wood Combination",
        "project_name": "ECR Resort Lobby",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Clinic Consultation Room Storage Unit",
        "project_name": "Mylapore Clinic Interior",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Server Room Raised Access Flooring Setup",
        "project_name": "Porur IT Annex",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Training Room Foldable Partition Wall Installation",
        "project_name": "Perungudi Tech Park",
        "duration": "6 days",
        "status": "Completed"
      },
      {
        "task_name": "Mall Kiosk Woodwork & LED Signage Backing",
        "project_name": "Tambaram Mall Suite",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Door Hardware & Automatic Closer Calibration",
        "project_name": "Tech Park IT Tower",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Foliage Wall & Decorative Planter Box Panelling",
        "project_name": "Guindy Corporate Office",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Foyer Chandelier Hanging Support Reinforcement",
        "project_name": "OMR Cyber Hub",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Pneumatic Seal Inspection on Glass Doors",
        "project_name": "Nungambakkam Financial Plaza",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Carpet Tile Joint Seaming & Vacuum Cleanup",
        "project_name": "Tech Park IT Tower",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Fire Rating Certificate Verification for Wall Materials",
        "project_name": "Perungudi Tech Park",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Snagging Checklist Audit & Fixes",
        "project_name": "Guindy Corporate Office",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Interior Clearance Sign-off",
        "project_name": "Tech Park IT Tower",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  },
  {
    "employee_id": 117,
    "employee_code": "EMP-IN-04",
    "employee_type_id": 2,
    "employee_type_name": "Interior Specialist",
    "first_name": "Nithya",
    "last_name": "",
    "phone": "9840012372",
    "email": "nithya.s@constructionpms.in",
    "city": "Madurai",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "service": "Interior",
    "specialization": "Residential Interiors & Kitchen Layouts",
    "service_rate": 3000,
    "rate_unit": "Day",
    "serviceRate": 3000,
    "rateUnit": "Day",
    "availability": "Available",
    "current_project_name": "None",
    "current_work": "None",
    "current_progress": 0,
    "completed_projects_count": 7,
    "completed_work_count": 11,
    "experience_years": 5,
    "qualification": "Certified Interior Designer",
    "gender": "Female",
    "employment_status": "Permanent",
    "profile_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    "status": true,
    "completed_projects_list": [
      {
        "project_name": "Madurai Bypass Home",
        "service": "Interior",
        "completed_date": "Jul 2026",
        "duration": "16 days",
        "status": "Completed"
      },
      {
        "project_name": "KK Nagar Duplex Villa",
        "service": "Interior",
        "completed_date": "May 2026",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Meenakshi Flat Enclave",
        "service": "Interior",
        "completed_date": "Mar 2026",
        "duration": "18 days",
        "status": "Completed"
      },
      {
        "project_name": "Tallakulam Commercials",
        "service": "Interior",
        "completed_date": "Jan 2026",
        "duration": "15 days",
        "status": "Completed"
      },
      {
        "project_name": "Anna Nagar Madurai Home",
        "service": "Interior",
        "completed_date": "Nov 2025",
        "duration": "12 days",
        "status": "Completed"
      },
      {
        "project_name": "Sellur Villa Enclave",
        "service": "Interior",
        "completed_date": "Sep 2025",
        "duration": "14 days",
        "status": "Completed"
      },
      {
        "project_name": "Mattuthavani Suites",
        "service": "Interior",
        "completed_date": "Jul 2025",
        "duration": "11 days",
        "status": "Completed"
      }
    ],
    "completed_tasks_list": [
      {
        "task_name": "Modular L-Shape Kitchen Carcass & Shutters",
        "project_name": "Madurai Bypass Home",
        "duration": "5 days",
        "status": "Completed"
      },
      {
        "task_name": "Master Bedroom Wardrobe Loft & Sliding Shutters",
        "project_name": "KK Nagar Duplex Villa",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Living Room TV Panel & False Ceiling Lighting",
        "project_name": "Meenakshi Flat Enclave",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Reception Counter & Waiting Lounge Woodwork",
        "project_name": "Tallakulam Commercials",
        "duration": "4 days",
        "status": "Completed"
      },
      {
        "task_name": "Teak Pooja Unit & Decorative Jali Screen",
        "project_name": "Anna Nagar Madurai Home",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Vanity Mirror Cabinet & Bathroom Storage",
        "project_name": "Sellur Villa Enclave",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Study Table & Bookshelf Assembly",
        "project_name": "Mattuthavani Suites",
        "duration": "3 days",
        "status": "Completed"
      },
      {
        "task_name": "Laminate Edge Banding & Trim Touch-up",
        "project_name": "Madurai Bypass Home",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Glass Door Hinge Alignment",
        "project_name": "KK Nagar Duplex Villa",
        "duration": "1 day",
        "status": "Completed"
      },
      {
        "task_name": "Lighting Fixture Installation Check",
        "project_name": "Meenakshi Flat Enclave",
        "duration": "2 days",
        "status": "Completed"
      },
      {
        "task_name": "Final Cleaning & Handover Inspection",
        "project_name": "Madurai Bypass Home",
        "duration": "1 day",
        "status": "Completed"
      }
    ]
  }
]
    for (const emp of employees) {
      const typeId = getValidEmployeeTypeId(emp.employee_type_id);
      await connection.query(
        `INSERT INTO employees 
         (employee_id, employee_code, employee_type_id, employee_type_name, first_name, last_name, phone, email, 
          city, district, state, service, specialization, service_rate, rate_unit, availability, current_project_name, 
          current_work, current_progress, completed_projects_count, completed_work_count, experience_years, qualification, 
          gender, employment_status, profile_image, status, completed_projects_list, completed_tasks_list) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), service=VALUES(service), specialization=VALUES(specialization), availability=VALUES(availability)`,
        [
          emp.employee_id, emp.employee_code, typeId, emp.employee_type_name || '',
          emp.first_name, emp.last_name || '', emp.phone || '', emp.email || '', emp.city || 'Chennai', emp.district || 'Chennai', emp.state || 'Tamil Nadu',
          emp.service || '', emp.specialization || '', emp.service_rate || emp.serviceRate || 0, emp.rate_unit || emp.rateUnit || 'Day',
          emp.availability || 'Available', emp.current_project_name || 'None', emp.current_work || 'None', emp.current_progress || 0,
          emp.completed_projects_count || (emp.completed_projects_list ? emp.completed_projects_list.length : 0),
          emp.completed_work_count || (emp.completed_tasks_list ? emp.completed_tasks_list.length : 0),
          emp.experience_years || 5.0, emp.qualification || 'Specialist', emp.gender || 'Male', emp.employment_status || 'Permanent',
          emp.profile_image || '', emp.status !== false ? 1 : 0,
          JSON.stringify(emp.completed_projects_list || []),
          JSON.stringify(emp.completed_tasks_list || [])
        ]
      )
    }
    console.log(`[AutoSeed] Verified ${employees.length} employees`)

    // 7. Seed Services
    const services = [
  {
    "service_id": 1,
    "service_code": "SRV-01",
    "service_name": "Painting Work",
    "description": "Internal acrylic emulsion and external weather-proof primer and double coat painting.",
    "project_id": 1,
    "project_name": "Green Valley Residence",
    "unit_of_measure": "Sq. Ft",
    "base_rate": 18,
    "start_date": "2026-04-01",
    "end_date": "2026-04-15",
    "estimated_duration_days": 15,
    "status": true,
    "created_at": "2025-12-01 10:00:00",
    "created_by": 1
  },
  {
    "service_id": 2,
    "service_code": "SRV-02",
    "service_name": "Vitrified Tile Flooring",
    "description": "Laying 2x2 vitrified tiles on floor with cement mortar base and tile grout pointing.",
    "project_id": 1,
    "project_name": "Green Valley Residence",
    "unit_of_measure": "Sq. Ft",
    "base_rate": 45,
    "start_date": "2026-03-10",
    "end_date": "2026-03-25",
    "estimated_duration_days": 15,
    "status": true,
    "created_at": "2025-12-01 10:00:00",
    "created_by": 1
  },
  {
    "service_id": 3,
    "service_code": "SRV-03",
    "service_name": "Plumbing & Sanitary Line",
    "description": "Running CPVC water supply lines, SWR drainage lines and installing sanitary fixtures.",
    "project_id": 2,
    "project_name": "City Hospital Block B",
    "unit_of_measure": "Point",
    "base_rate": 650,
    "start_date": "2026-02-01",
    "end_date": "2026-02-20",
    "estimated_duration_days": 20,
    "status": true,
    "created_at": "2025-09-15 10:00:00",
    "created_by": 1
  },
  {
    "service_id": 4,
    "service_code": "SRV-04",
    "service_name": "Electrical Conduiting & Wiring",
    "description": "Chipping walls, PVC conduit routing, copper wiring and DB box installation.",
    "project_id": 3,
    "project_name": "Tech Park IT Tower",
    "unit_of_measure": "Point",
    "base_rate": 550,
    "start_date": "2026-01-15",
    "end_date": "2026-02-10",
    "estimated_duration_days": 25,
    "status": true,
    "created_at": "2025-06-10 10:00:00",
    "created_by": 1
  }
]
    for (const srv of services) {
      await connection.query(
        `INSERT INTO services (service_id, service_code, service_name, description, category, rate_per_unit, unit, assigned_person_id, assigned_person_name, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE service_name=VALUES(service_name), rate_per_unit=VALUES(rate_per_unit)`,
        [
          srv.service_id, srv.service_code, srv.service_name, srv.description || '', srv.category || 'Construction',
          srv.rate_per_unit || srv.base_rate || 0, srv.unit || srv.unit_of_measure || 'Sq. Ft',
          srv.assigned_person_id && srv.assigned_person_id <= 117 ? srv.assigned_person_id : null, srv.assigned_person_name || '', srv.status ? 1 : 0
        ]
      )
    }
    console.log(`[AutoSeed] Verified ${services.length} services`)

    // 8. Seed Construction Types
    const constructionTypes = [
  {
    "construction_type_id": 1,
    "construction_type_code": "CT-01",
    "construction_type_name": "Residential",
    "description": "Independent homes, villas and apartments",
    "icon": "🏠",
    "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
    "stages_count": 14,
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "construction_type_id": 2,
    "construction_type_code": "CT-02",
    "construction_type_name": "Hospital",
    "description": "Healthcare and medical facilities",
    "icon": "🏥",
    "image": "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?q=80&w=600&auto=format&fit=crop",
    "stages_count": 9,
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "construction_type_id": 3,
    "construction_type_code": "CT-03",
    "construction_type_name": "College",
    "description": "Educational campuses and institutions",
    "icon": "🏫",
    "image": "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop",
    "stages_count": 15,
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "construction_type_id": 4,
    "construction_type_code": "CT-04",
    "construction_type_name": "Commercial Building",
    "description": "Offices, retail and mixed-use towers",
    "icon": "🏢",
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
    "stages_count": 7,
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "construction_type_id": 5,
    "construction_type_code": "CT-05",
    "construction_type_name": "Industrial Building",
    "description": "Factories, warehouses and plants",
    "icon": "🏭",
    "image": "/images/categories/industrial_building.jpg",
    "stages_count": 12,
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  },
  {
    "construction_type_id": 6,
    "construction_type_code": "CT-06",
    "construction_type_name": "Road",
    "description": "Highways and road infrastructure",
    "icon": "🛣️",
    "image": "/images/categories/road.jpg",
    "stages_count": 10,
    "status": true,
    "created_at": "2025-11-01 10:00:00",
    "created_by": 1
  }
]
    for (const ct of constructionTypes) {
      await connection.query(
        `INSERT INTO construction_types (construction_type_id, construction_type_code, construction_type_name, description, status) 
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE construction_type_name=VALUES(construction_type_name)`,
        [ct.construction_type_id, ct.construction_type_code, ct.construction_type_name, ct.description || '', ct.status ? 1 : 0]
      )
    }
    console.log(`[AutoSeed] Verified ${constructionTypes.length} construction types`)

    // 9. Seed Construction Stages
    const stages = [
      { stage_id: 1, stage_code: 'STG-01', stage_sequence: 1, stage_name: 'Site Preparation & Excavation', description: 'Site clearing, levelling, demarcation, and foundation excavation' },
      { stage_id: 2, stage_code: 'STG-02', stage_sequence: 2, stage_name: 'Foundation & Footing Work', description: 'PCC bed, RCC footing, column starter, and plinth beam concreting' },
      { stage_id: 3, stage_code: 'STG-03', stage_sequence: 3, stage_name: 'Substructure & Plinth Beam', description: 'Backfilling, plinth masonry, damp proof course (DPC) and PCC floor bed' },
      { stage_id: 4, stage_code: 'STG-04', stage_sequence: 4, stage_name: 'Superstructure Masonry', description: 'Brickwork / AAC blockwork, lintel beams, and sunshade casting' },
      { stage_id: 5, stage_code: 'STG-05', stage_sequence: 5, stage_name: 'Roof Slab & Concreting', description: 'Shuttering, TMT steel binding, electrical conduit laying, and RCC slab casting' },
      { stage_id: 6, stage_code: 'STG-06', stage_sequence: 6, stage_name: 'Plastering & Conduit Work', description: 'Internal & external sand plastering, electrical box fixing, and plumbing lines' },
      { stage_id: 7, stage_code: 'STG-07', stage_sequence: 7, stage_name: 'Flooring & Tile Work', description: 'Vitrified tile laying, granite kitchen counter, and bathroom wall tiling' },
      { stage_id: 8, stage_code: 'STG-08', stage_sequence: 8, stage_name: 'Painting & Finishing Work', description: 'Wall putty, primer application, final emulsion paint, and door fitting' },
      { stage_id: 9, stage_code: 'STG-09', stage_sequence: 9, stage_name: 'Final Inspection & Handover', description: 'Deep cleaning, MEP fixture testing, snag list rectification, and key handover' }
    ]
    for (const stg of stages) {
      await connection.query(
        `INSERT INTO construction_stages (stage_id, stage_code, stage_name, stage_sequence, description, status) 
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE stage_name=VALUES(stage_name)`,
        [stg.stage_id, stg.stage_code, stg.stage_name, stg.stage_sequence, stg.description]
      )
    }
    console.log(`[AutoSeed] Verified ${stages.length} construction stages`)

    // 10. Seed Clients
    const clients = [
  {
    "client_id": 1,
    "client_code": "CLT-01",
    "client_name": "Ravi",
    "client_type": "Individual",
    "company_name": "-",
    "contact_person": "Ravi",
    "phone": "9791122334",
    "alternate_phone": "9791122390",
    "email": "ravi.kumar@gmail.com",
    "address_line1": "Plot 14, ECR Main Road",
    "address_line2": "Kottivakkam",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600041",
    "status": true,
    "created_at": "2025-11-10 10:00:00",
    "created_by": 1
  },
  {
    "client_id": 2,
    "client_code": "CLT-02",
    "client_name": "ABC Healthcare",
    "client_type": "Company",
    "company_name": "ABC Healthcare Pvt Ltd",
    "contact_person": "Sundaram",
    "phone": "9791122335",
    "alternate_phone": "9791122391",
    "email": "projects@abchealthcare.in",
    "address_line1": "45, Trichy Road",
    "address_line2": "Singanallur",
    "city": "Coimbatore",
    "district": "Coimbatore",
    "state": "Tamil Nadu",
    "pincode": "641005",
    "status": true,
    "created_at": "2025-11-12 11:30:00",
    "created_by": 1
  },
  {
    "client_id": 3,
    "client_code": "CLT-03",
    "client_name": "Nirmal Educational Trust",
    "client_type": "Organization",
    "company_name": "Nirmal Trust",
    "contact_person": "Nirmal Educational Society",
    "phone": "9791122336",
    "alternate_phone": "9791122392",
    "email": "admin@nirmaltrust.org",
    "address_line1": "88, Bypass Road",
    "address_line2": "Melur",
    "city": "Madurai",
    "district": "Madurai",
    "state": "Tamil Nadu",
    "pincode": "625106",
    "status": true,
    "created_at": "2025-11-15 14:00:00",
    "created_by": 1
  },
  {
    "client_id": 4,
    "client_code": "CLT-04",
    "client_name": "Tamil Nadu Highways Dept",
    "client_type": "Government",
    "company_name": "TN Highways Department",
    "contact_person": "Chief Engineer PWD",
    "phone": "9791122337",
    "alternate_phone": "9791122393",
    "email": "pwd.highways@tn.gov.in",
    "address_line1": "PWD Complex, Chepauk",
    "address_line2": "Kamarajar Salai",
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600005",
    "status": true,
    "created_at": "2025-11-18 16:20:00",
    "created_by": 1
  }
]
    for (const c of clients) {
      await connection.query(
        `INSERT INTO clients (client_id, client_code, client_name, client_type, company_name, contact_person, phone, alternate_phone, email, user_id, address_line1, address_line2, city, district, state, pincode, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE client_name=VALUES(client_name), phone=VALUES(phone)`,
        [
          c.client_id, c.client_code, c.client_name, c.client_type || 'Individual', c.company_name || '', c.contact_person || c.client_name,
          c.phone || '', c.alternate_phone || '', c.email || '', c.client_id === 1 ? 501 : c.client_id === 2 ? 502 : 201,
          c.address_line1 || '', c.address_line2 || '', c.city || 'Chennai', c.district || 'Chennai', c.state || 'Tamil Nadu', c.pincode || '600001', c.status ? 1 : 0
        ]
      )
    }
    console.log(`[AutoSeed] Verified ${clients.length} clients`)

    // 11. Seed Projects
    const projects = [
  {
    "project_id": 1,
    "project_code": "PRJ-2026-001",
    "project_name": "Green Valley Residence",
    "construction_type_id": 1,
    "construction_type_name": "Residential",
    "project_type_id": 1,
    "project_type_name": "Independent Villa",
    "client_id": 1,
    "client_name": "Ravi",
    "construction_stage_id": 105,
    "construction_stage_name": "Structural Work",
    "employee_id": 1,
    "supervisor_id": 1,
    "supervisor_name": "Arun",
    "project_description": "A luxury 4BHK independent villa with landscaped courtyard, home office and rooftop garden.",
    "site_address": "Plot 14, ECR Main Road, Kottivakkam",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600041",
    "latitude": 12.9642,
    "longitude": 80.2584,
    "estimated_budget": 4800000,
    "start_date": "2025-12-01",
    "expected_end_date": "2026-07-28",
    "actual_end_date": "",
    "no_of_floors": 2,
    "project_status": "In Progress",
    "overall_progress_percentage": 75,
    "status": true,
    "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    "created_at": "2025-11-20 10:00:00",
    "created_by": 1
  },
  {
    "project_id": 2,
    "project_code": "PRJ-2026-002",
    "project_name": "City Hospital Block B",
    "construction_type_id": 2,
    "construction_type_name": "Hospital",
    "project_type_id": 4,
    "project_type_name": "Healthcare Facility",
    "client_id": 2,
    "client_name": "ABC Healthcare",
    "construction_stage_id": 205,
    "construction_stage_name": "MEP Rough-in",
    "employee_id": 3,
    "supervisor_id": 3,
    "supervisor_name": "Suresh",
    "project_description": "120-bed multi-specialty hospital block with dedicated diagnostics wing, ICU floor and medical gas infrastructure.",
    "site_address": "45, Trichy Road, Singanallur",
    "city": "Coimbatore",
    "state": "Tamil Nadu",
    "pincode": "641005",
    "latitude": 11.0018,
    "longitude": 77.0163,
    "estimated_budget": 32000000,
    "start_date": "2025-09-15",
    "expected_end_date": "2026-11-30",
    "actual_end_date": "",
    "no_of_floors": 5,
    "project_status": "In Progress",
    "overall_progress_percentage": 52,
    "status": true,
    "image": "https://images.unsplash.com/photo-1587351021355-a479a299d2f9?q=80&w=800&auto=format&fit=crop",
    "created_at": "2025-09-10 11:30:00",
    "created_by": 1
  },
  {
    "project_id": 3,
    "project_code": "PRJ-2026-003",
    "project_name": "Tech Park IT Tower",
    "construction_type_id": 4,
    "construction_type_name": "Commercial Building",
    "project_type_id": 5,
    "project_type_name": "IT / Commercial Park",
    "client_id": 2,
    "client_name": "ABC Healthcare",
    "construction_stage_id": 406,
    "construction_stage_name": "Interior Finishing",
    "employee_id": 3,
    "supervisor_id": 3,
    "supervisor_name": "Suresh",
    "project_description": "Grade-A IT office block with column-free floor plates, central atrium and rooftop amenity deck.",
    "site_address": "OMR IT Corridor, Kandanchavadi",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600096",
    "latitude": 12.9634,
    "longitude": 80.2458,
    "estimated_budget": 18500000,
    "start_date": "2025-06-10",
    "expected_end_date": "2026-08-05",
    "actual_end_date": "",
    "no_of_floors": 8,
    "project_status": "Near Completion",
    "overall_progress_percentage": 90,
    "status": true,
    "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    "created_at": "2025-06-01 09:00:00",
    "created_by": 1
  }
]
    for (const p of projects) {
      const cTypeId = getValidConstructionTypeId(p.construction_type_id);
      const stageId = getValidStageId(p.construction_stage_id);
      const clientId = (p.client_id && p.client_id <= 4) ? p.client_id : 1;

      await connection.query(
        `INSERT INTO projects (project_id, project_code, project_name, client_id, client_name, construction_type_id, construction_type_name, project_type_name, construction_stage_id, construction_stage_name, supervisor_id, supervisor_name, location, district, state, total_area, unit, estimated_budget, overall_progress_percentage, project_status, start_date, expected_completion_date, image, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE project_name=VALUES(project_name), overall_progress_percentage=VALUES(overall_progress_percentage)`,
        [
          p.project_id, p.project_code, p.project_name, clientId, p.client_name || 'Ravi', cTypeId,
          p.construction_type_name || 'Residential House', p.project_type_name || 'Premium Villa', stageId,
          p.construction_stage_name || 'Roof Slab & Concreting', 103, p.supervisor_name || 'Raman M',
          p.site_address || p.location || 'Chennai', p.city || 'Chennai', p.state || 'Tamil Nadu', p.total_area || 3200, 'Sq. Ft',
          p.estimated_budget || 8500000, p.overall_progress_percentage || 60, p.project_status || 'In Progress',
          p.start_date || '2025-11-01', p.expected_end_date || '2026-08-30', p.image || ''
        ]
      )
    }
    console.log(`[AutoSeed] Verified ${projects.length} projects`)

    // 12. Seed Properties
    const defaultProperties = [
      {
        property_id: 101, property_code: 'PROP-001', property_name: 'ECR Sea Breeze Coastal Plot', property_type: 'Plot / Land',
        survey_number: 'SY-142/3A', location: 'Kottivakkam, ECR Road', district: 'Chennai', state: 'Tamil Nadu', pincode: '600041',
        area: 4800, unit: 'Sq. Ft', rate_per_unit: 4200, total_amount: 20160000, seller_id: 201, seller_name: 'Santhosh Landowners',
        seller_phone: '9841029384', seller_email: 'santhosh@landowners.in', status: 'Approved', publication_status: 'Published',
        verification_status: 'Verified', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop',
        document_reference: 'DOC-ECR-2025-8812', description: 'Prime coastal land parcel suitable for residential luxury villa development.'
      },
      {
        property_id: 102, property_code: 'PROP-002', property_name: 'Avinashi Highway Commercial Land', property_type: 'Commercial Plot',
        survey_number: 'SY-308/1B', location: 'Avinashi Road, Kalapatti', district: 'Coimbatore', state: 'Tamil Nadu', pincode: '641014',
        area: 2.5, unit: 'Acres', rate_per_unit: 14000000, total_amount: 35000000, seller_id: 202, seller_name: 'Vanguard Promoters',
        seller_phone: '9842201928', seller_email: 'vanguard@realty.com', status: 'Approved', publication_status: 'Published',
        verification_status: 'Verified', image: '/avinashi_commercial_land.jpg', document_reference: 'DOC-CBE-2025-5510', description: 'High visibility frontage land parcel on Avinashi main highway.'
      },
      {
        property_id: 103, property_code: 'PROP-003', property_name: 'Green Valley Premium Villa Plot #14', property_type: 'Residential Plot',
        survey_number: 'SY-142/3A-P14', location: 'ECR Road, Kottivakkam', district: 'Chennai', state: 'Tamil Nadu', pincode: '600041',
        area: 2400, unit: 'Sq. Ft', rate_per_unit: 5800, total_amount: 13920000, seller_id: 203, seller_name: 'Kavitha Landowner',
        seller_phone: '9840112233', seller_email: 'kavitha@gmail.com', status: 'Approved', publication_status: 'Published',
        verification_status: 'Verified', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
        document_reference: 'DOC-GV-2025-104', description: 'Corner villa plot inside approved gated layout with 40ft road access.'
      }
    ]
    for (const prop of defaultProperties) {
      await connection.query(
        `INSERT INTO properties (property_id, property_code, property_name, property_type, survey_number, location, district, state, pincode, area, unit, rate_per_unit, total_amount, seller_id, seller_name, seller_phone, seller_email, status, publication_status, verification_status, image, document_reference, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE property_name=VALUES(property_name)`,
        [
          prop.property_id, prop.property_code, prop.property_name, prop.property_type, prop.survey_number, prop.location,
          prop.district, prop.state, prop.pincode, prop.area, prop.unit, prop.rate_per_unit, prop.total_amount, prop.seller_id,
          prop.seller_name, prop.seller_phone, prop.seller_email, prop.status, prop.publication_status, prop.verification_status,
          prop.image, prop.document_reference, prop.description
        ]
      )
    }
    console.log(`[AutoSeed] Verified ${defaultProperties.length} properties`)

    // 13. Seed Buy Requests
    const buyReqs = [
      { request_id: 301, request_code: 'REQ-BUY-101', property_id: 101, property_name: 'ECR Sea Breeze Coastal Plot', buyer_id: 501, buyer_name: 'Ravi', buyer_email: 'ravi.kumar@gmail.com', buyer_phone: '9791122334', budget: 21000000, requirements: 'Interested in purchasing plot for constructing a luxury villa.', status: 'Negotiation', current_stage: 'Price Settlement', submitted_date: '2026-01-10', verification_status: 'Verified' },
      { request_id: 302, request_code: 'REQ-BUY-102', property_id: 103, property_name: 'Green Valley Premium Villa Plot #14', buyer_id: 502, buyer_name: 'Anand', buyer_email: 'anand.sharma@gmail.com', buyer_phone: '9840998877', budget: 14000000, requirements: 'Immediate booking intent. Looking for clear title handover.', status: 'Transaction Processing', current_stage: 'Advance Paid', submitted_date: '2026-01-15', verification_status: 'Verified' }
    ]
    for (const br of buyReqs) {
      await connection.query(
        `INSERT INTO buy_requests (request_id, request_code, property_id, property_name, buyer_id, buyer_name, buyer_email, buyer_phone, budget, requirements, status, current_stage, submitted_date, verification_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE request_code=VALUES(request_code)`,
        [br.request_id, br.request_code, br.property_id, br.property_name, br.buyer_id, br.buyer_name, br.buyer_email, br.buyer_phone, br.budget, br.requirements, br.status, br.current_stage, br.submitted_date, br.verification_status]
      )
    }

    // 14. Seed Sell Requests
    const sellReqs = [
      { sell_request_id: 401, request_code: 'REQ-SEL-201', property_id: 101, property_name: 'Trichy Road Tech Park Site', survey_number: 'SY-88/2C', location: 'Singanallur, Trichy Road', district: 'Coimbatore', state: 'Tamil Nadu', pincode: '641005', area: 12000, unit: 'Sq. Ft', expected_rate: 3200, expected_total: 38400000, seller_id: 204, seller_name: 'Selvam Realities', seller_phone: '9843300112', seller_email: 'selvam@realities.in', status: 'Under Verification', remarks: 'DTCP NOC and survey sketch submitted for review.', submitted_date: '2026-02-01', document_url: 'DOC-TR-2026-009' }
    ]
    for (const sr of sellReqs) {
      await connection.query(
        `INSERT INTO sell_requests (sell_request_id, request_code, property_id, property_name, survey_number, location, district, state, pincode, area, unit, expected_rate, expected_total, seller_id, seller_name, seller_phone, seller_email, status, remarks, submitted_date, document_url) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE request_code=VALUES(request_code)`,
        [sr.sell_request_id, sr.request_code, sr.property_id, sr.property_name, sr.survey_number, sr.location, sr.district, sr.state, sr.pincode, sr.area, sr.unit, sr.expected_rate, sr.expected_total, sr.seller_id, sr.seller_name, sr.seller_phone, sr.seller_email, sr.status, sr.remarks, sr.submitted_date, sr.document_url]
      )
    }

    // 15. Seed Negotiations
    const negs = [
      { negotiation_id: 601, negotiation_code: 'NEG-101', request_id: 301, property_id: 101, property_name: 'ECR Sea Breeze Coastal Plot', buyer_id: 501, buyer_name: 'Ravi', seller_id: 201, seller_name: 'Santhosh Landowners', initial_price: 20160000, proposed_price: 19500000, counter_offer: 19800000, final_agreed_price: 19800000, status: 'Counter Offer', date: '2026-01-18', remarks: 'Seller offered ₹1.98 Cr final closing price.' },
      { negotiation_id: 602, negotiation_code: 'NEG-102', request_id: 302, property_id: 103, property_name: 'Green Valley Premium Villa Plot #14', buyer_id: 502, buyer_name: 'Anand', seller_id: 203, seller_name: 'Kavitha Landowner', initial_price: 13920000, proposed_price: 13500000, counter_offer: 13800000, final_agreed_price: 13800000, status: 'Agreed', date: '2026-01-20', remarks: 'Final price agreed at ₹1.38 Cr. Transaction initiated.' }
    ]
    for (const n of negs) {
      await connection.query(
        `INSERT INTO negotiations (negotiation_id, negotiation_code, request_id, property_id, property_name, buyer_id, buyer_name, seller_id, seller_name, initial_price, proposed_price, counter_offer, final_agreed_price, status, date, remarks) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE negotiation_code=VALUES(negotiation_code)`,
        [n.negotiation_id, n.negotiation_code, n.request_id, n.property_id, n.property_name, n.buyer_id, n.buyer_name, n.seller_id, n.seller_name, n.initial_price, n.proposed_price, n.counter_offer, n.final_agreed_price, n.status, n.date, n.remarks]
      )
    }

    // 16. Seed Transactions
    const txns = [
      { transaction_id: 701, transaction_code: 'TXN-2026-001', request_id: 302, property_id: 103, property_name: 'Green Valley Premium Villa Plot #14', buyer_id: 502, buyer_name: 'Anand', buyer_contact: '9840998877', seller_id: 203, seller_name: 'Kavitha Landowner', seller_contact: '9840112233', agreed_amount: 13800000, payment_status: 'Advance Paid', advance_amount: 2500000, transaction_date: '2026-01-22', document_reference: 'SALE-DEED-2026-882', status: 'Transaction Processing', admin_verification: 'Approved', remarks: 'Advance ₹25L received. Sub-registrar booking pending.' },
      { transaction_id: 702, transaction_code: 'TXN-2025-901', request_id: 300, property_id: 101, property_name: 'ECR Sea Breeze Coastal Plot', buyer_id: 501, buyer_name: 'Ravi', buyer_contact: '9791122334', seller_id: 201, seller_name: 'Santhosh Landowners', seller_contact: '9841029384', agreed_amount: 20160000, payment_status: 'Completed', advance_amount: 20160000, transaction_date: '2025-11-10', document_reference: 'DOC-ECR-2025-8812', status: 'Completed', admin_verification: 'Approved', remarks: 'Sale deed executed and handed over.' }
    ]
    for (const t of txns) {
      await connection.query(
        `INSERT INTO transactions (transaction_id, transaction_code, request_id, property_id, property_name, buyer_id, buyer_name, buyer_contact, seller_id, seller_name, seller_contact, agreed_amount, payment_status, advance_amount, transaction_date, document_reference, status, admin_verification, remarks) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE transaction_code=VALUES(transaction_code)`,
        [t.transaction_id, t.transaction_code, t.request_id, t.property_id, t.property_name, t.buyer_id, t.buyer_name, t.buyer_contact, t.seller_id, t.seller_name, t.seller_contact, t.agreed_amount, t.payment_status, t.advance_amount, t.transaction_date, t.document_reference, t.status, t.admin_verification, t.remarks]
      )
    }

    // 17. Seed Payments
    const payments = [
  {
    "payment_id": 1,
    "payment_number": "PAY-2026-101",
    "payment_type": "Income",
    "project_id": 1,
    "project_name": "Green Valley Residence",
    "party_name": "Ravi (Client)",
    "amount": 1200000,
    "payment_date": "2026-01-10",
    "payment_method": "Bank Transfer (NEFT)",
    "reference_number": "HDFC129038471",
    "description": "2nd Milestone Payment upon completion of Plinth & Foundation.",
    "status": "Received",
    "remarks": "Acknowledged with receipt #REC-884."
  },
  {
    "payment_id": 2,
    "payment_number": "PAY-2026-102",
    "payment_type": "Expense",
    "project_id": 1,
    "project_name": "Green Valley Residence",
    "party_name": "Sri Balaji Cement Traders",
    "amount": 210000,
    "payment_date": "2026-01-15",
    "payment_method": "Cheque",
    "reference_number": "CHQ-882310",
    "description": "500 Bags UltraTech Cement procurement supply bill.",
    "status": "Paid",
    "remarks": "Cleared on Jan 17, 2026."
  },
  {
    "payment_id": 3,
    "payment_number": "PAY-2026-103",
    "payment_type": "Income",
    "project_id": 2,
    "project_name": "City Hospital Block B",
    "party_name": "ABC Healthcare Pvt Ltd",
    "amount": 4500000,
    "payment_date": "2026-02-01",
    "payment_method": "RTGS",
    "reference_number": "SBIN99238120",
    "description": "Structure Completion Advance Payment.",
    "status": "Received",
    "remarks": "Tax invoice raised #INV-2026-04."
  },
  {
    "payment_id": 4,
    "payment_number": "PAY-2026-104",
    "payment_type": "Expense",
    "project_id": 2,
    "project_name": "City Hospital Block B",
    "party_name": "Chennai Steel House",
    "amount": 680000,
    "payment_date": "2026-02-12",
    "payment_method": "Bank Transfer (IMPS)",
    "reference_number": "UTIB4481029",
    "description": "10 Tonnes TMT Rebar delivery settlement.",
    "status": "Paid",
    "remarks": "Delivery challan matched."
  }
]
    for (const pm of payments) {
      await connection.query(
        `INSERT INTO payments (payment_id, payment_number, project_id, project_name, client_id, client_name, payment_type, category, amount, payment_date, payment_mode, status, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE payment_number=VALUES(payment_number)`,
        [
          pm.payment_id, pm.payment_number, pm.project_id || 1, pm.project_name || 'Green Valley Luxury Villa',
          pm.client_id || 1, pm.party_name || pm.client_name || 'Ravi', pm.payment_type || 'Income',
          pm.category || 'Stage Advance', pm.amount || 1500000, pm.payment_date || '2026-01-05',
          pm.payment_method || pm.payment_mode || 'Bank Transfer', pm.status || 'Received', pm.description || ''
        ]
      )
    }
    console.log(`[AutoSeed] Verified ${payments.length} payments`)

    // 18. Seed Employee Assignments
    const assignments = [
  {
    "assignment_id": 1,
    "employee_id": 1,
    "employee_name": "Arun",
    "project_id": 1,
    "project_name": "Green Valley Residence",
    "service_name": "Structural Execution",
    "work_name": "Roof Slab Shuttering & Steel Reinforcement",
    "role_in_project": "Site Supervisor",
    "assigned_date": "2025-12-01",
    "release_date": "2026-07-28",
    "status": "Active"
  },
  {
    "assignment_id": 2,
    "employee_id": 2,
    "employee_name": "Deepak",
    "project_id": 1,
    "project_name": "Green Valley Residence",
    "service_name": "Structural Engineering Review",
    "work_name": "Exterior Brickwork Wall Masonry",
    "role_in_project": "Lead Structural Engineer",
    "assigned_date": "2025-12-01",
    "release_date": "2026-07-28",
    "status": "Active"
  },
  {
    "assignment_id": 3,
    "employee_id": 3,
    "employee_name": "Suresh",
    "project_id": 2,
    "project_name": "City Hospital Block B",
    "service_name": "MEP Coordination",
    "work_name": "ICU Block Electrical Conduiting",
    "role_in_project": "Project Engineer",
    "assigned_date": "2025-09-15",
    "release_date": "2026-11-30",
    "status": "Active"
  }
]
    for (const asn of assignments) {
      await connection.query(
        `INSERT INTO employee_assignments (assignment_id, employee_id, employee_name, project_id, project_name, service_name, role_in_project, assigned_date, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE assignment_id=VALUES(assignment_id)`,
        [
          asn.assignment_id, asn.employee_id, asn.employee_name, asn.project_id, asn.project_name,
          asn.service_name, asn.role_in_project || asn.work_name || 'Specialist', asn.assigned_date || '2026-01-01', asn.status || 'Active'
        ]
      )
    }
    console.log(`[AutoSeed] Verified ${assignments.length} employee assignments`)

    // 15. Seed Notifications
    const [notifRows] = await connection.query('SELECT COUNT(*) as cnt FROM notifications')
    if (notifRows[0].cnt === 0) {
      const initialNotifications = [
        { user_id: 501, title: 'Buy Request Submitted', message: 'Your buy request REQ-BUY-101 for ECR Sea Breeze Coastal Plot was received.', type: 'info' },
        { user_id: 501, title: 'Negotiation Update', message: 'Seller offered ₹1.98 Cr closing price counter offer.', type: 'success' },
        { user_id: 501, title: 'Payment Received', message: 'Payment of ₹25,00,000 advance received for transaction TXN-2026-001.', type: 'success' },
        { user_id: 1, title: 'New Client Buy Request', message: 'Client Ravi submitted a buy request for ECR Sea Breeze Coastal Plot.', type: 'warning' },
        { user_id: 1, title: 'New Property Submission', message: 'Seller submitted Trichy Road Tech Park Site for verification.', type: 'info' },
        { user_id: 1, title: 'Transaction Advance Paid', message: 'Transaction TXN-2026-001 advance payment verified.', type: 'success' },
      ]
      for (const n of initialNotifications) {
        await connection.query(
          'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [n.user_id, n.title, n.message, n.type]
        )
      }
      console.log('[AutoSeed] Verified initial notifications')
    }

    // 16. Seed Construction Sites for Workforce Attendance
    const [siteRows] = await connection.query('SELECT COUNT(*) as cnt FROM construction_sites')
    if (siteRows[0].cnt === 0) {
      const initialSites = [
        {
          site_code: 'SITE-001',
          site_name: 'Green Valley Residence Site',
          project_id: 1,
          address: 'No 12, OMR Bypass Road, Sholinganallur, Chennai, Tamil Nadu 600119',
          latitude: 12.9010,
          longitude: 80.2279,
          radius_meters: 300,
          max_gps_accuracy: 150,
          working_start_time: '09:00',
          working_end_time: '18:00',
          grace_period_minutes: 15,
          supervisor_id: 101,
          supervisor_name: 'Santhosh',
          status: 'Active'
        },
        {
          site_code: 'SITE-002',
          site_name: 'City Hospital Block B Site',
          project_id: 2,
          address: 'Block B, Mount Road, Guindy, Chennai, Tamil Nadu 600032',
          latitude: 13.0067,
          longitude: 80.2020,
          radius_meters: 400,
          max_gps_accuracy: 150,
          working_start_time: '08:30',
          working_end_time: '17:30',
          grace_period_minutes: 15,
          supervisor_id: 102,
          supervisor_name: 'Arun',
          status: 'Active'
        }
      ]
      for (const s of initialSites) {
        await connection.query(
          `INSERT INTO construction_sites 
           (site_code, site_name, project_id, address, latitude, longitude, radius_meters, max_gps_accuracy, working_start_time, working_end_time, grace_period_minutes, supervisor_id, supervisor_name, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.site_code, s.site_name, s.project_id, s.address, s.latitude, s.longitude, s.radius_meters, s.max_gps_accuracy, s.working_start_time, s.working_end_time, s.grace_period_minutes, s.supervisor_id, s.supervisor_name, s.status]
        )
      }
      console.log('[AutoSeed] Verified initial construction sites')
    }

    // 17. Seed Worker Site Assignments
    const [asnRows] = await connection.query('SELECT COUNT(*) as cnt FROM worker_site_assignments')
    if (asnRows[0].cnt === 0) {
      const [sites] = await connection.query('SELECT site_id FROM construction_sites LIMIT 2')
      const [emps] = await connection.query('SELECT employee_id FROM employees LIMIT 10')
      if (sites.length > 0 && emps.length > 0) {
        const site1Id = sites[0].site_id
        const site2Id = sites[1] ? sites[1].site_id : site1Id
        const todayStr = new Date().toISOString().split('T')[0]
        
        for (let i = 0; i < emps.length; i++) {
          const empId = emps[i].employee_id
          const siteId = i % 2 === 0 ? site1Id : site2Id
          await connection.query(
            `INSERT INTO worker_site_assignments (worker_id, site_id, assigned_date, status)
             VALUES (?, ?, ?, 'Active')`,
            [empId, siteId, todayStr]
          )
        }
        console.log('[AutoSeed] Verified initial worker site assignments')
      }
    }

    // 18. Seed Material Allocations (Project Allocations)
    const [alcCountRows] = await connection.query('SELECT COUNT(*) as cnt FROM material_allocations')
    if (alcCountRows[0].cnt === 0) {
      const [items] = await connection.query('SELECT item_id FROM items LIMIT 5')
      const [prjs] = await connection.query('SELECT project_id FROM projects LIMIT 2')
      if (items.length > 0 && prjs.length > 0) {
        const prj1 = prjs[0].project_id
        const prj2 = prjs[1] ? prjs[1].project_id : prj1
        
        const initialAllocations = [
          { code: 'ALC-PRJ1-001', item_id: items[0].item_id, project_id: prj1, allocated: 350, issued: 200, returned: 10, remarks: 'Foundation & Pillar Slab Casting Phase 1' },
          { code: 'ALC-PRJ1-002', item_id: items[3] ? items[3].item_id : items[0].item_id, project_id: prj1, allocated: 15, issued: 10, returned: 0, remarks: 'Structural Steel Rebar Reinforcement' },
          { code: 'ALC-PRJ2-001', item_id: items[1] ? items[1].item_id : items[0].item_id, project_id: prj2, allocated: 1500, issued: 800, returned: 50, remarks: 'Masonry & Plastering Work' },
        ]

        for (const a of initialAllocations) {
          await connection.query(
            `INSERT INTO material_allocations 
             (allocation_code, item_id, project_id, allocated_quantity, issued_quantity, returned_quantity, status, allocated_date, remarks, created_by)
             VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', CURDATE(), ?, 1)`,
            [a.code, a.item_id, a.project_id, a.allocated, a.issued, a.returned, a.remarks]
          )
        }
        console.log('[AutoSeed] Verified initial material allocations')
      }
    }

    // 19. Seed RFQs & Quotations
    const [rfqCountRows] = await connection.query('SELECT COUNT(*) as cnt FROM material_rfqs')
    if (rfqCountRows[0].cnt === 0) {
      const [items] = await connection.query('SELECT item_id FROM items LIMIT 5')
      const [prjs] = await connection.query('SELECT project_id FROM projects LIMIT 2')
      const [supps] = await connection.query('SELECT supplier_id FROM suppliers LIMIT 3')

      if (items.length > 0 && prjs.length > 0 && supps.length > 0) {
        const prjId = prjs[0].project_id
        const supp1 = supps[0].supplier_id
        const supp2 = supps[1] ? supps[1].supplier_id : supp1

        // Insert RFQ 1
        const [rfqRes1] = await connection.query(
          `INSERT INTO material_rfqs (rfq_code, title, project_id, required_delivery_date, status, remarks, created_by)
           VALUES ('RFQ-2026-001', 'Bulk Cement & TMT Rebar Requirement for Slab Level 2', ?, DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'PUBLISHED', 'High grade UltraTech Cement & Tata TMT Steel needed.', 1)`,
          [prjId]
        )
        const rfqId1 = rfqRes1.insertId

        // RFQ Items
        await connection.query(
          `INSERT INTO rfq_items (rfq_id, item_id, requested_quantity) VALUES (?, ?, 400), (?, ?, 10)`,
          [rfqId1, items[0].item_id, rfqId1, items[3] ? items[3].item_id : items[0].item_id]
        )

        // Insert Supplier Quotation 1
        const [qtnRes1] = await connection.query(
          `INSERT INTO supplier_quotations (quotation_code, rfq_id, supplier_id, delivery_days, status, total_amount, remarks)
           VALUES ('QTN-SUP1-001', ?, ?, 5, 'ACCEPTED', 236000.00, 'Includes site delivery & 30 days payment credit terms.')`,
          [rfqId1, supp1]
        )
        const qtnId1 = qtnRes1.insertId

        await connection.query(
          `INSERT INTO quotation_items (quotation_id, item_id, quoted_quantity, unit_price, line_total, has_certification)
           VALUES (?, ?, 400, 420.00, 168000.00, 1), (?, ?, 10, 6800.00, 68000.00, 1)`,
          [qtnId1, items[0].item_id, qtnId1, items[3] ? items[3].item_id : items[0].item_id]
        )

        // Insert Supplier Quotation 2
        const [qtnRes2] = await connection.query(
          `INSERT INTO supplier_quotations (quotation_code, rfq_id, supplier_id, delivery_days, status, total_amount, remarks)
           VALUES ('QTN-SUP2-002', ?, ?, 7, 'SUBMITTED', 245000.00, 'Competitive quote with premium quality assurance.')`,
          [rfqId1, supp2]
        )
        const qtnId2 = qtnRes2.insertId

        await connection.query(
          `INSERT INTO quotation_items (quotation_id, item_id, quoted_quantity, unit_price, line_total, has_certification)
           VALUES (?, ?, 400, 435.00, 174000.00, 1), (?, ?, 10, 7100.00, 71000.00, 1)`,
          [qtnId2, items[0].item_id, qtnId2, items[3] ? items[3].item_id : items[0].item_id]
        )

        console.log('[AutoSeed] Verified initial RFQs & Supplier Quotations')
      }
    }

    // 20. Seed Purchase Orders
    const [poCountRows] = await connection.query('SELECT COUNT(*) as cnt FROM purchase_orders')
    if (poCountRows[0].cnt === 0) {
      const [items] = await connection.query('SELECT item_id FROM items LIMIT 5')
      const [prjs] = await connection.query('SELECT project_id FROM projects LIMIT 2')
      const [supps] = await connection.query('SELECT supplier_id FROM suppliers LIMIT 3')
      const [qtns] = await connection.query('SELECT quotation_id, rfq_id FROM supplier_quotations LIMIT 1')

      if (items.length > 0 && prjs.length > 0 && supps.length > 0) {
        const prjId1 = prjs[0].project_id
        const prjId2 = prjs[1] ? prjs[1].project_id : prjId1
        const supp1 = supps[0].supplier_id
        const supp2 = supps[1] ? supps[1].supplier_id : supp1
        const qtnId = qtns.length > 0 ? qtns[0].quotation_id : null
        const rfqId = qtns.length > 0 ? qtns[0].rfq_id : null

        // PO 1
        const [poRes1] = await connection.query(
          `INSERT INTO purchase_orders (po_code, quotation_id, rfq_id, project_id, supplier_id, expected_delivery_date, delivery_location, status, total_amount, paid_amount, remarks, created_by)
           VALUES ('PO-2026-001', ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Green Valley Main Site Store', 'ISSUED', 236000.00, 100000.00, 'Initial 40% advance paid. Balance due upon site unloading inspection.', 1)`,
          [qtnId, rfqId, prjId1, supp1]
        )
        const poId1 = poRes1.insertId

        await connection.query(
          `INSERT INTO purchase_order_items (po_id, item_id, quantity, unit_price, line_total)
           VALUES (?, ?, 400, 420.00, 168000.00), (?, ?, 10, 6800.00, 68000.00)`,
          [poId1, items[0].item_id, poId1, items[3] ? items[3].item_id : items[0].item_id]
        )

        // PO 2
        const [poRes2] = await connection.query(
          `INSERT INTO purchase_orders (po_code, quotation_id, rfq_id, project_id, supplier_id, expected_delivery_date, delivery_location, status, total_amount, paid_amount, remarks, created_by)
           VALUES ('PO-2026-002', NULL, NULL, ?, ?, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'City Hospital Site Store B', 'COMPLETED', 2880.00, 2880.00, 'Full payment settled upon verified material delivery.', 1)`,
          [prjId2, supp2]
        )
        const poId2 = poRes2.insertId

        await connection.query(
          `INSERT INTO purchase_order_items (po_id, item_id, quantity, unit_price, line_total)
           VALUES (?, ?, 120, 24.00, 2880.00)`,
          [poId2, items[2] ? items[2].item_id : items[0].item_id]
        )

        console.log('[AutoSeed] Verified initial Purchase Orders')
      }
    }

    // 21. Seed Attendance History Records
    const [attCountRows] = await connection.query('SELECT COUNT(*) as cnt FROM attendance_records')
    if (attCountRows[0].cnt === 0) {
      const [sites] = await connection.query('SELECT site_id, latitude, longitude FROM construction_sites LIMIT 2')
      const [emps] = await connection.query('SELECT employee_id FROM employees LIMIT 10')
      
      if (sites.length > 0 && emps.length > 0) {
        const site1 = sites[0]
        const site2 = sites[1] || site1

        const sampleAttendance = []
        // Generate past 7 days of attendance for employees
        for (let i = 1; i <= 7; i++) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]

          for (let j = 0; j < emps.length; j++) {
            const empId = emps[j].employee_id
            const site = j % 2 === 0 ? site1 : site2
            const isLate = (i + j) % 5 === 0 ? 1 : 0
            const checkInHour = isLate ? '09:25:00' : '08:55:00'
            const checkOutHour = '18:05:00'
            const statusStr = isLate ? 'Late' : 'Present'
            const dist = 35 + (j * 12) % 150

            sampleAttendance.push({
              worker_id: empId,
              site_id: site.site_id,
              date: dateStr,
              check_in: `${dateStr} ${checkInHour}`,
              check_out: `${dateStr} ${checkOutHour}`,
              hours: isLate ? 8.65 : 9.15,
              lat: Number(site.latitude) + (j * 0.0001),
              lon: Number(site.longitude) + (j * 0.0001),
              accuracy: 12.5,
              distance: dist,
              status: statusStr,
              is_late: isLate,
              remarks: isLate ? 'Slight traffic delay on OMR' : 'Verified spot check-in within geofence'
            })
          }
        }

        for (const att of sampleAttendance) {
          await connection.query(
            `INSERT INTO attendance_records 
             (worker_id, site_id, date, check_in_at, check_out_at, hours_worked, latitude, longitude, gps_accuracy, distance_meters, status, is_late, remarks)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE hours_worked=VALUES(hours_worked)`,
            [att.worker_id, att.site_id, att.date, att.check_in, att.check_out, att.hours, att.lat, att.lon, att.accuracy, att.distance, att.status, att.is_late, att.remarks]
          )
        }
        console.log('[AutoSeed] Verified initial attendance history records')
      }
    }

    console.log('[AutoSeed] Database seeding completed successfully with 100% complete records!')
  } catch (err) {
    console.error('[AutoSeed Error]', err)
  } finally {
    if (connection) connection.release()
  }
}
