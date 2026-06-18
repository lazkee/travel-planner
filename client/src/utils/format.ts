const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
})

function formatWith(formatter: Intl.DateTimeFormat, value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not set' : formatter.format(date)
}

export function formatDate(value: string): string {
  return formatWith(shortDateFormatter, value)
}

export function formatLongDate(value: string): string {
  return formatWith(longDateFormatter, value)
}

export function formatDateTime(value: string): string {
  return formatWith(dateTimeFormatter, value)
}

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}
