import { http } from './http'
const qs = (p) => { const q = new URLSearchParams(p).toString(); return q ? '?' + q : '' }
export const stockPurchaseApi = {
  list:   (p = {})   => http.get(`/stock/purchase${qs(p)}`),
  get:    (id)       => http.get(`/stock/purchase/${id}`),
  create: (data)     => http.post('/stock/purchase', data),
  update: (id, data) => http.put(`/stock/purchase/${id}`, data),
  delete: (id)       => http.delete(`/stock/purchase/${id}`)
}
