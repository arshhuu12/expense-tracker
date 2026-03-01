export function formatCurrency(amount) {
  const value = Number(amount ?? 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function getCurrentMonth() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function getLast6Months() {
  const result = []
  const d = new Date()
  d.setDate(1)

  for (let i = 0; i < 6; i++) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    result.push(`${y}-${m}`)
    d.setMonth(d.getMonth() - 1)
  }

  return result
}

