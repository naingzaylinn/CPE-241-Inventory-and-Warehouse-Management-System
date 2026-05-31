const s = require('../services/stockSales.service')
const { success, error } = require('../utils/response')

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
    const { stock_date, warehouse_id, reason, customer_id, line_items } = req.body
    const fe = []
    if (!stock_date) fe.push({ field: 'stock_date', reason: 'must not be blank' })
    if (!warehouse_id) fe.push({ field: 'warehouse_id', reason: 'must not be blank' })
    if (!['Sales', 'Sales Return'].includes(reason)) fe.push({ field: 'reason', reason: 'must be Sales or Sales Return' })
    if (!customer_id) fe.push({ field: 'customer_id', reason: 'must not be blank' })
    if (!line_items?.length) fe.push({ field: 'line_items', reason: 'must have at least 1 item' })
    line_items?.forEach((item, i) => {
      if (!item.product_code) fe.push({ field: `line_items[${i}].product_code`, reason: 'must not be blank' })
      if (reason === 'Sales' && !(item.quantity_out > 0)) fe.push({ field: `line_items[${i}].quantity_out`, reason: 'must be > 0 for Sales' })
      if (reason === 'Sales Return' && !(item.quantity_in > 0)) fe.push({ field: `line_items[${i}].quantity_in`, reason: 'must be > 0 for Sales Return' })
      if (!(item.unit_price >= 0)) fe.push({ field: `line_items[${i}].unit_price`, reason: 'must be >= 0' })
    })
    if (fe.length) return error(res, 400, 'VALIDATION_ERROR', 'Invalid input', fe)
    success(res, await s.create(req.body), 201)
  } catch (err) {
    if (err.status === 422) return error(res, 422, 'INSUFFICIENT_STOCK', err.message)
    error(res, 500, 'SERVER_ERROR', err.message)
  }
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
