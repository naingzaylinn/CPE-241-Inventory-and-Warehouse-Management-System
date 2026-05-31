import { http } from './http'
const qs = (p) => { const q = new URLSearchParams(p).toString(); return q ? '?' + q : '' }
export const stockSalesApi = {
  list:   (p = {})   => http.get(`/stock/sales${qs(p)}`),
  get:    (id)       => http.get(`/stock/sales/${id}`),
  create: (data)     => http.post('/stock/sales', data),
  update: (id, data) => http.put(`/stock/sales/${id}`, data),
  delete: (id)       => http.delete(`/stock/sales/${id}`)
}
