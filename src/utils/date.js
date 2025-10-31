// Simple date formatting helpers for UI
// - formatDate: dd/mm/yyyy
// - formatDateTime: dd/mm/yyyy HH:mm

function pad(n) { return String(n).padStart(2, '0') }

export function formatDate(value) {
  if (!value) return ''
  // Handle date-only strings like 'YYYY-MM-DD' without timezone shifts
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-')
    return `${pad(d)}/${pad(m)}/${y}`
  }
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return ''
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function formatDateTime(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return ''
  const day = pad(d.getDate())
  const month = pad(d.getMonth() + 1)
  const year = d.getFullYear()
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Parse various date/time string formats into a Date (local time)
// Supports:
// - ISO strings (from Supabase timestamptz)
// - 'YYYY-MM-DD' (date only)
// - 'dd/mm/yyyy' and 'dd/mm/yyyy HH:mm'
export function parseDateTime(value) {
  if (!value) return null
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value
  if (typeof value === 'string') {
    // ISO: rely on native parsing
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const d = new Date(value)
      return isNaN(d.getTime()) ? null : d
    }
    // dd/mm/yyyy [HH:mm]
    const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/)
    if (m) {
      const day = parseInt(m[1], 10)
      const month = parseInt(m[2], 10) - 1
      const year = parseInt(m[3], 10)
      const hour = m[4] ? parseInt(m[4], 10) : 0
      const minute = m[5] ? parseInt(m[5], 10) : 0
      const d = new Date(year, month, day, hour, minute)
      return isNaN(d.getTime()) ? null : d
    }
  }
  // Fallback
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}
