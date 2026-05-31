const db = require('../db/pool')

exports.getAll = async () => (await db.query('SELECT * FROM product_type ORDER BY type_id')).rows
exports.getOne = async (id) => (await db.query('SELECT * FROM product_type WHERE type_id=$1', [id])).rows[0]
exports.create = async ({ type_id, type_name }) =>
  (await db.query('INSERT INTO product_type(type_id,type_name) VALUES($1,$2) RETURNING *', [type_id, type_name])).rows[0]
exports.update = async (id, { type_name }) =>
  (await db.query('UPDATE product_type SET type_name=$1 WHERE type_id=$2 RETURNING *', [type_name, id])).rows[0]
exports.remove = async (id) => db.query('DELETE FROM product_type WHERE type_id=$1', [id])
