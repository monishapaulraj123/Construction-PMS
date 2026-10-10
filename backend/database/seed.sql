USE construction_realestate_db;

-- 1. Seed Users (password123 hashed with bcrypt: $2b$10$8K1p/a0dL1LXMIgoEDFRwO5mE0X95gH3F/K9L1u9o1b.87eW4m2xW)
INSERT INTO users (user_id, name, email, password_hash, role, phone, status) VALUES
(1, 'Administrator', 'admin@constructionpms.in', '$2b$10$8K1p/a0dL1LXMIgoEDFRwO5mE0X95gH3F/K9L1u9o1b.87eW4m2xW', 'ADMIN', '9840012345', 'Active'),
(501, 'Ravi', 'ravi.kumar@gmail.com', '$2b$10$8K1p/a0dL1LXMIgoEDFRwO5mE0X95gH3F/K9L1u9o1b.87eW4m2xW', 'CLIENT', '9791122334', 'Active'),
(502, 'Anand', 'anand.sharma@gmail.com', '$2b$10$8K1p/a0dL1LXMIgoEDFRwO5mE0X95gH3F/K9L1u9o1b.87eW4m2xW', 'CLIENT', '9840998877', 'Active'),
(201, 'Santhosh Landowners', 'santhosh@landowners.in', '$2b$10$8K1p/a0dL1LXMIgoEDFRwO5mE0X95gH3F/K9L1u9o1b.87eW4m2xW', 'CLIENT', '9841029384', 'Active'),
(204, 'Selvam Realities', 'selvam@realities.in', '$2b$10$8K1p/a0dL1LXMIgoEDFRwO5mE0X95gH3F/K9L1u9o1b.87eW4m2xW', 'CLIENT', '9843300112', 'Active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Employee Types
INSERT INTO employee_types (employee_type_id, employee_type_code, employee_type_name, description, status) VALUES
(1, 'ET-01', 'Site Supervisor', 'Oversees day-to-day execution on site', 1),
(2, 'ET-02', 'Civil Engineer', 'Structural design and site engineering', 1),
(3, 'ET-03', 'Mason', 'Skilled masonry and brickwork labour', 1),
(4, 'ET-04', 'Electrician', 'Electrical installation and wiring', 1),
(5, 'ET-05', 'Plumber', 'Plumbing and sanitary fitting', 1),
(6, 'ET-06', 'Safety Officer', 'Site safety compliance and audits', 0)
ON DUPLICATE KEY UPDATE employee_type_name=VALUES(employee_type_name);

-- 3. Seed Item Categories
INSERT INTO item_categories (category_id, category_code, category_name, description, icon, image, status) VALUES
(1, 'CAT-01', 'Cement & Binding Agents', 'Ordinary Portland Cement, Pozzolana Cement, White Cement', 'Package', '/images/categories/cement.jpg', 1),
(2, 'CAT-02', 'Steel & TMT Bars', 'Thermo-Mechanically Treated reinforcing steel bars and rods', 'Layers', '/images/categories/steel.jpg', 1),
(3, 'CAT-03', 'Aggregates & Sand', 'M-Sand, P-Sand, Coarse Aggregate 20mm & 40mm', 'Grid', '/images/categories/sand.jpg', 1),
(4, 'CAT-04', 'Bricks & Blocks', 'Red Clay Bricks, AAC Light Weight Blocks, Concrete Blocks', 'Boxes', '/images/categories/bricks.jpg', 1),
(5, 'CAT-05', 'Electrical & Wiring', 'Copper Wires, PVC Conduits, Distribution Boards, Switches', 'Zap', '/images/categories/electrical.jpg', 1),
(6, 'CAT-06', 'Plumbing & Sanitary', 'CPVC Pipes, PVC Fittings, Taps, Sanitaryware', 'Droplets', '/images/categories/plumbing.jpg', 1)
ON DUPLICATE KEY UPDATE category_name=VALUES(category_name);

-- 4. Seed Suppliers
INSERT INTO suppliers (supplier_id, supplier_code, supplier_name, contact_person, phone, email, city, district, state, gst_number, address, rating, supplied_materials, status) VALUES
(1, 'SUP-01', 'Ultratech Cement Distributor', 'M. Ramanathan', '9840011223', 'sales@ultratechcbe.com', 'Chennai', 'Chennai', 'Tamil Nadu', '33AAACU1234F1Z5', '12 Industrial Estate, Guindy, Chennai', 4.8, 'Cement, Concrete', 1),
(2, 'SUP-02', 'Tata Tiscon Steel Traders', 'K. Suresh', '9842233445', 'info@tatiscbro.com', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', '33AABCT5678G2Z1', '45 Avinashi Road, Peelamedu, Coimbatore', 4.9, 'Steel, TMT Bars', 1),
(3, 'SUP-03', 'Kaveri M-Sand & Aggregates', 'P. Thirumurugan', '9843344556', 'orders@kaveri-msand.in', 'Trichy', 'Trichy', 'Tamil Nadu', '33AABCK9012H3Z7', '88 Bypass Road, Trichy', 4.6, 'Sand, Aggregates', 1),
(4, 'SUP-04', 'Finolex Electricals Hub', 'S. Vignesh', '9844455667', 'vignesh@finolexhub.in', 'Madurai', 'Madurai', 'Tamil Nadu', '33AABCF3456J4Z3', '102 KK Nagar, Madurai', 4.7, 'Electrical Wires, Pipes', 1)
ON DUPLICATE KEY UPDATE supplier_name=VALUES(supplier_name);

-- 5. Seed Items
INSERT INTO items (item_id, item_code, item_name, category_id, brand, unit, unit_price, stock_quantity, min_stock_level, supplier_id, status) VALUES
(1, 'ITM-01', 'UltraTech OPC 53 Grade Cement', 1, 'UltraTech', 'Bag (50kg)', 390.00, 850, 200, 1, 1),
(2, 'ITM-02', 'Tata Tiscon 500D TMT Rebars 12mm', 2, 'Tata Tiscon', 'Tonne', 64500.00, 28, 5, 2, 1),
(3, 'ITM-03', 'M-Sand (Manufactured Sand)', 3, 'Kaveri', 'Unit (100 cu.ft)', 4200.00, 45, 10, 3, 1),
(4, 'ITM-04', 'AAC Lightweight Blocks (600x200x150mm)', 4, 'Birla Aerocon', 'Piece', 68.00, 4200, 1000, 4, 1),
(5, 'ITM-05', 'Finolex 2.5 sq.mm Flame Retardant Wire', 5, 'Finolex', 'Box (90m)', 1850.00, 120, 30, 4, 1)
ON DUPLICATE KEY UPDATE item_name=VALUES(item_name);

-- 6. Seed Employees
INSERT INTO employees (employee_id, employee_code, employee_type_id, employee_type_name, first_name, last_name, phone, email, city, district, state, service, specialization, service_rate, rate_unit, availability, current_project_name, current_work, current_progress, completed_projects_count, completed_work_count, experience_years, qualification, gender, employment_status, profile_image, status) VALUES
(101, 'EMP-FL-01', 3, 'Flooring Specialist', 'Santhosh', '', '9840012353', 'santhosh.n@constructionpms.in', 'Chennai', 'Chennai', 'Tamil Nadu', 'Flooring', 'Vitrified & Italian Marble Tile Laying', 1600.00, 'Day', 'Assigned', 'Green Valley Residence', 'Tile Laying & Epoxy Grouting', 45, 8, 13, 5.5, 'Flooring Master & Tile Specialist', 'Male', 'Permanent', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=300&auto=format&fit=crop', 1),
(102, 'EMP-PT-01', 3, 'Painter', 'Vignesh', 'K', '9840012354', 'vignesh.k@constructionpms.in', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', 'Painting', 'Exterior Weather Proof & Interior Emulsion Coating', 1400.00, 'Day', 'Available', 'Apex Tech Park Commercial Complex', 'Exterior Primer & Wall Putty Application', 80, 12, 19, 7.0, 'Senior Painter & Spray Specialist', 'Male', 'Permanent', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop', 1),
(103, 'EMP-SV-01', 1, 'Site Supervisor', 'Raman', 'M', '9840012346', 'raman.m@constructionpms.in', 'Chennai', 'Chennai', 'Tamil Nadu', 'Supervision', 'Site Execution & Quality Control', 2500.00, 'Day', 'Assigned', 'Green Valley Residence', 'Roof Slab Concreting Supervision', 60, 15, 22, 10.0, 'B.E. Civil Engineering', 'Male', 'Permanent', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop', 1)
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);

-- 7. Seed Services
INSERT INTO services (service_id, service_code, service_name, description, category, rate_per_unit, unit, assigned_person_id, assigned_person_name, status) VALUES
(1, 'SRV-PAINT-01', 'Painting Work', 'Interior emulsion painting and exterior weather-proof coating', 'Finishing', 28.00, 'Sq. Ft', 102, 'Vignesh K', 1),
(2, 'SRV-FLOOR-01', 'Flooring & Tile Work', 'Vitrified tiles, granite slab, and marble laying with epoxy grouting', 'Finishing', 45.00, 'Sq. Ft', 101, 'Santhosh', 1),
(3, 'SRV-ELEC-01', 'Electrical Installation', 'Conduit piping, DB dressing, wiring and light fitting', 'MEP Services', 35.00, 'Point', NULL, '', 1),
(4, 'SRV-PLUMB-01', 'Plumbing & Sanitary', 'CPVC pipeline routing, sanitary fixtures installation and testing', 'MEP Services', 650.00, 'Fixture', NULL, '', 1)
ON DUPLICATE KEY UPDATE service_name=VALUES(service_name);

-- 8. Seed Construction Types
INSERT INTO construction_types (construction_type_id, construction_type_code, construction_type_name, description, status) VALUES
(1, 'CT-01', 'Residential House', 'Individual villas, independent houses, and duplex homes', 1),
(2, 'CT-02', 'Commercial Complex', 'Office buildings, retail stores, and commercial tech parks', 1),
(3, 'CT-03', 'Industrial Shed / Warehouse', 'Factory buildings, storage warehouses, and industrial sheds', 1),
(4, 'CT-04', 'Educational Institution', 'Schools, colleges, hostels, and academic blocks', 1),
(5, 'CT-05', 'Infrastructure / Road Work', 'Bituminous asphalt roads, concrete pavements, and stormwater drains', 1)
ON DUPLICATE KEY UPDATE construction_type_name=VALUES(construction_type_name);

-- 9. Seed Construction Stages
INSERT INTO construction_stages (stage_id, stage_code, stage_name, stage_sequence, description, status) VALUES
(1, 'STG-01', 'Site Preparation & Excavation', 1, 'Site clearing, levelling, demarcation, and foundation excavation', 1),
(2, 'STG-02', 'Foundation & Footing Work', 2, 'PCC bed, RCC footing, column starter, and plinth beam concreting', 1),
(3, 'STG-03', 'Substructure & Plinth Beam', 3, 'Backfilling, plinth masonry, damp proof course (DPC) and PCC floor bed', 1),
(4, 'STG-04', 'Superstructure Masonry', 4, 'Brickwork / AAC blockwork, lintel beams, and sunshade casting', 1),
(5, 'STG-05', 'Roof Slab & Concreting', 5, 'Shuttering, TMT steel binding, electrical conduit laying, and RCC slab casting', 1),
(6, 'STG-06', 'Plastering & Conduit Work', 6, 'Internal & external sand plastering, electrical box fixing, and plumbing lines', 1),
(7, 'STG-07', 'Flooring & Tile Work', 7, 'Vitrified tile laying, granite kitchen counter, and bathroom wall tiling', 1),
(8, 'STG-08', 'Painting & Finishing Work', 8, 'Wall putty, primer application, final emulsion paint, and door fitting', 1),
(9, 'STG-09', 'Final Inspection & Handover', 9, 'Deep cleaning, MEP fixture testing, snag list rectification, and key handover', 1)
ON DUPLICATE KEY UPDATE stage_name=VALUES(stage_name);

-- 10. Seed Clients
INSERT INTO clients (client_id, client_code, client_name, client_type, company_name, contact_person, phone, alternate_phone, email, user_id, address_line1, address_line2, city, district, state, pincode, status) VALUES
(1, 'CLI-01', 'Ravi', 'Individual', 'Ravi Villa Construction', 'Ravi Kumar', '9791122334', '9840011223', 'ravi.kumar@gmail.com', 501, '45 Greenways Road', 'RA Puram', 'Chennai', 'Chennai', 'Tamil Nadu', '600028', 1),
(2, 'CLI-02', 'Anand', 'Company', 'Anand Infra Pvt Ltd', 'Anand Sharma', '9840998877', '9840998866', 'anand.sharma@gmail.com', 502, '12 Race Course Road', 'Gopalapuram', 'Coimbatore', 'Coimbatore', 'Tamil Nadu', '641018', 1),
(3, 'CLI-03', 'Santhosh Landowners', 'Company', 'Santhosh Realty', 'Santhosh N', '9841029384', '9841029385', 'santhosh@landowners.in', 201, '88 ECR Highway', 'Kottivakkam', 'Chennai', 'Chennai', 'Tamil Nadu', '600041', 1)
ON DUPLICATE KEY UPDATE client_name=VALUES(client_name);

-- 11. Seed Projects
INSERT INTO projects (project_id, project_code, project_name, client_id, client_name, construction_type_id, construction_type_name, project_type_name, construction_stage_id, construction_stage_name, supervisor_id, supervisor_name, location, district, state, total_area, unit, estimated_budget, overall_progress_percentage, project_status, start_date, expected_completion_date, image, status) VALUES
(1, 'PRJ-2026-001', 'Green Valley Luxury Villa', 1, 'Ravi', 1, 'Residential House', 'Premium Villa Construction', 5, 'Roof Slab & Concreting', 103, 'Raman M', 'Kottivakkam, ECR', 'Chennai', 'Tamil Nadu', 3200.00, 'Sq. Ft', 8500000.00, 60, 'In Progress', '2025-11-01', '2026-08-30', 'https://images.unsplash.com/photo-1541976590-713941681591?q=80&w=800&auto=format&fit=crop', 1),
(2, 'PRJ-2026-002', 'Apex Tech Park Commercial Block', 2, 'Anand', 2, 'Commercial Complex', 'IT Park & Office Building', 8, 'Painting & Finishing Work', 103, 'Raman M', 'Avinashi Road', 'Coimbatore', 'Tamil Nadu', 18500.00, 'Sq. Ft', 42000000.00, 85, 'In Progress', '2025-06-15', '2026-05-15', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop', 1)
ON DUPLICATE KEY UPDATE project_name=VALUES(project_name);

-- 12. Seed Properties (Real Estate Module)
INSERT INTO properties (property_id, property_code, property_name, property_type, survey_number, location, district, state, pincode, area, unit, rate_per_unit, total_amount, seller_id, seller_name, seller_phone, seller_email, status, publication_status, verification_status, image, document_reference, description) VALUES
(101, 'PROP-001', 'ECR Sea Breeze Coastal Plot', 'Plot / Land', 'SY-142/3A', 'Kottivakkam, ECR Road', 'Chennai', 'Tamil Nadu', '600041', 4800.00, 'Sq. Ft', 4200.00, 20160000.00, 201, 'Santhosh Landowners', '9841029384', 'santhosh@landowners.in', 'Approved', 'Published', 'Verified', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop', 'DOC-ECR-2025-8812', 'Prime coastal land parcel suitable for residential luxury villa development.'),
(102, 'PROP-002', 'Avinashi Highway Commercial Land', 'Commercial Plot', 'SY-308/1B', 'Avinashi Road, Kalapatti', 'Coimbatore', 'Tamil Nadu', '641014', 2.50, 'Acres', 14000000.00, 35000000.00, 202, 'Vanguard Promoters', '9842201928', 'vanguard@realty.com', 'Approved', 'Published', 'Verified', '/avinashi_commercial_land.jpg', 'DOC-CBE-2025-5510', 'High visibility frontage land parcel on Avinashi main highway.'),
(103, 'PROP-003', 'Green Valley Premium Villa Plot #14', 'Residential Plot', 'SY-142/3A-P14', 'ECR Road, Kottivakkam', 'Chennai', 'Tamil Nadu', '600041', 2400.00, 'Sq. Ft', 5800.00, 13920000.00, 203, 'Kavitha Landowner', '9840112233', 'kavitha@gmail.com', 'Approved', 'Published', 'Verified', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop', 'DOC-GV-2025-104', 'Corner villa plot inside approved gated layout with 40ft road access.')
ON DUPLICATE KEY UPDATE property_name=VALUES(property_name);

-- 13. Seed Buy Requests
INSERT INTO buy_requests (request_id, request_code, property_id, property_name, buyer_id, buyer_name, buyer_email, buyer_phone, budget, requirements, status, current_stage, submitted_date, verification_status) VALUES
(301, 'REQ-BUY-101', 101, 'ECR Sea Breeze Coastal Plot', 501, 'Ravi', 'ravi.kumar@gmail.com', '9791122334', 21000000.00, 'Interested in purchasing plot for constructing a luxury villa.', 'Negotiation', 'Price Settlement', '2026-01-10', 'Verified'),
(302, 'REQ-BUY-102', 103, 'Green Valley Premium Villa Plot #14', 502, 'Anand', 'anand.sharma@gmail.com', '9840998877', 14000000.00, 'Immediate booking intent. Looking for clear title handover.', 'Transaction Processing', 'Advance Paid', '2026-01-15', 'Verified')
ON DUPLICATE KEY UPDATE request_code=VALUES(request_code);

-- 14. Seed Sell Requests
INSERT INTO sell_requests (sell_request_id, request_code, property_id, property_name, survey_number, location, district, state, pincode, area, unit, expected_rate, expected_total, seller_id, seller_name, seller_phone, seller_email, status, remarks, submitted_date, document_url) VALUES
(401, 'REQ-SEL-201', 104, 'Trichy Road Tech Park Site', 'SY-88/2C', 'Singanallur, Trichy Road', 'Coimbatore', 'Tamil Nadu', '641005', 12000.00, 'Sq. Ft', 3200.00, 38400000.00, 204, 'Selvam Realities', '9843300112', 'selvam@realities.in', 'Under Verification', 'DTCP NOC and survey sketch submitted for review.', '2026-02-01', 'DOC-TR-2026-009')
ON DUPLICATE KEY UPDATE request_code=VALUES(request_code);

-- 15. Seed Negotiations
INSERT INTO negotiations (negotiation_id, negotiation_code, request_id, property_id, property_name, buyer_id, buyer_name, seller_id, seller_name, initial_price, proposed_price, counter_offer, final_agreed_price, status, date, remarks) VALUES
(601, 'NEG-101', 301, 101, 'ECR Sea Breeze Coastal Plot', 501, 'Ravi', 201, 'Santhosh Landowners', 20160000.00, 19500000.00, 19800000.00, 19800000.00, 'Counter Offer', '2026-01-18', 'Seller offered ₹1.98 Cr final closing price.'),
(602, 'NEG-102', 302, 103, 'Green Valley Premium Villa Plot #14', 502, 'Anand', 203, 'Kavitha Landowner', 13920000.00, 13500000.00, 13800000.00, 13800000.00, 'Agreed', '2026-01-20', 'Final price agreed at ₹1.38 Cr. Transaction initiated.')
ON DUPLICATE KEY UPDATE negotiation_code=VALUES(negotiation_code);

-- 16. Seed Transactions
INSERT INTO transactions (transaction_id, transaction_code, request_id, property_id, property_name, buyer_id, buyer_name, buyer_contact, seller_id, seller_name, seller_contact, agreed_amount, payment_status, advance_amount, transaction_date, document_reference, status, admin_verification, remarks) VALUES
(701, 'TXN-2026-001', 302, 103, 'Green Valley Premium Villa Plot #14', 502, 'Anand', '9840998877', 203, 'Kavitha Landowner', '9840112233', 13800000.00, 'Advance Paid', 2500000.00, '2026-01-22', 'SALE-DEED-2026-882', 'Transaction Processing', 'Approved', 'Advance ₹25L received. Sub-registrar booking pending.'),
(702, 'TXN-2025-901', 300, 101, 'ECR Sea Breeze Coastal Plot', 501, 'Ravi', '9791122334', 201, 'Santhosh Landowners', '9841029384', 20160000.00, 'Completed', 20160000.00, '2025-11-10', 'DOC-ECR-2025-8812', 'Completed', 'Approved', 'Sale deed executed and handed over.')
ON DUPLICATE KEY UPDATE transaction_code=VALUES(transaction_code);

-- 17. Seed Payments
INSERT INTO payments (payment_id, payment_number, project_id, project_name, client_id, client_name, payment_type, category, amount, payment_date, payment_mode, status, description) VALUES
(1, 'PAY-2026-001', 1, 'Green Valley Luxury Villa', 1, 'Ravi', 'Income', 'Stage Advance', 1500000.00, '2026-01-05', 'Bank Transfer', 'Received', 'Stage 2 Foundation Advance Received from Client Ravi.'),
(2, 'PAY-2026-002', 1, 'Green Valley Luxury Villa', 1, 'Ravi', 'Expense', 'Material Purchase', 345000.00, '2026-01-12', 'Cheque', 'Paid', 'UltraTech OPC Cement Batch #401 payment to Ultratech Distributor.')
ON DUPLICATE KEY UPDATE payment_number=VALUES(payment_number);
