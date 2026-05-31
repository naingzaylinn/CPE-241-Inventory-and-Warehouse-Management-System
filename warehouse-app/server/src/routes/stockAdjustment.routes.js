const express = require('express')
const router = express.Router()
const c = require('../controllers/stockAdjustment.controller')

router.get('/balance/lookup', c.getBalance)
router.get('/', c.getAll)
router.get('/:id', c.getOne)
router.post('/', c.create)
router.put('/:id', c.update)
router.delete('/:id', c.remove)

module.exports = router
