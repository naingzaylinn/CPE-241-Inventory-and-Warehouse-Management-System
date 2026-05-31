-- ============================================================
-- Inventory and Warehouse Management System
-- Schema only — runs on first container start
-- ============================================================

-- Drop tables in reverse FK order
DROP TABLE IF EXISTS stock_adjustment_line CASCADE;
DROP TABLE IF EXISTS stock_adjustment_header CASCADE;
DROP TABLE IF EXISTS stock_sales_line CASCADE;
DROP TABLE IF EXISTS stock_sales_header CASCADE;
DROP TABLE IF EXISTS stock_purchase_line CASCADE;
DROP TABLE IF EXISTS stock_header CASCADE;
DROP TABLE IF EXISTS bill_of_materials CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS product_type CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS warehouse CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;
DROP TABLE IF EXISTS customer CASCADE;

-- ── Lookup tables ────────────────────────────────────────────

CREATE TABLE product_type (
  type_id   VARCHAR(10) PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL
);

CREATE TABLE units (
  unit_id   VARCHAR(10) PRIMARY KEY,
  unit_name VARCHAR(50) NOT NULL
);

CREATE TABLE warehouse (
  warehouse_id   VARCHAR(10)  PRIMARY KEY,
  warehouse_name VARCHAR(100) NOT NULL,
  location       VARCHAR(200)
);

CREATE TABLE supplier (
  supplier_id   VARCHAR(10)  PRIMARY KEY,
  supplier_name VARCHAR(100) NOT NULL,
  contact_info  VARCHAR(200)
);

CREATE TABLE customer (
  customer_id   VARCHAR(10)  PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  contact_info  VARCHAR(200)
);

-- ── Product & BOM ────────────────────────────────────────────

CREATE TABLE product (
  product_code VARCHAR(20)     PRIMARY KEY,
  product_name VARCHAR(100)    NOT NULL,
  type_id      VARCHAR(10)     NOT NULL REFERENCES product_type(type_id)
                               ON DELETE RESTRICT ON UPDATE CASCADE,
  unit_id      VARCHAR(10)     NOT NULL REFERENCES units(unit_id)
                               ON DELETE RESTRICT ON UPDATE CASCADE,
  price        DECIMAL(10,2)   NOT NULL CHECK (price >= 0),
  has_bom      BOOLEAN         NOT NULL DEFAULT false
);

CREATE TABLE bill_of_materials (
  bom_id          SERIAL         PRIMARY KEY,
  product_code    VARCHAR(20)    NOT NULL REFERENCES product(product_code)
                                 ON DELETE RESTRICT ON UPDATE CASCADE,
  material_code   VARCHAR(20)    NOT NULL REFERENCES product(product_code)
                                 ON DELETE RESTRICT ON UPDATE CASCADE,
  quantity_needed DECIMAL(10,3)  NOT NULL CHECK (quantity_needed > 0),
  unit_id         VARCHAR(10)    NOT NULL REFERENCES units(unit_id)
                                 ON DELETE RESTRICT ON UPDATE CASCADE,
  unit_price      DECIMAL(10,2)  NOT NULL CHECK (unit_price >= 0)
);

-- ── Stock Purchase ───────────────────────────────────────────

CREATE TABLE stock_header (
  stock_no     VARCHAR(20) PRIMARY KEY,
  stock_date   DATE        NOT NULL,
  warehouse_id VARCHAR(10) NOT NULL REFERENCES warehouse(warehouse_id)
                           ON DELETE RESTRICT ON UPDATE CASCADE,
  reason       VARCHAR(50) NOT NULL
                           CHECK (reason IN ('Purchase', 'Purchase Return')),
  supplier_id  VARCHAR(10) NOT NULL REFERENCES supplier(supplier_id)
                           ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE stock_purchase_line (
  line_id      SERIAL        PRIMARY KEY,
  stock_no     VARCHAR(20)   NOT NULL REFERENCES stock_header(stock_no)
                             ON DELETE CASCADE ON UPDATE CASCADE,
  product_code VARCHAR(20)   NOT NULL REFERENCES product(product_code)
                             ON DELETE RESTRICT ON UPDATE CASCADE,
  ref_po_no    VARCHAR(20),
  quantity_in  DECIMAL(10,3) CHECK (quantity_in > 0),
  quantity_out DECIMAL(10,3) CHECK (quantity_out > 0),
  unit_id      VARCHAR(10)   NOT NULL REFERENCES units(unit_id)
                             ON DELETE RESTRICT ON UPDATE CASCADE,
  unit_price   DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- ── Stock Sales ──────────────────────────────────────────────

CREATE TABLE stock_sales_header (
  stock_no     VARCHAR(20) PRIMARY KEY,
  stock_date   DATE        NOT NULL,
  warehouse_id VARCHAR(10) NOT NULL REFERENCES warehouse(warehouse_id)
                           ON DELETE RESTRICT ON UPDATE CASCADE,
  reason       VARCHAR(50) NOT NULL
                           CHECK (reason IN ('Sales', 'Sales Return')),
  customer_id  VARCHAR(10) NOT NULL REFERENCES customer(customer_id)
                           ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE stock_sales_line (
  line_id      SERIAL        PRIMARY KEY,
  stock_no     VARCHAR(20)   NOT NULL REFERENCES stock_sales_header(stock_no)
                             ON DELETE CASCADE ON UPDATE CASCADE,
  product_code VARCHAR(20)   NOT NULL REFERENCES product(product_code)
                             ON DELETE RESTRICT ON UPDATE CASCADE,
  ref_so_no    VARCHAR(20),
  quantity_out DECIMAL(10,3) CHECK (quantity_out > 0),
  quantity_in  DECIMAL(10,3) CHECK (quantity_in > 0),
  unit_id      VARCHAR(10)   NOT NULL REFERENCES units(unit_id)
                             ON DELETE RESTRICT ON UPDATE CASCADE,
  unit_price   DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- ── Stock Adjustment ─────────────────────────────────────────

CREATE TABLE stock_adjustment_header (
  stock_no               VARCHAR(20)  PRIMARY KEY,
  stock_date             DATE         NOT NULL,
  warehouse_id           VARCHAR(10)  NOT NULL REFERENCES warehouse(warehouse_id)
                                      ON DELETE RESTRICT ON UPDATE CASCADE,
  reason                 VARCHAR(50)  NOT NULL DEFAULT 'Stock Adjustment',
  reason_for_adjustment  VARCHAR(200) NOT NULL
);

CREATE TABLE stock_adjustment_line (
  line_id          SERIAL        PRIMARY KEY,
  stock_no         VARCHAR(20)   NOT NULL REFERENCES stock_adjustment_header(stock_no)
                                 ON DELETE CASCADE ON UPDATE CASCADE,
  product_code     VARCHAR(20)   NOT NULL REFERENCES product(product_code)
                                 ON DELETE RESTRICT ON UPDATE CASCADE,
  unit_id          VARCHAR(10)   NOT NULL REFERENCES units(unit_id)
                                 ON DELETE RESTRICT ON UPDATE CASCADE,
  system_balance   DECIMAL(10,3) NOT NULL,
  checked_balance  DECIMAL(10,3) NOT NULL CHECK (checked_balance >= 0),
  quantity_adjust  DECIMAL(10,3) GENERATED ALWAYS AS (checked_balance - system_balance) STORED
);
