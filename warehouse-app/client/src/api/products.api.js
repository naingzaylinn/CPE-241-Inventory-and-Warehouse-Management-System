import { http } from './http'
const qs = (p) => { const q = new URLSearchParams(p).toString(); return q ? '?' + q : '' }
export const productsApi = {
  list:   (p = {})   => http.get(`/products${qs(p)}`),
  get:    (id)       => http.get(`/products/${id}`),
  create: (data)     => http.post('/products', data),
  update: (id, data) => http.put(`/products/${id}`, data),
  delete: (id)       => http.delete(`/products/${id}`)
}
