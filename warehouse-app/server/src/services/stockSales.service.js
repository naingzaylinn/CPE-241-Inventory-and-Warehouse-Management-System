const db = require('../db/pool')

const genNo = async () => {
  const r = await db.query("SELECT stock_no FROM stock_sales_header WHERE stock_no LIKE 'STK-S-%' ORDER BY stock_no DESC LIMIT 1")
  if (!r.rows.length) return 'STK-S-001'
  return `STK-S-${String(parseInt(r.rows[0].stock_no.split('-')[2]) + 1).padStart(3, '0')}`
}

const getBalance = async (warehouse_id, product_code) => {
  const run = async (q, p) => parseFloat((await db.query(q, p)).rows[0].qty)
  const pIn  = await run(`SELECT COALESCE(SUM(l.quantity_in),0) AS qty FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no WHERE h.warehouse_id=$1 AND l.product_code=$2 AND h.reason='Purchase'`, [warehouse_id, product_code])
  const pOut = await run(`SELECT COALESCE(SUM(l.quantity_out),0) AS qty FROM stock_header h JOIN stock_purchase_line l ON h.stock_no=l.stock_no WHERE h.warehouse_id=$1 AND l.product_code=$2 AND h.reason='Purchase Return'`, [warehouse_id, product_code])
  const sOut = await run(`SELECT COALESCE(SUM(l.quantity_out),0) AS qty FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no WHERE h.warehouse_id=$1 AND l.product_code=$2 AND h.reason='Sales'`, [warehouse_id, product_code])
  const sIn  = await run(`SELECT COALESCE(SUM(l.quantity_in),0) AS qty FROM stock_sales_header h JOIN stock_sales_line l ON h.stock_no=l.stock_no WHERE h.warehouse_id=$1 AND l.product_code=$2 AND h.reason='Sales Return'`, [warehouse_id, product_code])
  const adj  = await run(`SELECT COALESCE(SUM(l.quantity_adjust),0) AS qty FROM stock_adjustment_header h JOIN stock_adjustment_line l ON h.stock_no=l.stock_no WHERE h.warehouse_id=$1 AND l.product_code=$2`, [warehouse_id, product_code])
  return pIn - pOut - sOut + sIn + adj
}

exports.getAll = async (f = {}) => {
  const params = [f.date_from || '2000-01-01', f.date_to || '2099-12-31']
  let extra = ''
  if (f.customer_id) { params.push(f.customer_id); extra += ` AND h.customer_id=$${params.length}` }
  if (f.warehouse_id) { params.push(f.warehouse_id); extra += ` AND h.warehouse_id=$${params.length}` }
  if (f.product_code) { params.push(f.product_code); extra += ` AND EXISTS(SELECT 1 FROM stock_sales_line l WHERE l.stock_no=h.stock_no AND l.product_code=$${params.length})` }
  return (await db.query(
    `SELECT h.stock_no,h.stock_date,h.reason,h.warehouse_id,h.customer_id,
       w.warehouse_name,c.customer_name
     FROM stock_sales_header h
     JOIN warehouse w ON h.warehouse_id=w.warehouse_id
     JOIN customer c ON h.customer_id=c.customer_id
     WHERE h.stock_date BETWEEN $1 AND $2 ${extra}
     ORDER BY h.stock_date DESC,h.stock_no DESC`, params)).rows
}

exports.getOne = async (id) => {
  const h = await db.query(
    `SELECT h.*,w.warehouse_name,c.customer_name
     FROM stock_sales_header h
     JOIN warehouse w ON h.warehouse_id=w.warehouse_id
     JOIN customer c ON h.customer_id=c.customer_id
     WHERE h.stock_no=$1`, [id])
  if (!h.rows[0]) return null
  const lines = await db.query(
    `SELECT l.*,p.product_name,u.unit_name,
       COALESCE(l.quantity_out,l.quantity_in)*l.unit_price AS extended_price
     FROM stock_sales_line l
     JOIN product p ON l.product_code=p.product_code
     JOIN units u ON l.unit_id=u.unit_id
     WHERE l.stock_no=$1 ORDER BY l.line_id`, [id])
  return { ...h.rows[0], line_items: lines.rows }
}

exports.create = async (body) => {
  const { stock_date, warehouse_id, reason, customer_id, line_items } = body
  if (reason === 'Sales') {
    for (const item of line_items) {
      const bal = await getBalance(warehouse_id, item.product_code)
      if (parseFloat(item.quantity_out) > bal) {
        const e = new Error(`Insufficient stock for ${item.product_code}. Available: ${bal}`)
        e.status = 422; throw e
      }
    }
  }
  const stock_no = await genNo()
  await db.query('INSERT INTO stock_sales_header(stock_no,stock_date,warehouse_id,reason,customer_id) VALUES($1,$2,$3,$4,$5)',
    [stock_no, stock_date, warehouse_id, reason, customer_id])
  for (const item of line_items) {
    const p = await db.query('SELECT unit_id FROM product WHERE product_code=$1', [item.product_code])
    if (!p.rows[0]) throw new Error(`Product ${item.product_code} not found`)
    await db.query(
      'INSERT INTO stock_sales_line(stock_no,product_code,ref_so_no,quantity_out,quantity_in,unit_id,unit_price) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [stock_no, item.product_code, item.ref_so_no || null,
       reason === 'Sales' ? item.quantity_out : null,
       reason === 'Sales Return' ? item.quantity_in : null,
       p.rows[0].unit_id, item.unit_price])
  }
  return exports.getOne(stock_no)
}

exports.update = async (id, body) => {
  const { stock_date, warehouse_id, customer_id } = body
  await db.query('UPDATE stock_sales_header SET stock_date=$1,warehouse_id=$2,customer_id=$3 WHERE stock_no=$4',
    [stock_date, warehouse_id, customer_id, id])
  return exports.getOne(id)
}

exports.remove = async (id) => {
  await db.query('DELETE FROM stock_sales_line WHERE stock_no=$1', [id])
  await db.query('DELETE FROM stock_sales_header WHERE stock_no=$1', [id])
}
