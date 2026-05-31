import { http } from './http'
export const productTypesApi = {
  list:   ()         => http.get('/product-types'),
  get:    (id)       => http.get(`/product-types/${id}`),
  create: (data)     => http.post('/product-types', data),
  update: (id, data) => http.put(`/product-types/${id}`, data),
  delete: (id)       => http.delete(`/product-types/${id}`)
}
