import { http } from './http'

export const stockPurchaseApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return http.get(`/stock/purchase${qs ? '?' + qs : ''}`)
  },
  get: (id) => http.get(`/stock/purchase/${id}`),
  create: (data) => http.post('/stock/purchase', data),
  update: (id, data) => http.put(`/stock/purchase/${id}`, data),
  delete: (id) => http.delete(`/stock/purchase/${id}`)
}
