import { http } from './http'
const qs = (p) => { const q = new URLSearchParams(p).toString(); return q ? '?' + q : '' }
export const stockAdjustmentApi = {
  list:       (p = {})              => http.get(`/stock/adjustment${qs(p)}`),
  get:        (id)                  => http.get(`/stock/adjustment/${id}`),
  create:     (data)                => http.post('/stock/adjustment', data),
  update:     (id, data)            => http.put(`/stock/adjustment/${id}`, data),
  delete:     (id)                  => http.delete(`/stock/adjustment/${id}`),
  getBalance: (warehouse_id, product_code) =>
    http.get(`/stock/adjustment/balance/lookup?warehouse_id=${warehouse_id}&product_code=${product_code}`)
}
