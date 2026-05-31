import { http } from './http'
const qs = (p = {}) => { const q = new URLSearchParams(p).toString(); return q ? '?' + q : '' }
export const reportsApi = {
  productList:         (p) => http.get(`/reports/product-list${qs(p)}`),
  bomPrint:            (p) => http.get(`/reports/bom-print${qs(p)}`),
  stockByType:         (p) => http.get(`/reports/stock-by-type${qs(p)}`),
  purchaseList:        (p) => http.get(`/reports/purchase-list${qs(p)}`),
  receivingVoucher:    (p) => http.get(`/reports/receiving-voucher${qs(p)}`),
  purchaseBySupplier:  (p) => http.get(`/reports/purchase-by-supplier${qs(p)}`),
  salesList:           (p) => http.get(`/reports/sales-list${qs(p)}`),
  deliveryVoucher:     (p) => http.get(`/reports/delivery-voucher${qs(p)}`),
  salesByProduct:      (p) => http.get(`/reports/sales-by-product${qs(p)}`),
  stockBalance:        (p) => http.get(`/reports/stock-balance${qs(p)}`),
  stockCard:           (p) => http.get(`/reports/stock-card${qs(p)}`),
  adjustmentByProduct: (p) => http.get(`/reports/adjustment-by-product${qs(p)}`)
}
