const db = require('../db/pool')

exports.getAll = async () => (await db.query('SELECT * FROM supplier ORDER BY supplier_id')).rows
exports.getOne = async (id) => (await db.query('SELECT * FROM supplier WHERE supplier_id=$1', [id])).rows[0]
exports.create = async ({ supplier_id, supplier_name, contact_info }) =>
  (await db.query('INSERT INTO supplier(supplier_id,supplier_name,contact_info) VALUES($1,$2,$3) RETURNING *', [supplier_id, supplier_name, contact_info || null])).rows[0]
exports.update = async (id, { supplier_name, contact_info }) =>
  (await db.query('UPDATE supplier SET supplier_name=$1,contact_info=$2 WHERE supplier_id=$3 RETURNING *', [supplier_name, contact_info || null, id])).rows[0]
exports.remove = async (id) => db.query('DELETE FROM supplier WHERE supplier_id=$1', [id])
