import { http } from './http'
export const suppliersApi = {
  list:   ()         => http.get('/suppliers'),
  get:    (id)       => http.get(`/suppliers/${id}`),
  create: (data)     => http.post('/suppliers', data),
  update: (id, data) => http.put(`/suppliers/${id}`, data),
  delete: (id)       => http.delete(`/suppliers/${id}`)
}
