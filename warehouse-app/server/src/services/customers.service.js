const db = require('../db/pool')

exports.getAll = async () => (await db.query('SELECT * FROM customer ORDER BY customer_id')).rows
exports.getOne = async (id) => (await db.query('SELECT * FROM customer WHERE customer_id=$1', [id])).rows[0]
exports.create = async ({ customer_id, customer_name, contact_info }) =>
  (await db.query('INSERT INTO customer(customer_id,customer_name,contact_info) VALUES($1,$2,$3) RETURNING *', [customer_id, customer_name, contact_info || null])).rows[0]
exports.update = async (id, { customer_name, contact_info }) =>
  (await db.query('UPDATE customer SET customer_name=$1,contact_info=$2 WHERE customer_id=$3 RETURNING *', [customer_name, contact_info || null, id])).rows[0]
exports.remove = async (id) => db.query('DELETE FROM customer WHERE customer_id=$1', [id])
