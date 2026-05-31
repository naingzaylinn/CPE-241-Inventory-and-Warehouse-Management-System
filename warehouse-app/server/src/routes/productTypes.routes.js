const express = require('express')
const router = express.Router()
const s = require('../services/productTypes.service')
const { success, error } = require('../utils/response')

router.get('/', async (req, res) => {
  try {
    success(res, await s.getAll())
  } catch (err) {
    error(res, 500, 'SERVER_ERROR', err.message)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const row = await s.getOne(req.params.id)
    if (!row) return error(res, 404, 'NOT_FOUND', 'Product type not found')
    success(res, row)
  } catch (err) {
    error(res, 500, 'SERVER_ERROR', err.message)
  }
})

router.post('/', async (req, res) => {
  try {
    const { type_id, type_name } = req.body
    const fe = []
    if (!type_id) fe.push({ field: 'type_id', reason: 'must not be blank' })
    if (!type_name) fe.push({ field: 'type_name', reason: 'must not be blank' })
    if (fe.length) return error(res, 400, 'VALIDATION_ERROR', 'Invalid input', fe)
    success(res, await s.create(req.body), 201)
  } catch (err) {
    if (err.code === '23505') return error(res, 400, 'VALIDATION_ERROR', 'Invalid input', [{ field: 'type_id', reason: 'must be unique' }])
    error(res, 500, 'SERVER_ERROR', err.message)
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { type_name } = req.body
    if (!type_name) return error(res, 400, 'VALIDATION_ERROR', 'Invalid input', [{ field: 'type_name', reason: 'must not be blank' }])
    const row = await s.update(req.params.id, req.body)
    if (!row) return error(res, 404, 'NOT_FOUND', 'Product type not found')
    success(res, row)
  } catch (err) {
    error(res, 500, 'SERVER_ERROR', err.message)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await s.remove(req.params.id)
    res.status(204).send()
  } catch (err) {
    if (err.code === '23503') return error(res, 409, 'CONFLICT', 'Cannot delete: referenced by a product')
    error(res, 500, 'SERVER_ERROR', err.message)
  }
})

module.exports = router
