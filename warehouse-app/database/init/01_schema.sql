CREATE TABLE product_type (
  type_id VARCHAR(10) PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL
);

CREATE TABLE units (
  unit_id VARCHAR(10) PRIMARY KEY,
  unit_name VARCHAR(50) NOT NULL
);

CREATE TABLE warehouse (
  warehouse_id VARCHAR(10) PRIMARY KEY,
  warehouse_name VARCHAR(100) NOT NULL,
  location VARCHAR(200)
);

CREATE TABLE supplier (
  supplier_id VARCHAR(10) PRIMARY KEY,
  supplier_name VARCHAR(100) NOT NULL,
  contact_info VARCHAR(200)
);

CREATE TABLE customer (
  customer_id VARCHAR(10) PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  contact_info VARCHAR(200)
);

CREATE TABLE product (
  product_code VARCHAR(20) PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  type_id VARCHAR(10) NOT NULL REFERENCES product_type(type_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  unit_id VARCHAR(10) NOT NULL REFERENCES units(unit_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  has_bom BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bill_of_materials (
  bom_id SERIAL PRIMARY KEY,
  product_code VARCHAR(20) NOT NULL REFERENCES product(product_code) ON UPDATE CASCADE ON DELETE RESTRICT,
  material_code VARCHAR(20) NOT NULL REFERENCES product(product_code) ON UPDATE CASCADE ON DELETE RESTRICT,
  quantity_needed DECIMAL(10,3) NOT NULL CHECK (quantity_needed > 0),
  unit_id VARCHAR(10) NOT NULL REFERENCES units(unit_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  UNIQUE (product_code, material_code)
);

CREATE TABLE stock_purchase_header (
  stock_no VARCHAR(20) PRIMARY KEY,
  stock_date DATE NOT NULL CHECK (stock_date <= CURRENT_DATE),
  warehouse_id VARCHAR(10) NOT NULL REFERENCES warehouse(warehouse_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('Purchase', 'Purchase Return')),
  supplier_id VARCHAR(10) NOT NULL REFERENCES supplier(supplier_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stock_purchase_line (
  line_id SERIAL PRIMARY KEY,
  stock_no VARCHAR(20) NOT NULL REFERENCES stock_purchase_header(stock_no) ON UPDATE CASCADE ON DELETE CASCADE,
  product_code VARCHAR(20) NOT NULL REFERENCES product(product_code) ON UPDATE CASCADE ON DELETE RESTRICT,
  ref_po_no VARCHAR(20),
  quantity_in DECIMAL(10,3),
  quantity_out DECIMAL(10,3),
  unit_id VARCHAR(10) NOT NULL REFERENCES units(unit_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  CHECK (quantity_in IS NULL OR quantity_in > 0),
  CHECK (quantity_out IS NULL OR quantity_out > 0)
);

CREATE TABLE stock_sales_header (
  stock_no VARCHAR(20) PRIMARY KEY,
  stock_date DATE NOT NULL CHECK (stock_date <= CURRENT_DATE),
  warehouse_id VARCHAR(10) NOT NULL REFERENCES warehouse(warehouse_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('Sales', 'Sales Return')),
  customer_id VARCHAR(10) NOT NULL REFERENCES customer(customer_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stock_sales_line (
  line_id SERIAL PRIMARY KEY,
  stock_no VARCHAR(20) NOT NULL REFERENCES stock_sales_header(stock_no) ON UPDATE CASCADE ON DELETE CASCADE,
  product_code VARCHAR(20) NOT NULL REFERENCES product(product_code) ON UPDATE CASCADE ON DELETE RESTRICT,
  ref_so_no VARCHAR(20),
  quantity_out DECIMAL(10,3),
  quantity_in DECIMAL(10,3),
  unit_id VARCHAR(10) NOT NULL REFERENCES units(unit_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  CHECK (quantity_in IS NULL OR quantity_in > 0),
  CHECK (quantity_out IS NULL OR quantity_out > 0)
);

CREATE TABLE stock_adjustment_header (
  stock_no VARCHAR(20) PRIMARY KEY,
  stock_date DATE NOT NULL CHECK (stock_date <= CURRENT_DATE),
  warehouse_id VARCHAR(10) NOT NULL REFERENCES warehouse(warehouse_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  reason VARCHAR(50) NOT NULL CHECK (reason = 'Stock Adjustment'),
  reason_for_adjustment VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stock_adjustment_line (
  line_id SERIAL PRIMARY KEY,
  stock_no VARCHAR(20) NOT NULL REFERENCES stock_adjustment_header(stock_no) ON UPDATE CASCADE ON DELETE CASCADE,
  product_code VARCHAR(20) NOT NULL REFERENCES product(product_code) ON UPDATE CASCADE ON DELETE RESTRICT,
  unit_id VARCHAR(10) NOT NULL REFERENCES units(unit_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  system_balance DECIMAL(10,3) NOT NULL,
  checked_balance DECIMAL(10,3) NOT NULL CHECK (checked_balance >= 0),
  quantity_adjust DECIMAL(10,3) GENERATED ALWAYS AS (checked_balance - system_balance) STORED
);
