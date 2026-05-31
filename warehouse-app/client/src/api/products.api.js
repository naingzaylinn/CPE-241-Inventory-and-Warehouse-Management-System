import { http } from './http'

export const productsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return http.get(`/products${qs ? '?' + qs : ''}`)
  },
  get: (id) => http.get(`/products/${id}`),
  create: (data) => http.post('/products', data),
  update: (id, data) => http.put(`/products/${id}`, data),
  delete: (id) => http.delete(`/products/${id}`)
}
