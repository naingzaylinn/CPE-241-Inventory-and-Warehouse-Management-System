import { http } from './http'

export const stockAdjustmentApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return http.get(`/stock/adjustment${qs ? '?' + qs : ''}`)
  },
  get: (id) => http.get(`/stock/adjustment/${id}`),
  create: (data) => http.post('/stock/adjustment', data),
  update: (id, data) => http.put(`/stock/adjustment/${id}`, data),
  delete: (id) => http.delete(`/stock/adjustment/${id}`),
  getBalance: (warehouse_id, product_code) =>
    http.get(`/stock/adjustment/balance/lookup?warehouse_id=${warehouse_id}&product_code=${product_code}`)
}
