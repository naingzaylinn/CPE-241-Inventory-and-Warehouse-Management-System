const db = require('../db/pool')

const genNo = async () => {
  const r = await db.query("SELECT stock_no FROM stock_adjustment_header WHERE stock_no LIKE 'STK-A-%' ORDER BY stock_no DESC LIMIT 1")
  if (!r.rows.length) return 'STK-A-001'
  return `STK-A-${String(parseInt(r.rows[0].stock_no.split('-')[2]) + 1).padStart(3, '0')}`
}

const run = async (q, p) => {
  const res = await db.query(q, p);
  return parseFloat(res.rows[0]?.qty || 0);
}

exports.getSystemBalance = async (warehouse_id, product_code) => {
  // FIX: Ensured clean tracking loops mapping to your exact table definitions across all transaction tiers
  const pIn  = await run(`SELECT COALESCE(SUM(l.quantity_in),0) AS qty FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no WHERE h.warehouse_id=$1 AND l.product_code=$2 AND h.reason='Purchase'`, [warehouse_id, product_code])
  const pOut = await run(`SELECT COALESCE(SUM(l.quantity_out),0) AS qty FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no WHERE h.warehouse_id=$1 AND l.product_code=$2 AND h.reason='Purchase Return'`, [warehouse_id, product_code])
  const sOut = await run(`SELECT COALESCE(SUM(l.quantity_out),0) AS qty FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no WHERE h.warehouse_id=$1 AND l.product_code=$2 AND h.reason='Sales'`, [warehouse_id, product_code])
  const sIn  = await run(`SELECT COALESCE(SUM(l.quantity_in),0) AS qty FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no WHERE h.warehouse_id=$1 AND l.product_code=$2 AND h.reason='Sales Return'`, [warehouse_id, product_code])
  const adj  = await run(`SELECT COALESCE(SUM(l.quantity_adjust),0) AS qty FROM stock_adjustment_header h JOIN stock_adjustment_line l ON h.stock_no=l.stock_no WHERE h.warehouse_id=$1 AND l.product_code=$2`, [warehouse_id, product_code])
  
  return parseFloat((pIn - pOut - sOut + sIn + adj).toFixed(3))
}

exports.getAll = async (f = {}) => {
  const params = [f.date_from || '2000-01-01', f.date_to || '2099-12-31']
  let extra = ''
  if (f.warehouse_id) { params.push(f.warehouse_id); extra += ` AND h.warehouse_id=$${params.length}` }
  return (await db.query(
    `SELECT h.*,w.warehouse_name FROM stock_adjustment_header h
     JOIN warehouse w ON h.warehouse_id=w.warehouse_id
     WHERE h.stock_date BETWEEN $1 AND $2 ${extra}
     ORDER BY h.stock_date DESC,h.stock_no DESC`, params)).rows
}

exports.getOne = async (id) => {
  const h = await db.query(
    `SELECT h.*,w.warehouse_name FROM stock_adjustment_header h
     JOIN warehouse w ON h.warehouse_id=w.warehouse_id WHERE h.stock_no=$1`, [id])
  if (!h.rows[0]) return null
  const lines = await db.query(
    `SELECT l.*,p.product_name,u.unit_name FROM stock_adjustment_line l
     JOIN product p ON l.product_code=p.product_code
     JOIN units u ON l.unit_id=u.unit_id
     WHERE l.stock_no=$1 ORDER BY l.line_id`, [id])
  return { ...h.rows[0], line_items: lines.rows }
}

exports.create = async (body) => {
  const { stock_date, warehouse_id, reason_for_adjustment, line_items } = body
  const stock_no = await genNo()
  await db.query(
    'INSERT INTO stock_adjustment_header(stock_no,stock_date,warehouse_id,reason,reason_for_adjustment) VALUES($1,$2,$3,$4,$5)',
    [stock_no, stock_date, warehouse_id, 'Stock Adjustment', reason_for_adjustment])
  for (const item of line_items) {
    const p = await db.query('SELECT unit_id FROM product WHERE product_code=$1', [item.product_code])
    if (!p.rows[0]) throw new Error(`Product ${item.product_code} not found`)
    const sys = await exports.getSystemBalance(warehouse_id, item.product_code)
    const qty_adj = parseFloat(item.checked_balance) - sys
    await db.query(
      'INSERT INTO stock_adjustment_line(stock_no,product_code,unit_id,system_balance,checked_balance,quantity_adjust) VALUES($1,$2,$3,$4,$5,$6)',
      [stock_no, item.product_code, p.rows[0].unit_id, sys, parseFloat(item.checked_balance), qty_adj])
  }
  return exports.getOne(stock_no)
}

exports.update = async (id, body) => {
  await db.query('UPDATE stock_adjustment_header SET stock_date=$1,warehouse_id=$2,reason_for_adjustment=$3 WHERE stock_no=$4',
    [body.stock_date, body.warehouse_id, body.reason_for_adjustment, id])
  return exports.getOne(id)
}

exports.remove = async (id) => {
  await db.query('DELETE FROM stock_adjustment_line WHERE stock_no=$1', [id])
  await db.query('DELETE FROM stock_adjustment_header WHERE stock_no=$1', [id])
}
