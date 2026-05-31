const express = require('express')
const router = express.Router()
const s = require('../services/products.service')
const { success, error } = require('../utils/response')

router.get('/', async (req, res) => {
  try { success(res, await s.getAll(req.query)) } catch (err) { error(res, 500, 'SERVER_ERROR', err.message) }
})
router.get('/:id', async (req, res) => {
  try {
    const row = await s.getOne(req.params.id)
    if (!row) return error(res, 404, 'NOT_FOUND', 'Product not found')
    success(res, row)
  } catch (err) { error(res, 500, 'SERVER_ERROR', err.message) }
})
router.post('/', async (req, res) => {
  try {
    const { product_name, type_id, unit_id, price, has_bom, line_items } = req.body
    const fe = []
    if (!product_name) fe.push({ field: 'product_name', reason: 'must not be blank' })
    if (!type_id) fe.push({ field: 'type_id', reason: 'must not be blank' })
    if (!unit_id) fe.push({ field: 'unit_id', reason: 'must not be blank' })
    if (price === undefined || price === '') fe.push({ field: 'price', reason: 'must not be blank' })
    if (has_bom && (!line_items || line_items.length === 0)) fe.push({ field: 'line_items', reason: 'must have at least 1 item when has_bom is true' })
    if (fe.length) return error(res, 400, 'VALIDATION_ERROR', 'Invalid input', fe)
    success(res, await s.create(req.body), 201)
  } catch (err) {
    if (err.code === '23503') return error(res, 400, 'VALIDATION_ERROR', 'Invalid input', [{ field: 'type_id or unit_id', reason: 'referenced value does not exist' }])
    error(res, 500, 'SERVER_ERROR', err.message)
  }
})
router.put('/:id', async (req, res) => {
  try {
    const { product_name, type_id, unit_id, price } = req.body
    const fe = []
    if (!product_name) fe.push({ field: 'product_name', reason: 'must not be blank' })
    if (!type_id) fe.push({ field: 'type_id', reason: 'must not be blank' })
    if (!unit_id) fe.push({ field: 'unit_id', reason: 'must not be blank' })
    if (price === undefined || price === '') fe.push({ field: 'price', reason: 'must not be blank' })
    if (fe.length) return error(res, 400, 'VALIDATION_ERROR', 'Invalid input', fe)
    const row = await s.update(req.params.id, req.body)
    if (!row) return error(res, 404, 'NOT_FOUND', 'Product not found')
    success(res, row)
  } catch (err) { error(res, 500, 'SERVER_ERROR', err.message) }
})
router.delete('/:id', async (req, res) => {
  try {
    await s.remove(req.params.id)
    res.status(204).send()
  } catch (err) {
    if (err.code === '23503') return error(res, 409, 'CONFLICT', 'Cannot delete: referenced in stock or BOM')
    error(res, 500, 'SERVER_ERROR', err.message)
  }
})

module.exports = router
