/**
 * Timezone-aware date helpers for streak and XP day boundaries.
 * Uses Intl — no external deps.
 */

const DEFAULT_TZ = 'UTC'

/**
 * Returns YYYY-MM-DD for "today" in the given timezone.
 * @param timezone IANA timezone (e.g. 'America/New_York') or undefined for UTC
 */
export function getTodayKey(timezone: string = DEFAULT_TZ): string {
  return formatDateInTimezone(new Date(), timezone)
}

/**
 * Returns YYYY-MM-DD for "yesterday" in the given timezone.
 */
export function getYesterdayKey(timezone: string = DEFAULT_TZ): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return formatDateInTimezone(d, timezone)
}

/**
 * Format a date as YYYY-MM-DD in the given timezone.
 */
function formatDateInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone || DEFAULT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const year = parts.find((p) => p.type === 'year')?.value ?? '0000'
  const month = parts.find((p) => p.type === 'month')?.value ?? '01'
  const day = parts.find((p) => p.type === 'day')?.value ?? '01'
  return `${year}-${month}-${day}`
}

