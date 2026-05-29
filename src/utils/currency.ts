// Currency utility — maps currency codes to their symbols
export function getCurrencySymbol(currency?: string): string {
  const map: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    THB: '฿',
    IDR: 'Rp',
  }
  return map[currency || 'INR'] || '₹'
}

export function formatAmount(amount: number, currency?: string): string {
  const sym = getCurrencySymbol(currency)
  return `${sym}${amount.toFixed(2)}`
}
