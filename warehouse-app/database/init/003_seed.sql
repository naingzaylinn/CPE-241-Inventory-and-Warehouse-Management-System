INSERT INTO product_type (type_id, type_name) VALUES
('T01', 'Raw Material'),
('T02', 'Finished Good'),
('T03', 'Packaging')
ON CONFLICT (type_id) DO NOTHING;

INSERT INTO units (unit_id, unit_name) VALUES
('U01', 'Piece'),
('U02', 'Kilogram'),
('U03', 'Box')
ON CONFLICT (unit_id) DO NOTHING;

INSERT INTO warehouse (warehouse_id, warehouse_name, location) VALUES
('WH-01', 'Main Warehouse', 'Bangkok'),
('WH-02', 'Retail Warehouse', 'Thonburi')
ON CONFLICT (warehouse_id) DO NOTHING;

INSERT INTO supplier (supplier_id, supplier_name, contact_info) VALUES
('SUP-01', 'Golden Supply Co.', 'purchase@goldensupply.example'),
('SUP-02', 'Metro Materials', '02-555-0199')
ON CONFLICT (supplier_id) DO NOTHING;

INSERT INTO customer (customer_id, customer_name, contact_info) VALUES
('CUS-01', 'Bangkok Retail Mart', 'sales@bkkretail.example'),
('CUS-02', 'North City Store', '02-555-0144')
ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO product (product_code, product_name, type_id, unit_id, price, has_bom) VALUES
('PRD-001', 'Cotton Fabric', 'T01', 'U02', 120.00, false),
('PRD-002', 'Button Set', 'T01', 'U03', 35.00, false),
('PRD-003', 'Shirt Box', 'T03', 'U01', 12.00, false),
('PRD-004', 'Classic Shirt', 'T02', 'U01', 450.00, true)
ON CONFLICT (product_code) DO NOTHING;

INSERT INTO bill_of_materials (product_code, material_code, quantity_needed, unit_id, unit_price) VALUES
('PRD-004', 'PRD-001', 0.750, 'U02', 120.00),
('PRD-004', 'PRD-002', 1.000, 'U03', 35.00),
('PRD-004', 'PRD-003', 1.000, 'U01', 12.00)
ON CONFLICT (product_code, material_code) DO NOTHING;
