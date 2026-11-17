-- ==============================================================================
-- Construction PMS - Safe & Idempotent Inventory Migration Script
-- Compatible with MySQL 5.7+ / MySQL 8.0+ / Aiven Cloud MySQL
-- ==============================================================================

USE defaultdb;

-- 1. Ensure storage_location column exists on items table
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'items' AND COLUMN_NAME = 'storage_location';

SET @stmt = IF(@col_exists = 0, 'ALTER TABLE items ADD COLUMN storage_location VARCHAR(150) NULL AFTER brand', 'SELECT "Column storage_location already exists"');
PREPARE stmt1 FROM @stmt;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- 2. Ensure is_archived column exists on items table
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'items' AND COLUMN_NAME = 'is_archived';

SET @stmt = IF(@col_exists = 0, 'ALTER TABLE items ADD COLUMN is_archived TINYINT(1) DEFAULT 0 AFTER status', 'SELECT "Column is_archived already exists"');
PREPARE stmt2 FROM @stmt;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- 3. Ensure Inventory Tables Exist
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

-- 4. Idempotently Insert Item Categories
INSERT INTO item_categories (category_code, category_name, description, status)
VALUES 
  ('CAT-01', 'Cement', 'OPC, PPC and structural cement', 1),
  ('CAT-02', 'Steel', 'TMT bars, structural steel', 1),
  ('CAT-03', 'Bricks', 'Clay bricks and blocks', 1),
  ('CAT-04', 'Sand', 'River sand and M-sand', 1),
  ('CAT-05', 'Electrical', 'Wires, switches and conduits', 1)
ON DUPLICATE KEY UPDATE 
  category_name = VALUES(category_name),
  description = VALUES(description);

-- 5. Idempotently Insert Suppliers
INSERT INTO suppliers (supplier_code, supplier_name, phone, city, supplied_materials, status)
VALUES 
  ('SUP-01', 'Sri Balaji Cement Traders', '9840112233', 'Chennai', 'Cement, Bricks', 1),
  ('SUP-02', 'Chennai Steel House', '9840223344', 'Chennai', 'TMT Steel Bars', 1),
  ('SUP-03', 'Voltage Electricals', '9840334455', 'Coimbatore', 'Copper Wires, Switchgear', 1),
  ('SUP-04', 'AquaFlow Pipes & Fittings', '9840445566', 'Chennai', 'River Sand, CPVC', 1)
ON DUPLICATE KEY UPDATE 
  supplier_name = VALUES(supplier_name),
  phone = VALUES(phone),
  city = VALUES(city);

-- 6. Idempotently Insert 5 Baseline Materials (Dynamic Foreign Keys)
-- Only inserts if item_code does not already exist
INSERT INTO items (item_code, item_name, category_id, brand, storage_location, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status, is_archived, created_by)
SELECT 'ITM-001', 'OPC 53 Grade Cement', c.category_id, 'UltraTech', 'Main Warehouse - Bay A', 'Bag (50kg)', 420.00, 480, 200, s.supplier_id, 1, 0, 1
FROM (SELECT category_id FROM item_categories WHERE category_code = 'CAT-01' LIMIT 1) c
CROSS JOIN (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP-01' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM items WHERE item_code = 'ITM-001');

INSERT INTO items (item_code, item_name, category_id, brand, storage_location, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status, is_archived, created_by)
SELECT 'ITM-002', 'TMT Bar 12mm Fe500', c.category_id, 'Tata Tiscon', 'Yard - Sector 2', 'Kg', 68.00, 1600, 2000, s.supplier_id, 1, 0, 1
FROM (SELECT category_id FROM item_categories WHERE category_code = 'CAT-02' LIMIT 1) c
CROSS JOIN (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP-02' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM items WHERE item_code = 'ITM-002');

INSERT INTO items (item_code, item_name, category_id, brand, storage_location, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status, is_archived, created_by)
SELECT 'ITM-003', 'Red Clay Brick', c.category_id, 'Local Kiln', 'Open Yard - Bay B', 'Piece', 8.00, 8500, 5000, s.supplier_id, 1, 0, 1
FROM (SELECT category_id FROM item_categories WHERE category_code = 'CAT-03' LIMIT 1) c
CROSS JOIN (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP-01' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM items WHERE item_code = 'ITM-003');

INSERT INTO items (item_code, item_name, category_id, brand, storage_location, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status, is_archived, created_by)
SELECT 'ITM-004', 'River Sand', c.category_id, 'River Bed Gold', 'Aggregates Pit 1', 'Cubic Ft', 55.00, 920, 800, s.supplier_id, 1, 0, 1
FROM (SELECT category_id FROM item_categories WHERE category_code = 'CAT-04' LIMIT 1) c
CROSS JOIN (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP-04' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM items WHERE item_code = 'ITM-004');

INSERT INTO items (item_code, item_name, category_id, brand, storage_location, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status, is_archived, created_by)
SELECT 'ITM-005', 'Copper Wire 2.5mm', c.category_id, 'Polycab', 'Warehouse Rack 3', 'Meter', 24.00, 1450, 1000, s.supplier_id, 1, 0, 1
FROM (SELECT category_id FROM item_categories WHERE category_code = 'CAT-05' LIMIT 1) c
CROSS JOIN (SELECT supplier_id FROM suppliers WHERE supplier_code = 'SUP-03' LIMIT 1) s
WHERE NOT EXISTS (SELECT 1 FROM items WHERE item_code = 'ITM-005');

-- 7. Idempotently Insert Opening Balance Ledger Entries
INSERT INTO inventory_transactions (transaction_code, item_id, movement_type, quantity, unit_cost, total_cost, storage_location, remarks, created_by)
SELECT CONCAT('TXN-OPEN-', i.item_code), i.item_id, 'STOCK_IN', i.stock_quantity, i.unit_price, (i.stock_quantity * i.unit_price), i.storage_location, 'Opening Baseline Stock Balance', 1
FROM items i
WHERE i.item_code IN ('ITM-001', 'ITM-002', 'ITM-003', 'ITM-004', 'ITM-005')
  AND NOT EXISTS (
    SELECT 1 FROM inventory_transactions t WHERE t.transaction_code = CONCAT('TXN-OPEN-', i.item_code)
  );

-- 8. Final Verification
SELECT item_id, item_code, item_name, brand, storage_location, unit, stock_quantity, unit_price 
FROM items 
WHERE is_archived = 0 OR is_archived IS NULL;
