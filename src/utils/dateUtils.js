// ─── Time helpers ─────────────────────────────────────────────────────────────

/** "HH:MM" → total minutes from midnight */
export function timeToMins(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** total minutes → "HH:MM" */
export function minsToTime(mins) {
  const h = Math.floor(mins / 60) % 24
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** total minutes → "H:MM AM/PM" display string */
export function minsToDisplay(mins) {
  const h24 = Math.floor(mins / 60) % 24
  const m   = mins % 60
  const ampm = h24 < 12 ? 'AM' : 'PM'
  const h12  = h24 % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

/** "HH:MM" → "H:MM AM/PM" display string */
export function timeToDisplay(t) {
  return minsToDisplay(timeToMins(t))
}

/** Current time as minutes from midnight */
export function nowMins() {
  const n = new Date()
  return n.getHours() * 60 + n.getMinutes()
}

/** Returns 0..1 progress fraction through a block [start, end] given currentMins */
export function blockProgress(startMins, endMins, currentMins) {
  if (currentMins <= startMins) return 0
  if (currentMins >= endMins)   return 1
  return (currentMins - startMins) / (endMins - startMins)
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Date → "YYYY-MM-DD" Firestore key */
export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "YYYY-MM-DD" → Date (local) */
export function fromDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Today as "YYYY-MM-DD" */
export function todayKey() {
  return toDateKey(new Date())
}

/** ISO week number string "YYYY-WNN" */
export function toWeekKey(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const wn = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  return `${d.getFullYear()}-W${String(wn).padStart(2, '0')}`
}

/** Array of last N date keys (today first) */
export function lastNDateKeys(n) {
  const keys = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    keys.push(toDateKey(d))
  }
  return keys
}

/** Friendly day label "Mon 7 Jul" */
export function friendlyDate(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** "Mon" etc. */
export function shortDayName(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'short' })
}

/** Is midnight passed for a given block end time (HH:MM)? */
export function isBlockPast(endTime, currentMins) {
  return currentMins >= timeToMins(endTime)
}

/** Is it currently within this block's window? */
export function isBlockActive(startTime, endTime, currentMins) {
  const s = timeToMins(startTime)
  const e = timeToMins(endTime)
  return currentMins >= s && currentMins < e
}

/** Phase determination based on date */
export function getCurrentPhase(manualOverride) {
  if (manualOverride) return manualOverride
  const now = new Date()
  // Phase 1: July 7 – July 31 2026. Phase 2: August 1+ 2026
  if (now.getFullYear() === 2026 && now.getMonth() === 6 /* July */ && now.getDate() <= 31) {
    return 'phase1'
  }
  return 'phase2'
}
