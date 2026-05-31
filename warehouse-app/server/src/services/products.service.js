const db = require('../db/pool')

const genCode = async () => {
  const r = await db.query("SELECT product_code FROM product ORDER BY product_code DESC LIMIT 1")
  if (!r.rows.length) return 'PRD-001'
  const num = parseInt(r.rows[0].product_code.split('-')[1])
  return `PRD-${String(num + 1).padStart(3, '0')}`
}

exports.getAll = async (filters = {}) => {
  const params = []
  let where = ''
  if (filters.type_id) { params.push(filters.type_id); where = `WHERE p.type_id=$${params.length}` }
  return (await db.query(
    `SELECT p.*,pt.type_name,u.unit_name FROM product p
     JOIN product_type pt ON p.type_id=pt.type_id
     JOIN units u ON p.unit_id=u.unit_id
     ${where} ORDER BY p.product_code`, params)).rows
}

exports.getOne = async (id) => {
  const r = await db.query(
    `SELECT p.*,pt.type_name,u.unit_name FROM product p
     JOIN product_type pt ON p.type_id=pt.type_id
     JOIN units u ON p.unit_id=u.unit_id
     WHERE p.product_code=$1`, [id])
  if (!r.rows[0]) return null
  const bom = await db.query(
    `SELECT b.*,mp.product_name AS material_name,mu.unit_name AS material_unit_name,
       (b.quantity_needed*b.unit_price) AS total_value
     FROM bill_of_materials b
     JOIN product mp ON b.material_code=mp.product_code
     JOIN units mu ON b.unit_id=mu.unit_id
     WHERE b.product_code=$1 ORDER BY b.bom_id`, [id])
  return { ...r.rows[0], bom_lines: bom.rows }
}

exports.create = async (body) => {
  const { product_name, type_id, unit_id, price, has_bom, line_items } = body
  const code = await genCode()
  await db.query(
    'INSERT INTO product(product_code,product_name,type_id,unit_id,price,has_bom) VALUES($1,$2,$3,$4,$5,$6)',
    [code, product_name, type_id, unit_id, price, has_bom || false])
  if (has_bom && line_items?.length) {
    for (const item of line_items) {
      const mat = await db.query('SELECT unit_id,price FROM product WHERE product_code=$1', [item.material_code])
      if (!mat.rows[0]) throw new Error(`Material ${item.material_code} not found`)
      await db.query(
        'INSERT INTO bill_of_materials(product_code,material_code,quantity_needed,unit_id,unit_price) VALUES($1,$2,$3,$4,$5)',
        [code, item.material_code, item.quantity_needed, mat.rows[0].unit_id, mat.rows[0].price])
    }
  }
  return exports.getOne(code)
}

exports.update = async (id, body) => {
  const { product_name, type_id, unit_id, price, has_bom } = body
  await db.query(
    'UPDATE product SET product_name=$1,type_id=$2,unit_id=$3,price=$4,has_bom=$5 WHERE product_code=$6',
    [product_name, type_id, unit_id, price, has_bom, id])
  return exports.getOne(id)
}

exports.remove = async (id) => db.query('DELETE FROM product WHERE product_code=$1', [id])
