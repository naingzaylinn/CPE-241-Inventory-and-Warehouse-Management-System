const db = require('../db/pool')

exports.getAll = async () => (await db.query('SELECT * FROM units ORDER BY unit_id')).rows
exports.getOne = async (id) => (await db.query('SELECT * FROM units WHERE unit_id=$1', [id])).rows[0]
exports.create = async ({ unit_id, unit_name }) =>
  (await db.query('INSERT INTO units(unit_id,unit_name) VALUES($1,$2) RETURNING *', [unit_id, unit_name])).rows[0]
exports.update = async (id, { unit_name }) =>
  (await db.query('UPDATE units SET unit_name=$1 WHERE unit_id=$2 RETURNING *', [unit_name, id])).rows[0]
exports.remove = async (id) => db.query('DELETE FROM units WHERE unit_id=$1', [id])
