import { http } from './http'
export const customersApi = {
  list:   ()         => http.get('/customers'),
  get:    (id)       => http.get(`/customers/${id}`),
  create: (data)     => http.post('/customers', data),
  update: (id, data) => http.put(`/customers/${id}`, data),
  delete: (id)       => http.delete(`/customers/${id}`)
}
