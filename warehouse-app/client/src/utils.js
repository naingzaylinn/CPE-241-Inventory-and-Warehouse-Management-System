export const formatDate = (val) => {
  if (!val) return '—'
  return String(val).split('T')[0]
}

export const formatNumber = (val, decimals = 2) => {
  if (val === null || val === undefined || val === '') return '—'
  return parseFloat(val).toFixed(decimals)
}

export const formatBaht = (val) => {
  if (val === null || val === undefined) return '—'
  return parseFloat(val).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export const today = () => new Date().toISOString().split('T')[0]

export const emptyStr = (v) => v === null || v === undefined || v === '' ? '—' : v
