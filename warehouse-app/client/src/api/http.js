const BASE = import.meta.env.VITE_API_BASE || '/api/v1'

const request = async (method, path, body = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, options)
  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export const http = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path)
}
