import { http } from './http'

export const stockSalesApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return http.get(`/stock/sales${qs ? '?' + qs : ''}`)
  },
  get: (id) => http.get(`/stock/sales/${id}`),
  create: (data) => http.post('/stock/sales', data),
  update: (id, data) => http.put(`/stock/sales/${id}`, data),
  delete: (id) => http.delete(`/stock/sales/${id}`)
}
