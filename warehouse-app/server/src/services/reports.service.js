const db = require('../db/pool')

exports.productList = async (f = {}) => {
  const params = []
  let where = ''
  if (f.type_id) { params.push(f.type_id); where = `WHERE p.type_id=$${params.length}` }
  return (await db.query(
    `SELECT p.product_code,p.product_name,pt.type_name,u.unit_name,p.price,
       CASE WHEN p.has_bom THEN 'Yes' ELSE 'No' END AS has_bom
     FROM product p
     JOIN product_type pt ON p.type_id=pt.type_id
     JOIN units u ON p.unit_id=u.unit_id
     ${where} ORDER BY p.product_code`, params)).rows
}

exports.bomPrint = async (f = {}) => {
  if (!f.product_code) return []
  return (await db.query(
    `SELECT p.product_code,p.product_name,pt.type_name,u.unit_name AS product_unit,
       mp.product_code AS material_code,mp.product_name AS material_name,
       b.quantity_needed,mu.unit_name AS material_unit,b.unit_price,
       (b.quantity_needed*b.unit_price) AS total_value
     FROM product p
     JOIN product_type pt ON p.type_id=pt.type_id
     JOIN units u ON p.unit_id=u.unit_id
     JOIN bill_of_materials b ON p.product_code=b.product_code
     JOIN product mp ON b.material_code=mp.product_code
     JOIN units mu ON b.unit_id=mu.unit_id
     WHERE p.product_code=$1 ORDER BY b.bom_id`, [f.product_code])).rows
}

exports.stockByType = async (f = {}) => {
  const date = f.as_of_date || '2099-12-31'
  const params = [date, date, date, date, date]
  let typeFilter = ''
  if (f.type_id) { params.push(f.type_id); typeFilter = `AND pt.type_id=$${params.length}` }
  return (await db.query(
    `WITH m AS (
       SELECT p.product_code,COALESCE(l.quantity_in,0) AS qi,0 AS qo
       FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no
       JOIN product p ON l.product_code=p.product_code
       WHERE h.stock_date<=$1 AND h.reason='Purchase'
       UNION ALL
       SELECT p.product_code,0,COALESCE(l.quantity_out,0)
       FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no
       JOIN product p ON l.product_code=p.product_code
       WHERE h.stock_date<=$2 AND h.reason='Purchase Return'
       UNION ALL
       SELECT p.product_code,0,COALESCE(l.quantity_out,0)
       FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no
       JOIN product p ON l.product_code=p.product_code
       WHERE h.stock_date<=$3 AND h.reason='Sales'
       UNION ALL
       SELECT p.product_code,COALESCE(l.quantity_in,0),0
       FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no
       JOIN product p ON l.product_code=p.product_code
       WHERE h.stock_date<=$4 AND h.reason='Sales Return'
       UNION ALL
       SELECT l.product_code,
         CASE WHEN (l.checked_balance - l.system_balance)>0 THEN (l.checked_balance - l.system_balance) ELSE 0 END,
         CASE WHEN (l.checked_balance - l.system_balance)<0 THEN ABS(l.checked_balance - l.system_balance) ELSE 0 END
       FROM stock_adjustment_header h JOIN stock_adjustment_line l ON h.stock_no=l.stock_no
       WHERE h.stock_date<=$5
     )
     SELECT pt.type_name,SUM(m.qi) AS total_qty_in,SUM(m.qo) AS total_qty_out,
       SUM(m.qi-m.qo) AS net_stock_balance
     FROM m JOIN product p ON m.product_code=p.product_code
     JOIN product_type pt ON p.type_id=pt.type_id
     WHERE 1=1 ${typeFilter}
     GROUP BY pt.type_name ORDER BY pt.type_name`, params)).rows
}

exports.purchaseList = async (f = {}) => {
  const params = [f.date_from || '2000-01-01', f.date_to || '2099-12-31']
  let extra = ''
  if (f.supplier_id) { params.push(f.supplier_id); extra = `AND h.supplier_id=$${params.length}` }
  return (await db.query(
    `SELECT h.stock_no,h.stock_date,w.warehouse_name,h.reason,s.supplier_name,
       p.product_code,p.product_name,l.ref_po_no,l.quantity_in,l.quantity_out,
       u.unit_name,l.unit_price,COALESCE(l.quantity_in,l.quantity_out)*l.unit_price AS extended_price
     FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no
     JOIN warehouse w ON h.warehouse_id=w.warehouse_id
     JOIN supplier s ON h.supplier_id=s.supplier_id
     JOIN product p ON l.product_code=p.product_code
     JOIN units u ON l.unit_id=u.unit_id
     WHERE h.stock_date BETWEEN $1 AND $2 ${extra}
     ORDER BY h.stock_date,h.stock_no`, params)).rows
}

exports.receivingVoucher = async (f = {}) => {
  if (!f.stock_no) return { header: null, lines: [] }
  const header = (await db.query(
    `SELECT h.*,w.warehouse_name,s.supplier_name,s.contact_info
     FROM stock_header h JOIN warehouse w ON h.warehouse_id=w.warehouse_id
     JOIN supplier s ON h.supplier_id=s.supplier_id WHERE h.stock_no=$1`, [f.stock_no])).rows[0]
  const lines = (await db.query(
    `SELECT l.line_id,p.product_code,p.product_name,l.ref_po_no,l.quantity_in,l.quantity_out,
       u.unit_name,l.unit_price,COALESCE(l.quantity_in,l.quantity_out)*l.unit_price AS extended_price
     FROM stock_purchase_line l JOIN product p ON l.product_code=p.product_code
     JOIN units u ON l.unit_id=u.unit_id WHERE l.stock_no=$1 ORDER BY l.line_id`, [f.stock_no])).rows
  return { header: header || null, lines }
}

exports.purchaseBySupplier = async (f = {}) => {
  return (await db.query(
    `SELECT s.supplier_id,s.supplier_name,
       COUNT(DISTINCT h.stock_no) AS total_transactions,
       SUM(COALESCE(l.quantity_in,0)) AS total_qty_purchased,
       SUM(COALESCE(l.quantity_in,0)*l.unit_price) AS total_purchase_value
     FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no
     JOIN supplier s ON h.supplier_id=s.supplier_id
     WHERE h.reason='Purchase' AND h.stock_date BETWEEN $1 AND $2
     GROUP BY s.supplier_id,s.supplier_name ORDER BY total_purchase_value DESC`,
    [f.date_from || '2000-01-01', f.date_to || '2099-12-31'])).rows
}

exports.salesList = async (f = {}) => {
  const params = [f.date_from || '2000-01-01', f.date_to || '2099-12-31']
  let extra = ''
  if (f.customer_id) { params.push(f.customer_id); extra += ` AND h.customer_id=$${params.length}` }
  if (f.warehouse_id) { params.push(f.warehouse_id); extra += ` AND h.warehouse_id=$${params.length}` }
  if (f.product_code) { params.push(f.product_code); extra += ` AND l.product_code=$${params.length}` }
  return (await db.query(
    `SELECT h.stock_no,h.stock_date,w.warehouse_name,h.reason,c.customer_name,
       p.product_code,p.product_name,l.ref_so_no,l.quantity_out,l.quantity_in,
       u.unit_name,l.unit_price,COALESCE(l.quantity_out,l.quantity_in)*l.unit_price AS extended_price
     FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no
     JOIN warehouse w ON h.warehouse_id=w.warehouse_id
     JOIN customer c ON h.customer_id=c.customer_id
     JOIN product p ON l.product_code=p.product_code
     JOIN units u ON l.unit_id=u.unit_id
     WHERE h.stock_date BETWEEN $1 AND $2 ${extra}
     ORDER BY h.stock_date,h.stock_no`, params)).rows
}

exports.deliveryVoucher = async (f = {}) => {
  if (!f.stock_no) return { header: null, lines: [] }
  const header = (await db.query(
    `SELECT h.*,w.warehouse_name,c.customer_name,c.contact_info
     FROM stock_sales_header h JOIN warehouse w ON h.warehouse_id=w.warehouse_id
     JOIN customer c ON h.customer_id=c.customer_id WHERE h.stock_no=$1`, [f.stock_no])).rows[0]
  const lines = (await db.query(
    `SELECT l.line_id,p.product_code,p.product_name,l.ref_so_no,l.quantity_out,l.quantity_in,
       u.unit_name,l.unit_price,
       (COALESCE(l.quantity_out,0)-COALESCE(l.quantity_in,0))*l.unit_price AS extended_price
     FROM stock_sales_line l JOIN product p ON l.product_code=p.product_code
     JOIN units u ON l.unit_id=u.unit_id WHERE l.stock_no=$1 ORDER BY l.line_id`, [f.stock_no])).rows
  return { header: header || null, lines }
}

exports.salesByProduct = async (f = {}) => {
  const params = [f.date_from || '2000-01-01', f.date_to || '2099-12-31']
  let extra = ''
  if (f.product_code) { params.push(f.product_code); extra = `AND l.product_code=$${params.length}` }
  return (await db.query(
    `SELECT p.product_code,p.product_name,
       COUNT(DISTINCT h.stock_no) AS total_orders,
       SUM(l.quantity_out) AS total_qty_sold,
       SUM(l.quantity_out*l.unit_price) AS total_sales_value
     FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no
     JOIN product p ON l.product_code=p.product_code
     WHERE h.reason='Sales' AND h.stock_date BETWEEN $1 AND $2 ${extra}
     GROUP BY p.product_code,p.product_name ORDER BY total_sales_value DESC`, params)).rows
}

exports.stockBalance = async (f = {}) => {
  const date = f.as_of_date || '2099-12-31'
  const params = [date, date, date, date, date]
  let extra = ''
  if (f.warehouse_id) { params.push(f.warehouse_id); extra += ` AND m.warehouse_id=$${params.length}` }
  if (f.product_code) { params.push(f.product_code); extra += ` AND m.product_code=$${params.length}` }
  return (await db.query(
    `WITH m AS (
       SELECT h.warehouse_id,l.product_code,COALESCE(l.quantity_in,0) AS qi,0 AS qo
       FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no
       WHERE h.reason='Purchase' AND h.stock_date<=$1
       UNION ALL
       SELECT h.warehouse_id,l.product_code,0,COALESCE(l.quantity_out,0)
       FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no
       WHERE h.reason='Purchase Return' AND h.stock_date<=$2
       UNION ALL
       SELECT h.warehouse_id,l.product_code,0,COALESCE(l.quantity_out,0)
       FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no
       WHERE h.reason='Sales' AND h.stock_date<=$3
       UNION ALL
       SELECT h.warehouse_id,l.product_code,COALESCE(l.quantity_in,0),0
       FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no
       WHERE h.reason='Sales Return' AND h.stock_date<=$4
       UNION ALL
       SELECT h.warehouse_id,l.product_code,
         CASE WHEN (l.checked_balance - l.system_balance)>0 THEN (l.checked_balance - l.system_balance) ELSE 0 END,
         CASE WHEN (l.checked_balance - l.system_balance)<0 THEN ABS(l.checked_balance - l.system_balance) ELSE 0 END
       FROM stock_adjustment_header h JOIN stock_adjustment_line l ON h.stock_no=l.stock_no
       WHERE h.stock_date<=$5
     )
     SELECT w.warehouse_name,p.product_code,p.product_name,u.unit_name,
       SUM(m.qi) AS total_in,SUM(m.qo) AS total_out,SUM(m.qi-m.qo) AS balance
     FROM m JOIN warehouse w ON m.warehouse_id=w.warehouse_id
     JOIN product p ON m.product_code=p.product_code
     JOIN units u ON p.unit_id=u.unit_id
     WHERE 1=1 ${extra}
     GROUP BY w.warehouse_name,p.product_code,p.product_name,u.unit_name
     HAVING SUM(m.qi-m.qo)!=0
     ORDER BY w.warehouse_name,p.product_code`, params)).rows
}

exports.stockCard = async (f = {}) => {
  const params = [f.date_from || '2000-01-01', f.date_to || '2099-12-31']
  let extra = ''
  if (f.warehouse_id) { params.push(f.warehouse_id); extra += ` AND m.warehouse_id=$${params.length}` }
  if (f.product_code) { params.push(f.product_code); extra += ` AND m.product_code=$${params.length}` }
  return (await db.query(
    `WITH m AS (
       SELECT h.stock_date,h.stock_no,h.warehouse_id,l.product_code,h.reason,
         COALESCE(l.quantity_in,0) AS qi,0 AS qo
       FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no WHERE h.reason='Purchase'
       UNION ALL
       SELECT h.stock_date,h.stock_no,h.warehouse_id,l.product_code,h.reason,0,COALESCE(l.quantity_out,0)
       FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no WHERE h.reason='Purchase Return'
       UNION ALL
       SELECT h.stock_date,h.stock_no,h.warehouse_id,l.product_code,h.reason,0,COALESCE(l.quantity_out,0)
       FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no WHERE h.reason='Sales'
       UNION ALL
       SELECT h.stock_date,h.stock_no,h.warehouse_id,l.product_code,h.reason,COALESCE(l.quantity_in,0),0
       FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no WHERE h.reason='Sales Return'
       UNION ALL
       SELECT h.stock_date,h.stock_no,h.warehouse_id,l.product_code,'Adjustment',
         CASE WHEN (l.checked_balance - l.system_balance)>0 THEN (l.checked_balance - l.system_balance) ELSE 0 END,
         CASE WHEN (l.checked_balance - l.system_balance)<0 THEN ABS(l.checked_balance - l.system_balance) ELSE 0 END
       FROM stock_adjustment_header h JOIN stock_adjustment_line l ON h.stock_no=l.stock_no
     )
     SELECT m.stock_date,m.stock_no,w.warehouse_name,p.product_code,p.product_name,m.reason,m.qi AS qty_in,m.qo AS qty_out
     FROM m JOIN warehouse w ON m.warehouse_id=w.warehouse_id
     JOIN product p ON m.product_code=p.product_code
     WHERE m.stock_date BETWEEN $1 AND $2 ${extra}
     ORDER BY m.warehouse_id,m.product_code,m.stock_date,m.stock_no`, params)).rows
}

exports.adjustmentByProduct = async (f = {}) => {
  const topN = parseInt(f.limit) || 5
  return (await db.query(
    `WITH s AS (
       SELECT p.product_code,p.product_name,
         SUM(CASE WHEN (l.checked_balance - l.system_balance)>0 THEN (l.checked_balance - l.system_balance) ELSE 0 END) AS qty_added,
         SUM(CASE WHEN (l.checked_balance - l.system_balance)<0 THEN ABS(l.checked_balance - l.system_balance) ELSE 0 END) AS qty_removed,
         SUM(l.checked_balance - l.system_balance) AS net_change,
         COUNT(l.stock_no) AS adjustment_vouchers_count
       FROM stock_adjustment_header h JOIN stock_adjustment_line l ON h.stock_no=l.stock_no
       JOIN product p ON l.product_code=p.product_code
       WHERE h.stock_date BETWEEN $1 AND $2
       GROUP BY p.product_code,p.product_name
     )
     SELECT * FROM s ORDER BY adjustment_vouchers_count DESC LIMIT $3`,
    [f.date_from || '2000-01-01', f.date_to || '2099-12-31', topN])).rows
}
