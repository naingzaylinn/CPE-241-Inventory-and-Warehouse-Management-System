const db = require('../db/pool')

exports.getAll = async () => (await db.query('SELECT * FROM warehouse ORDER BY warehouse_id')).rows
exports.getOne = async (id) => (await db.query('SELECT * FROM warehouse WHERE warehouse_id=$1', [id])).rows[0]
exports.create = async ({ warehouse_id, warehouse_name, location }) =>
  (await db.query('INSERT INTO warehouse(warehouse_id,warehouse_name,location) VALUES($1,$2,$3) RETURNING *', [warehouse_id, warehouse_name, location || null])).rows[0]
exports.update = async (id, { warehouse_name, location }) =>
  (await db.query('UPDATE warehouse SET warehouse_name=$1,location=$2 WHERE warehouse_id=$3 RETURNING *', [warehouse_name, location || null, id])).rows[0]
exports.remove = async (id) => db.query('DELETE FROM warehouse WHERE warehouse_id=$1', [id])
