const s = require('../services/stockAdjustment.service')
const { success, error } = require('../utils/response')

exports.getBalance = async (req, res) => {
  try {
    const { warehouse_id, product_code } = req.query
    if (!warehouse_id || !product_code) return error(res, 400, 'VALIDATION_ERROR', 'warehouse_id and product_code required')
    success(res, { balance: await s.getSystemBalance(warehouse_id, product_code) })
  } catch (err) { error(res, 500, 'SERVER_ERROR', err.message) }
}
exports.getAll = async (req, res) => {
  try { success(res, await s.getAll(req.query)) } catch (err) { error(res, 500, 'SERVER_ERROR', err.message) }
}
exports.getOne = async (req, res) => {
  try {
    const row = await s.getOne(req.params.id)
    if (!row) return error(res, 404, 'NOT_FOUND', 'Record not found')
    success(res, row)
  } catch (err) { error(res, 500, 'SERVER_ERROR', err.message) }
}
exports.create = async (req, res) => {
  try {
    const { stock_date, warehouse_id, reason_for_adjustment, line_items } = req.body
    const fe = []
    if (!stock_date) fe.push({ field: 'stock_date', reason: 'must not be blank' })
    if (!warehouse_id) fe.push({ field: 'warehouse_id', reason: 'must not be blank' })
    if (!reason_for_adjustment) fe.push({ field: 'reason_for_adjustment', reason: 'must not be blank' })
    if (!line_items?.length) fe.push({ field: 'line_items', reason: 'must have at least 1 item' })
    line_items?.forEach((item, i) => {
      if (!item.product_code) fe.push({ field: `line_items[${i}].product_code`, reason: 'must not be blank' })
      if (item.checked_balance === undefined || item.checked_balance === '' || item.checked_balance < 0)
        fe.push({ field: `line_items[${i}].checked_balance`, reason: 'must be >= 0' })
    })
    if (fe.length) return error(res, 400, 'VALIDATION_ERROR', 'Invalid input', fe)
    success(res, await s.create(req.body), 201)
  } catch (err) { error(res, 500, 'SERVER_ERROR', err.message) }
}
exports.update = async (req, res) => {
  try {
    const row = await s.update(req.params.id, req.body)
    if (!row) return error(res, 404, 'NOT_FOUND', 'Record not found')
    success(res, row)
  } catch (err) { error(res, 500, 'SERVER_ERROR', err.message) }
}
exports.remove = async (req, res) => {
  try { await s.remove(req.params.id); res.status(204).send() } catch (err) { error(res, 500, 'SERVER_ERROR', err.message) }
}
