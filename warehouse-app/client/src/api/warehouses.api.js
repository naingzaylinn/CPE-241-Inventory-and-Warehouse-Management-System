import { http } from './http'
export const warehousesApi = {
  list:   ()         => http.get('/warehouses'),
  get:    (id)       => http.get(`/warehouses/${id}`),
  create: (data)     => http.post('/warehouses', data),
  update: (id, data) => http.put(`/warehouses/${id}`, data),
  delete: (id)       => http.delete(`/warehouses/${id}`)
}
