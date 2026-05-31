const express = require('express')
const router = express.Router()
const c = require('../controllers/reports.controller')

router.get('/product-list', c.productList)
router.get('/bom-print', c.bomPrint)
router.get('/stock-by-type', c.stockByType)
router.get('/purchase-list', c.purchaseList)
router.get('/receiving-voucher', c.receivingVoucher)
router.get('/purchase-by-supplier', c.purchaseBySupplier)
router.get('/sales-list', c.salesList)
router.get('/delivery-voucher', c.deliveryVoucher)
router.get('/sales-by-product', c.salesByProduct)
router.get('/stock-balance', c.stockBalance)
router.get('/stock-card', c.stockCard)
router.get('/adjustment-by-product', c.adjustmentByProduct)

module.exports = router
