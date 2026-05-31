export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return dateStr.split('T')[0]
}

export const formatNumber = (n, decimals = 2) => {
  if (n === null || n === undefined) return '—'
  return parseFloat(n).toFixed(decimals)
}

export const formatBaht = (n) => {
  if (n === null || n === undefined) return '—'
  return parseFloat(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
