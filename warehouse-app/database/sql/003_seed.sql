-- ============================================================
-- Seed data — realistic test data for all reports
-- ============================================================

-- Product Types
INSERT INTO product_type VALUES
('T01','Raw Material'),
('T02','Finished Good'),
('T03','Packaging Material'),
('T04','Consumable'),
('T05','Spare Part'),
('T06','Chemicals'),
('T07','Safety Gear'),
('T08','Electrical Component'),
('T09','Mechanical Component'),
('T10','Office Supply');

-- Units
INSERT INTO units VALUES
('U01','Piece'),
('U02','Kilogram'),
('U03','Liter'),
('U04','Box'),
('U05','Meter'),
('U06','Roll'),
('U07','Set'),
('U08','Drum'),
('U09','Sheet'),
('U10','Pair');

-- Warehouses
INSERT INTO warehouse VALUES
('WH-01','Main Warehouse','Bangkok - Lat Krabang Zone A'),
('WH-02','North Regional Warehouse','Chiang Mai - Hang Dong Industrial'),
('WH-03','South Regional Warehouse','Phuket - Rassada Port Zone'),
('WH-04','East Warehouse','Chonburi - Amata City Estate'),
('WH-05','Central Distribution Hub','Bangkok - Rama 9 Zone B');

-- Suppliers
INSERT INTO supplier VALUES
('SUP-01','Bangkok Steel Co., Ltd.','02-111-2233'),
('SUP-02','Thai Paint & Coating Ltd.','02-222-3344'),
('SUP-03','Packing World Co., Ltd.','02-333-4455'),
('SUP-04','ElectroParts (Thailand) Co.','02-444-5566'),
('SUP-05','Wire & Cable Supply Co.','02-555-6677'),
('SUP-06','Northern Metals Co., Ltd.','053-100-1111'),
('SUP-07','Southern Plastics Industry','074-200-2222'),
('SUP-08','Eastern Rubber Products','043-300-3333'),
('SUP-09','Global Electronics Ltd.','02-600-7788'),
('SUP-10','Prime Packaging Solutions','02-700-8899');

-- Customers
INSERT INTO customer VALUES
('CUS-01','ABC Trading Co., Ltd.','02-100-1111'),
('CUS-02','XYZ Manufacturing Co.','02-200-2222'),
('CUS-03','Sunrise Electronics Ltd.','02-300-3333'),
('CUS-04','Delta Builders Co., Ltd.','02-400-4444'),
('CUS-05','Metro Industrial Supplies','02-500-5555'),
('CUS-06','Golden Parts Co., Ltd.','02-600-6666'),
('CUS-07','Thai Industrial Group','02-700-7777'),
('CUS-08','Pacific Trading Co., Ltd.','02-800-8888'),
('CUS-09','Vertex Solutions Co.','02-900-9999'),
('CUS-10','Crown Manufacturing Ltd.','02-010-0000'),
('CUS-11','Horizon Builders Co.','02-011-1111'),
('CUS-12','Apex Electronics Co., Ltd.','02-022-2222'),
('CUS-13','Blue Star Trading Co.','02-033-3333'),
('CUS-14','Diamond Supply Co., Ltd.','02-044-4444'),
('CUS-15','Omega Industries Thailand','02-055-5555');

-- Products (raw materials first so BOM can reference them)
INSERT INTO product VALUES
('PRD-001','Steel Bolt M8',        'T01','U01',2.50,   false),
('PRD-002','Steel Plate 3mm',      'T01','U02',45.00,  false),
('PRD-003','Paint (Blue)',         'T03','U03',120.00, false),
('PRD-004','Cardboard Box',        'T03','U04',15.00,  false),
('PRD-005','Welding Rod 3.2mm',    'T04','U01',8.00,   false),
('PRD-006','Metal Frame Type A',   'T02','U01',350.00, true),
('PRD-007','Painted Steel Panel',  'T02','U01',480.00, true),
('PRD-008','Assembly Unit Model A','T02','U01',900.00, true),
('PRD-009','Rubber Gasket 50mm',   'T01','U01',5.00,   false),
('PRD-010','Copper Wire 2.5mm',    'T01','U05',30.00,  false),
('PRD-011','Plastic Casing Type B','T02','U01',200.00, true),
('PRD-012','Circuit Board PCB-12', 'T08','U01',750.00, false),
('PRD-013','Power Cable 3x2.5mm',  'T01','U05',25.00,  false),
('PRD-014','Electronic Control Unit B','T02','U01',1200.00,true),
('PRD-015','Protective Packing Foam','T03','U04',20.00, false),
('PRD-016','Hydraulic Oil ISO 46', 'T06','U08',150.00, false),
('PRD-017','Safety Helmet Type A', 'T07','U01',450.00, false),
('PRD-018','Work Gloves Cut-5',    'T07','U10',85.00,  false),
('PRD-019','Aluminum Sheet 2mm',   'T01','U09',110.00, false),
('PRD-020','Stainless Pipe 1 inch','T09','U05',95.00,  false);

-- Bill of Materials
INSERT INTO bill_of_materials(product_code,material_code,quantity_needed,unit_id,unit_price) VALUES
-- PRD-006 Metal Frame Type A
('PRD-006','PRD-002',2.000,'U02',45.00),
('PRD-006','PRD-001',8.000,'U01',2.50),
('PRD-006','PRD-005',3.000,'U01',8.00),
-- PRD-007 Painted Steel Panel
('PRD-007','PRD-002',1.500,'U02',45.00),
('PRD-007','PRD-003',0.500,'U03',120.00),
('PRD-007','PRD-001',4.000,'U01',2.50),
-- PRD-008 Assembly Unit Model A
('PRD-008','PRD-006',1.000,'U01',350.00),
('PRD-008','PRD-009',4.000,'U01',5.00),
('PRD-008','PRD-005',2.000,'U01',8.00),
-- PRD-011 Plastic Casing Type B
('PRD-011','PRD-004',1.000,'U04',15.00),
('PRD-011','PRD-015',1.000,'U04',20.00),
('PRD-011','PRD-009',2.000,'U01',5.00),
-- PRD-014 Electronic Control Unit B
('PRD-014','PRD-012',1.000,'U01',750.00),
('PRD-014','PRD-010',2.000,'U05',30.00),
('PRD-014','PRD-013',1.500,'U05',25.00);

-- ── Purchase Stock Headers ───────────────────────────────────
INSERT INTO stock_header VALUES
('STK-P-001','2025-01-05','WH-01','Purchase','SUP-01'),
('STK-P-002','2025-01-08','WH-01','Purchase','SUP-02'),
('STK-P-003','2025-01-12','WH-02','Purchase','SUP-03'),
('STK-P-004','2025-01-15','WH-01','Purchase','SUP-04'),
('STK-P-005','2025-01-20','WH-03','Purchase','SUP-05'),
('STK-P-006','2025-01-22','WH-01','Purchase','SUP-01'),
('STK-P-007','2025-01-25','WH-02','Purchase','SUP-02'),
('STK-P-008','2025-02-01','WH-01','Purchase','SUP-03'),
('STK-P-009','2025-02-05','WH-01','Purchase','SUP-04'),
('STK-P-010','2025-02-10','WH-03','Purchase','SUP-05'),
('STK-P-011','2025-02-12','WH-01','Purchase Return','SUP-01'),
('STK-P-012','2025-02-15','WH-02','Purchase Return','SUP-02'),
('STK-P-013','2025-02-18','WH-01','Purchase','SUP-03'),
('STK-P-014','2025-02-20','WH-01','Purchase','SUP-04'),
('STK-P-015','2025-02-25','WH-03','Purchase','SUP-05'),
('STK-P-016','2025-03-01','WH-01','Purchase','SUP-06'),
('STK-P-017','2025-03-05','WH-01','Purchase','SUP-07'),
('STK-P-018','2025-03-10','WH-02','Purchase','SUP-08'),
('STK-P-019','2025-03-15','WH-01','Purchase','SUP-09'),
('STK-P-020','2025-03-20','WH-03','Purchase','SUP-10');

-- Purchase Line Items
INSERT INTO stock_purchase_line(stock_no,product_code,ref_po_no,quantity_in,quantity_out,unit_id,unit_price) VALUES
('STK-P-001','PRD-001','PO-2025-001',100,NULL,'U01',2.50),
('STK-P-001','PRD-002','PO-2025-001',50, NULL,'U02',45.00),
('STK-P-002','PRD-003','PO-2025-002',30, NULL,'U03',120.00),
('STK-P-003','PRD-004','PO-2025-003',200,NULL,'U04',15.00),
('STK-P-004','PRD-012','PO-2025-004',20, NULL,'U01',750.00),
('STK-P-005','PRD-010','PO-2025-005',100,NULL,'U05',30.00),
('STK-P-006','PRD-005','PO-2025-006',80, NULL,'U01',8.00),
('STK-P-007','PRD-009','PO-2025-007',150,NULL,'U01',5.00),
('STK-P-008','PRD-013','PO-2025-008',60, NULL,'U05',25.00),
('STK-P-009','PRD-015','PO-2025-009',100,NULL,'U04',20.00),
('STK-P-010','PRD-001','PO-2025-010',200,NULL,'U01',2.50),
('STK-P-011','PRD-002','PO-2025-001',NULL,10, 'U02',45.00),
('STK-P-012','PRD-003','PO-2025-002',NULL,5,  'U03',120.00),
('STK-P-013','PRD-002','PO-2025-011',40, NULL,'U02',45.00),
('STK-P-014','PRD-012','PO-2025-012',15, NULL,'U01',750.00),
('STK-P-015','PRD-010','PO-2025-013',80, NULL,'U05',30.00),
('STK-P-016','PRD-016','PO-2025-014',50, NULL,'U08',150.00),
('STK-P-017','PRD-017','PO-2025-015',20, NULL,'U01',450.00),
('STK-P-018','PRD-018','PO-2025-016',100,NULL,'U10',85.00),
('STK-P-019','PRD-019','PO-2025-017',200,NULL,'U09',110.00),
('STK-P-020','PRD-020','PO-2025-018',60, NULL,'U05',95.00);

-- ── Sales Stock Headers ──────────────────────────────────────
INSERT INTO stock_sales_header VALUES
('STK-S-001','2025-01-10','WH-01','Sales','CUS-01'),
('STK-S-002','2025-01-12','WH-01','Sales','CUS-02'),
('STK-S-003','2025-01-15','WH-02','Sales','CUS-03'),
('STK-S-004','2025-01-18','WH-01','Sales','CUS-04'),
('STK-S-005','2025-01-20','WH-03','Sales','CUS-05'),
('STK-S-006','2025-01-22','WH-01','Sales','CUS-01'),
('STK-S-007','2025-01-25','WH-02','Sales','CUS-02'),
('STK-S-008','2025-02-02','WH-01','Sales','CUS-03'),
('STK-S-009','2025-02-06','WH-01','Sales','CUS-04'),
('STK-S-010','2025-02-10','WH-03','Sales','CUS-05'),
('STK-S-011','2025-02-13','WH-01','Sales Return','CUS-01'),
('STK-S-012','2025-02-16','WH-02','Sales Return','CUS-02'),
('STK-S-013','2025-02-19','WH-01','Sales','CUS-03'),
('STK-S-014','2025-02-22','WH-01','Sales','CUS-04'),
('STK-S-015','2025-02-26','WH-03','Sales','CUS-05'),
('STK-S-016','2025-03-01','WH-01','Sales','CUS-06'),
('STK-S-017','2025-03-05','WH-02','Sales','CUS-07'),
('STK-S-018','2025-03-10','WH-01','Sales','CUS-08'),
('STK-S-019','2025-03-15','WH-01','Sales','CUS-09'),
('STK-S-020','2025-03-20','WH-03','Sales','CUS-10');

-- Sales Line Items
INSERT INTO stock_sales_line(stock_no,product_code,ref_so_no,quantity_out,quantity_in,unit_id,unit_price) VALUES
('STK-S-001','PRD-006','SO-2025-001',10,  NULL,'U01',350.00),
('STK-S-002','PRD-007','SO-2025-002',5,   NULL,'U01',480.00),
('STK-S-003','PRD-008','SO-2025-003',3,   NULL,'U01',900.00),
('STK-S-004','PRD-011','SO-2025-004',8,   NULL,'U01',200.00),
('STK-S-005','PRD-014','SO-2025-005',2,   NULL,'U01',1200.00),
('STK-S-006','PRD-006','SO-2025-006',6,   NULL,'U01',350.00),
('STK-S-007','PRD-007','SO-2025-007',4,   NULL,'U01',480.00),
('STK-S-008','PRD-008','SO-2025-008',2,   NULL,'U01',900.00),
('STK-S-009','PRD-011','SO-2025-009',5,   NULL,'U01',200.00),
('STK-S-010','PRD-014','SO-2025-010',3,   NULL,'U01',1200.00),
('STK-S-011','PRD-006','SO-2025-001',NULL,2,   'U01',350.00),
('STK-S-012','PRD-007','SO-2025-002',NULL,1,   'U01',480.00),
('STK-S-013','PRD-008','SO-2025-011',2,   NULL,'U01',900.00),
('STK-S-014','PRD-011','SO-2025-012',4,   NULL,'U01',200.00),
('STK-S-015','PRD-014','SO-2025-013',1,   NULL,'U01',1200.00),
('STK-S-016','PRD-006','SO-2025-014',3,   NULL,'U01',350.00),
('STK-S-017','PRD-007','SO-2025-015',2,   NULL,'U01',480.00),
('STK-S-018','PRD-008','SO-2025-016',1,   NULL,'U01',900.00),
('STK-S-019','PRD-011','SO-2025-017',4,   NULL,'U01',200.00),
('STK-S-020','PRD-014','SO-2025-018',2,   NULL,'U01',1200.00);

-- ── Stock Adjustment Headers ─────────────────────────────────
INSERT INTO stock_adjustment_header(stock_no,stock_date,warehouse_id,reason,reason_for_adjustment) VALUES
('STK-A-001','2025-01-15','WH-01','Stock Adjustment','Routine monthly physical count'),
('STK-A-002','2025-01-20','WH-02','Stock Adjustment','Damaged goods found during inspection'),
('STK-A-003','2025-01-28','WH-03','Stock Adjustment','System sync error after migration'),
('STK-A-004','2025-02-05','WH-01','Stock Adjustment','Quarterly internal audit'),
('STK-A-005','2025-02-10','WH-02','Stock Adjustment','Miscounted during receiving process'),
('STK-A-006','2025-02-14','WH-01','Stock Adjustment','Expired stock removal'),
('STK-A-007','2025-02-20','WH-03','Stock Adjustment','Physical count variance found'),
('STK-A-008','2025-02-25','WH-01','Stock Adjustment','Routine monthly physical count'),
('STK-A-009','2025-03-01','WH-02','Stock Adjustment','Damaged in transit partial loss'),
('STK-A-010','2025-03-05','WH-01','Stock Adjustment','Annual stock audit'),
('STK-A-011','2025-03-08','WH-03','Stock Adjustment','Miscounted during stock transfer'),
('STK-A-012','2025-03-12','WH-01','Stock Adjustment','Routine monthly physical count'),
('STK-A-013','2025-03-15','WH-02','Stock Adjustment','Water damage found in storage area'),
('STK-A-014','2025-03-18','WH-01','Stock Adjustment','Quarterly internal audit'),
('STK-A-015','2025-03-22','WH-03','Stock Adjustment','System reconciliation after upgrade');

-- Stock Adjustment Line Items
INSERT INTO stock_adjustment_line(stock_no,product_code,unit_id,system_balance,checked_balance) VALUES
('STK-A-001','PRD-001','U01',100.000,95.000),
('STK-A-002','PRD-002','U02',50.000, 47.000),
('STK-A-003','PRD-003','U03',30.000, 32.000),
('STK-A-004','PRD-004','U04',200.000,195.000),
('STK-A-005','PRD-005','U01',80.000, 80.000),
('STK-A-006','PRD-009','U01',150.000,140.000),
('STK-A-007','PRD-010','U05',100.000,98.000),
('STK-A-008','PRD-001','U01',95.000, 90.000),
('STK-A-009','PRD-012','U01',20.000, 18.000),
('STK-A-010','PRD-013','U05',60.000, 63.000),
('STK-A-011','PRD-015','U04',100.000,100.000),
('STK-A-012','PRD-002','U02',37.000, 35.000),
('STK-A-013','PRD-003','U03',27.000, 25.000),
('STK-A-014','PRD-005','U01',80.000, 77.000),
('STK-A-015','PRD-009','U01',140.000,145.000);
