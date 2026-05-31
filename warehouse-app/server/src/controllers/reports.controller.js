const s = require('../services/reports.service')
const { success, error } = require('../utils/response')

const wrap = (fn) => async (req, res) => {
  try { success(res, await fn(req.query)) }
  catch (err) { error(res, 500, 'SERVER_ERROR', err.message) }
}

exports.productList        = wrap(s.productList)
exports.bomPrint           = wrap(s.bomPrint)
exports.stockByType        = wrap(s.stockByType)
exports.purchaseList       = wrap(s.purchaseList)
exports.receivingVoucher   = wrap(s.receivingVoucher)
exports.purchaseBySupplier = wrap(s.purchaseBySupplier)
exports.salesList          = wrap(s.salesList)
exports.deliveryVoucher    = wrap(s.deliveryVoucher)
exports.salesByProduct     = wrap(s.salesByProduct)
exports.stockBalance       = wrap(s.stockBalance)
exports.stockCard          = wrap(s.stockCard)
exports.adjustmentByProduct = wrap(s.adjustmentByProduct)
