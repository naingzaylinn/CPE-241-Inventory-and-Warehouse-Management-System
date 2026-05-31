import { http } from './http'
export const unitsApi = {
  list:   ()         => http.get('/units'),
  get:    (id)       => http.get(`/units/${id}`),
  create: (data)     => http.post('/units', data),
  update: (id, data) => http.put(`/units/${id}`, data),
  delete: (id)       => http.delete(`/units/${id}`)
}
