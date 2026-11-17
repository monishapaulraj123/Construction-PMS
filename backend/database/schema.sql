CREATE DATABASE IF NOT EXISTS construction_realestate_db;
USE construction_realestate_db;

-- 1. Users Table (Admin & Client logins)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CLIENT') NOT NULL DEFAULT 'CLIENT',
    phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Employee Types Master Table
CREATE TABLE IF NOT EXISTS employee_types (
    employee_type_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_type_code VARCHAR(50) UNIQUE NOT NULL,
    employee_type_name VARCHAR(100) NOT NULL,
    description TEXT,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Item Categories Master Table
CREATE TABLE IF NOT EXISTS item_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Package',
    image VARCHAR(255),
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Suppliers Master Table
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(150),
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(30),
    gst_number VARCHAR(50),
    address TEXT,
    rating DECIMAL(3,2) DEFAULT 4.50,
    certification VARCHAR(150),
    moq_default DECIMAL(10,2) DEFAULT 1.00,
    supplied_materials VARCHAR(255),
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Items Master Table
CREATE TABLE IF NOT EXISTS items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    category_id INT,
    brand VARCHAR(100),
    storage_location VARCHAR(150),
    unit VARCHAR(30),
    unit_price DECIMAL(12,2) DEFAULT 0.00,
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 0,
    supplier_id INT,
    status TINYINT(1) DEFAULT 1,
    is_archived TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (category_id) REFERENCES item_categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Employees Master Table
CREATE TABLE IF NOT EXISTS employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    employee_type_id INT,
    employee_type_name VARCHAR(100),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(150),
    aadhaar_number VARCHAR(50),
    pan_number VARCHAR(50),
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(30),
    micr_code VARCHAR(30),
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    service VARCHAR(100),
    specialization VARCHAR(150),
    service_rate DECIMAL(12,2) DEFAULT 0.00,
    rate_unit VARCHAR(30) DEFAULT 'Day',
    availability VARCHAR(50) DEFAULT 'Available',
    current_project_name VARCHAR(150),
    current_work VARCHAR(150),
    current_progress INT DEFAULT 0,
    completed_projects_count INT DEFAULT 0,
    completed_work_count INT DEFAULT 0,
    experience_years DECIMAL(4,1) DEFAULT 0.0,
    qualification VARCHAR(150),
    gender VARCHAR(20),
    employment_status VARCHAR(50) DEFAULT 'Permanent',
    profile_image VARCHAR(255),
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (employee_type_id) REFERENCES employee_types(employee_type_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Services Master Table
CREATE TABLE IF NOT EXISTS services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_code VARCHAR(50) UNIQUE NOT NULL,
    service_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    rate_per_unit DECIMAL(12,2) DEFAULT 0.00,
    unit VARCHAR(30),
    assigned_person_id INT,
    assigned_person_name VARCHAR(150),
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (assigned_person_id) REFERENCES employees(employee_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Construction Types Master Table
CREATE TABLE IF NOT EXISTS construction_types (
    construction_type_id INT AUTO_INCREMENT PRIMARY KEY,
    construction_type_code VARCHAR(50) UNIQUE NOT NULL,
    construction_type_name VARCHAR(100) NOT NULL,
    description TEXT,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Construction Stages Master Table
CREATE TABLE IF NOT EXISTS construction_stages (
    stage_id INT AUTO_INCREMENT PRIMARY KEY,
    stage_code VARCHAR(50) UNIQUE NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    stage_sequence INT NOT NULL DEFAULT 1,
    description TEXT,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Clients Master Table
CREATE TABLE IF NOT EXISTS clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    client_code VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    client_type VARCHAR(50) NOT NULL DEFAULT 'Individual',
    company_name VARCHAR(150),
    contact_person VARCHAR(100),
    phone VARCHAR(30) NOT NULL,
    alternate_phone VARCHAR(30),
    email VARCHAR(150),
    user_id INT,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(150) NOT NULL,
    client_id INT,
    client_name VARCHAR(150),
    construction_type_id INT,
    construction_type_name VARCHAR(100),
    project_type_name VARCHAR(100),
    construction_stage_id INT,
    construction_stage_name VARCHAR(100),
    supervisor_id INT,
    supervisor_name VARCHAR(150),
    location VARCHAR(150),
    district VARCHAR(100),
    state VARCHAR(100),
    total_area DECIMAL(12,2),
    unit VARCHAR(30) DEFAULT 'Sq. Ft',
    estimated_budget DECIMAL(15,2) DEFAULT 0.00,
    overall_progress_percentage INT DEFAULT 0,
    project_status VARCHAR(50) DEFAULT 'In Progress',
    start_date DATE,
    expected_completion_date DATE,
    image VARCHAR(255),
    budget_estimation JSON,
    house_plan JSON,
    status TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE SET NULL,
    FOREIGN KEY (construction_type_id) REFERENCES construction_types(construction_type_id) ON DELETE SET NULL,
    FOREIGN KEY (construction_stage_id) REFERENCES construction_stages(stage_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Properties Table (Real Estate Module)
CREATE TABLE IF NOT EXISTS properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    property_code VARCHAR(50) UNIQUE NOT NULL,
    property_name VARCHAR(150) NOT NULL,
    property_type VARCHAR(100) NOT NULL,
    survey_number VARCHAR(100),
    location VARCHAR(150),
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    area DECIMAL(12,2),
    unit VARCHAR(30) DEFAULT 'Sq. Ft',
    rate_per_unit DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    seller_id INT,
    seller_name VARCHAR(150),
    seller_phone VARCHAR(30),
    seller_email VARCHAR(150),
    status VARCHAR(50) DEFAULT 'Approved',
    publication_status VARCHAR(50) DEFAULT 'Published',
    verification_status VARCHAR(50) DEFAULT 'Verified',
    image VARCHAR(255),
    document_reference VARCHAR(100),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Buy Requests Table (Real Estate)
CREATE TABLE IF NOT EXISTS buy_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(50) UNIQUE NOT NULL,
    property_id INT,
    property_name VARCHAR(150),
    buyer_id INT,
    buyer_name VARCHAR(150),
    buyer_email VARCHAR(150),
    buyer_phone VARCHAR(30),
    budget DECIMAL(15,2) DEFAULT 0.00,
    requirements TEXT,
    status VARCHAR(50) DEFAULT 'Submitted',
    current_stage VARCHAR(50) DEFAULT 'Submitted',
    submitted_date DATE,
    verification_status VARCHAR(50) DEFAULT 'Under Review',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Sell Requests Table (Real Estate)
CREATE TABLE IF NOT EXISTS sell_requests (
    sell_request_id INT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(50) UNIQUE NOT NULL,
    property_id INT,
    property_name VARCHAR(150),
    survey_number VARCHAR(100),
    location VARCHAR(150),
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    area DECIMAL(12,2),
    unit VARCHAR(30) DEFAULT 'Sq. Ft',
    expected_rate DECIMAL(15,2) DEFAULT 0.00,
    expected_total DECIMAL(15,2) DEFAULT 0.00,
    seller_id INT,
    seller_name VARCHAR(150),
    seller_phone VARCHAR(30),
    seller_email VARCHAR(150),
    status VARCHAR(50) DEFAULT 'Under Verification',
    remarks TEXT,
    submitted_date DATE,
    document_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. Negotiations Table (Real Estate)
CREATE TABLE IF NOT EXISTS negotiations (
    negotiation_id INT AUTO_INCREMENT PRIMARY KEY,
    negotiation_code VARCHAR(50) UNIQUE NOT NULL,
    request_id INT,
    property_id INT,
    property_name VARCHAR(150),
    buyer_id INT,
    buyer_name VARCHAR(150),
    seller_id INT,
    seller_name VARCHAR(150),
    initial_price DECIMAL(15,2) DEFAULT 0.00,
    proposed_price DECIMAL(15,2) DEFAULT 0.00,
    counter_offer DECIMAL(15,2) DEFAULT 0.00,
    final_agreed_price DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'In Progress',
    date DATE,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. Transactions Table (Real Estate)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    request_id INT,
    property_id INT,
    property_name VARCHAR(150),
    buyer_id INT,
    buyer_name VARCHAR(150),
    buyer_contact VARCHAR(30),
    seller_id INT,
    seller_name VARCHAR(150),
    seller_contact VARCHAR(30),
    agreed_amount DECIMAL(15,2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'Pending',
    advance_amount DECIMAL(15,2) DEFAULT 0.00,
    transaction_date DATE,
    document_reference VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Transaction Processing',
    admin_verification VARCHAR(50) DEFAULT 'Pending',
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. Payments Table (Financials)
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    project_id INT,
    project_name VARCHAR(150),
    client_id INT,
    client_name VARCHAR(150),
    payment_type VARCHAR(50) DEFAULT 'Income',
    category VARCHAR(100),
    amount DECIMAL(15,2) DEFAULT 0.00,
    payment_date DATE,
    payment_mode VARCHAR(50) DEFAULT 'Bank Transfer',
    status VARCHAR(50) DEFAULT 'Received',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. Employee Assignments Table
CREATE TABLE IF NOT EXISTS employee_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    employee_name VARCHAR(150),
    project_id INT,
    project_name VARCHAR(150),
    service_name VARCHAR(100),
    role_in_project VARCHAR(100),
    assigned_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. Inventory Transactions (Movement Ledger)
CREATE TABLE IF NOT EXISTS inventory_transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    item_id INT NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    project_id INT NULL,
    supplier_id INT NULL,
    allocation_id INT NULL,
    issued_to VARCHAR(150) NULL,
    purpose TEXT NULL,
    reference_no VARCHAR(100) NULL,
    storage_location VARCHAR(150) NULL,
    remarks TEXT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. Material Allocations Table
CREATE TABLE IF NOT EXISTS material_allocations (
    allocation_id INT AUTO_INCREMENT PRIMARY KEY,
    allocation_code VARCHAR(100) UNIQUE NOT NULL,
    item_id INT NOT NULL,
    project_id INT NOT NULL,
    allocated_quantity DECIMAL(12,2) NOT NULL,
    issued_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    returned_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    allocated_date DATE NOT NULL,
    remarks TEXT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. Material RFQs Table
CREATE TABLE IF NOT EXISTS material_rfqs (
    rfq_id INT AUTO_INCREMENT PRIMARY KEY,
    rfq_code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    project_id INT NULL,
    required_delivery_date DATE NULL,
    status VARCHAR(30) DEFAULT 'PUBLISHED',
    remarks TEXT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 22. RFQ Line Items Table
CREATE TABLE IF NOT EXISTS rfq_items (
    rfq_item_id INT AUTO_INCREMENT PRIMARY KEY,
    rfq_id INT NOT NULL,
    item_id INT NOT NULL,
    requested_quantity DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (rfq_id) REFERENCES material_rfqs(rfq_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 23. Supplier Quotations Table
CREATE TABLE IF NOT EXISTS supplier_quotations (
    quotation_id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_code VARCHAR(100) UNIQUE NOT NULL,
    rfq_id INT NOT NULL,
    supplier_id INT NOT NULL,
    delivery_days INT DEFAULT 7,
    status VARCHAR(30) DEFAULT 'SUBMITTED',
    remarks TEXT NULL,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rfq_id) REFERENCES material_rfqs(rfq_id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 24. Quotation Line Items Table
CREATE TABLE IF NOT EXISTS quotation_items (
    quotation_item_id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    item_id INT NOT NULL,
    quoted_quantity DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    line_total DECIMAL(12,2) NOT NULL,
    has_certification TINYINT(1) DEFAULT 1,
    available_stock DECIMAL(12,2) DEFAULT 1000.00,
    moq DECIMAL(12,2) DEFAULT 1.00,
    FOREIGN KEY (quotation_id) REFERENCES supplier_quotations(quotation_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 25. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    po_id INT AUTO_INCREMENT PRIMARY KEY,
    po_code VARCHAR(100) UNIQUE NOT NULL,
    quotation_id INT NULL,
    rfq_id INT NULL,
    project_id INT NULL,
    supplier_id INT NULL,
    expected_delivery_date DATE NULL,
    delivery_location VARCHAR(255) NULL,
    status VARCHAR(30) DEFAULT 'ISSUED',
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    paid_amount DECIMAL(12,2) DEFAULT 0.00,
    delivered_at DATETIME NULL,
    remarks TEXT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 26. Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    po_item_id INT AUTO_INCREMENT PRIMARY KEY,
    po_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 27. Supplier Reviews Table
CREATE TABLE IF NOT EXISTS supplier_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    rating DECIMAL(3,2) DEFAULT 4.00,
    review_text TEXT NULL,
    reviewer_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 28. Recommendation Weights Table
CREATE TABLE IF NOT EXISTS recommendation_weights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    criterion VARCHAR(50) UNIQUE NOT NULL,
    weight_percent DECIMAL(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 29. Construction Sites Table
CREATE TABLE IF NOT EXISTS construction_sites (
    site_id INT AUTO_INCREMENT PRIMARY KEY,
    site_code VARCHAR(50) UNIQUE NOT NULL,
    site_name VARCHAR(150) NOT NULL,
    project_id INT NULL,
    address TEXT,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    radius_meters INT DEFAULT 300,
    max_gps_accuracy INT DEFAULT 150,
    working_start_time VARCHAR(10) DEFAULT '09:00',
    working_end_time VARCHAR(10) DEFAULT '18:00',
    grace_period_minutes INT DEFAULT 15,
    supervisor_id INT NULL,
    supervisor_name VARCHAR(150),
    status VARCHAR(20) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 30. Worker Site Assignments Table
CREATE TABLE IF NOT EXISTS worker_site_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    site_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES construction_sites(site_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 31. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    worker_id INT NOT NULL,
    site_id INT NOT NULL,
    date DATE NOT NULL,
    check_in_at DATETIME NOT NULL,
    check_out_at DATETIME NULL,
    hours_worked DECIMAL(5,2) DEFAULT 0.00,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    gps_accuracy DECIMAL(8,2) NOT NULL,
    distance_meters INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'Present',
    is_late TINYINT(1) DEFAULT 0,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_worker_daily_attendance (worker_id, date),
    FOREIGN KEY (worker_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES construction_sites(site_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 32. Attendance Correction Requests Table
CREATE TABLE IF NOT EXISTS attendance_corrections (
    correction_id INT AUTO_INCREMENT PRIMARY KEY,
    attendance_id INT NULL,
    worker_id INT NOT NULL,
    site_id INT NOT NULL,
    requested_check_in DATETIME NULL,
    requested_check_out DATETIME NULL,
    reason TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending',
    reviewed_by INT NULL,
    reviewed_by_name VARCHAR(150) NULL,
    reviewed_at DATETIME NULL,
    review_remarks TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES construction_sites(site_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 33. Recently Accessed Table
CREATE TABLE IF NOT EXISTS recently_accessed (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    resource_name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY user_resource_unique (user_id, resource_type, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 34. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 35. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
