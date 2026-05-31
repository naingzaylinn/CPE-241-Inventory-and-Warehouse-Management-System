const db = require('../db/pool')

const genNo = async () => {
  const r = await db.query("SELECT stock_no FROM stock_header WHERE stock_no LIKE 'STK-P-%' ORDER BY stock_no DESC LIMIT 1")
  if (!r.rows.length) return 'STK-P-001'
  return `STK-P-${String(parseInt(r.rows[0].stock_no.split('-')[2]) + 1).padStart(3, '0')}`
}

exports.getAll = async (f = {}) => {
  const params = [f.date_from || '2000-01-01', f.date_to || '2099-12-31']
  let extra = ''
  if (f.supplier_id) { params.push(f.supplier_id); extra += ` AND h.supplier_id=$${params.length}` }
  return (await db.query(
    `SELECT h.stock_no,h.stock_date,h.reason,h.warehouse_id,h.supplier_id,
       w.warehouse_name,s.supplier_name
     FROM stock_header h
     JOIN warehouse w ON h.warehouse_id=w.warehouse_id
     JOIN supplier s ON h.supplier_id=s.supplier_id
     WHERE h.stock_date BETWEEN $1 AND $2 ${extra}
     ORDER BY h.stock_date DESC,h.stock_no DESC`, params)).rows
}

exports.getOne = async (id) => {
  const h = await db.query(
    `SELECT h.*,w.warehouse_name,s.supplier_name
     FROM stock_header h
     JOIN warehouse w ON h.warehouse_id=w.warehouse_id
     JOIN supplier s ON h.supplier_id=s.supplier_id
     WHERE h.stock_no=$1`, [id])
  if (!h.rows[0]) return null
  const lines = await db.query(
    `SELECT l.*,p.product_name,u.unit_name,
       COALESCE(l.quantity_in,l.quantity_out)*l.unit_price AS extended_price
     FROM stock_purchase_line l
     JOIN product p ON l.product_code=p.product_code
     JOIN units u ON l.unit_id=u.unit_id
     WHERE l.stock_no=$1 ORDER BY l.line_id`, [id])
  return { ...h.rows[0], line_items: lines.rows }
}

exports.create = async (body) => {
  const { stock_date, warehouse_id, reason, supplier_id, line_items } = body
  const stock_no = await genNo()
  await db.query(
    'INSERT INTO stock_header(stock_no,stock_date,warehouse_id,reason,supplier_id) VALUES($1,$2,$3,$4,$5)',
    [stock_no, stock_date, warehouse_id, reason, supplier_id])
  for (const item of line_items) {
    const p = await db.query('SELECT unit_id FROM product WHERE product_code=$1', [item.product_code])
    if (!p.rows[0]) throw new Error(`Product ${item.product_code} not found`)
    await db.query(
      'INSERT INTO stock_purchase_line(stock_no,product_code,ref_po_no,quantity_in,quantity_out,unit_id,unit_price) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [stock_no, item.product_code, item.ref_po_no || null,
       reason === 'Purchase' ? item.quantity_in : null,
       reason === 'Purchase Return' ? item.quantity_out : null,
       p.rows[0].unit_id, item.unit_price])
  }
  return exports.getOne(stock_no)
}

exports.update = async (id, body) => {
  const { stock_date, warehouse_id, supplier_id } = body
  await db.query('UPDATE stock_header SET stock_date=$1,warehouse_id=$2,supplier_id=$3 WHERE stock_no=$4',
    [stock_date, warehouse_id, supplier_id, id])
  return exports.getOne(id)
}

exports.remove = async (id) => {
  await db.query('DELETE FROM stock_purchase_line WHERE stock_no=$1', [id])
  await db.query('DELETE FROM stock_header WHERE stock_no=$1', [id])
}
