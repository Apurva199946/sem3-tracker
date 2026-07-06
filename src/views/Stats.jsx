import { useState, useEffect } from 'react'
import {
  STREAK_CATEGORIES,
  evaluateDayStreaks,
  calculateStreak,
  calculateLinkedinStreak,
} from '../utils/streakUtils'
import { getScheduleForDate } from '../data/schedule'
import { lastNDateKeys, fromDateKey, toWeekKey } from '../utils/dateUtils'
import { loadWeekLogsRange } from '../firebase'

export default function StatsView({ user, data }) {
  const { settings, historyLogs, loadHistory } = data
  const batch = settings?.batch || 1

  const [loaded, setLoaded]       = useState(false)
  const [weekLogs, setWeekLogs]   = useState({})
  const [dayResults, setDayResults] = useState({})

  useEffect(() => {
    const run = async () => {
      const logs = await loadHistory(28)

      // Build per-day streak evaluation
      const results = {}
      const dateKeys = lastNDateKeys(28)
      for (const key of dateKeys) {
        const d = fromDateKey(key)
        const { blocks } = getScheduleForDate(d, batch)
        results[key] = evaluateDayStreaks(logs[key], blocks, batch)
      }
      setDayResults(results)

      // Load week logs for LinkedIn streak
      const weekKeys = [...new Set(lastNDateKeys(56).map(k => toWeekKey(fromDateKey(k))))]
      const wl = await loadWeekLogsRange(user.uid, weekKeys)
      setWeekLogs(wl)
      setLoaded(true)
    }
    run()
  }, [])

  if (!loaded) return <div className="loading">Calculating streaks…</div>

  const sortedDateKeys = lastNDateKeys(28)
  const sortedWeekKeys = [...new Set(sortedDateKeys.map(k => toWeekKey(fromDateKey(k))))].sort().reverse()

  // Calculate all streaks
  const streaks = {}
  for (const cat of STREAK_CATEGORIES) {
    if (cat.isWeekly) {
      streaks[cat.id] = calculateLinkedinStreak(weekLogs, sortedWeekKeys)
    } else {
      streaks[cat.id] = calculateStreak(dayResults, cat.id, sortedDateKeys)
    }
  }

  // 4-week completion by week
  const weeklyCompletion = sortedWeekKeys.slice(0, 4).map(wk => {
    const keysInWeek = sortedDateKeys.filter(k => toWeekKey(fromDateKey(k)) === wk)
    let done = 0, total = 0
    keysInWeek.forEach(key => {
      const d = fromDateKey(key)
      const { blocks } = getScheduleForDate(d, batch)
      const log = historyLogs[key]
      const checked = log?.checkedBlocks || {}
      const isEvent = log?.isEventDay
      if (isEvent) return
      blocks.forEach(b => {
        if (!b.tracked) return
        total++
        if (checked[b.id]?.checked) done++
      })
    })
    return { wk, pct: total > 0 ? Math.round((done / total) * 100) : null }
  })

  return (
    <>
      <div className="day-header" style={{ marginBottom: 24 }}>
        <div className="day-name" style={{ fontSize: 22 }}>Streaks</div>
        <div className="day-date">Last 28 days</div>
      </div>

      <div className="streak-grid">
        {STREAK_CATEGORIES.map(cat => {
          const n = streaks[cat.id] || 0
          const isOnFire = n >= 7
          return (
            <div key={cat.id} className="streak-card">
              <div className="streak-emoji">{cat.emoji}</div>
              <div className={`streak-number ${isOnFire ? 'on-fire' : ''}`}>{n}</div>
              <div className="streak-label">{cat.label}</div>
              <div className="streak-best">
                {cat.isWeekly ? 'weeks' : n === 1 ? 'day' : 'days'}
                {isOnFire && ' 🔥'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Weekly completion chart */}
      <div className="section-header" style={{ marginTop: 8 }}>
        <span className="section-title">Weekly completion</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {weeklyCompletion.map(({ wk, pct }) => (
          <div key={wk}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{wk}</span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                color: pct === null ? 'var(--text-muted)' : pct >= 80 ? 'var(--state-done)' : pct >= 50 ? 'var(--col-MA)' : 'var(--state-missed)'
              }}>
                {pct !== null ? `${pct}%` : '—'}
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
              {pct !== null && (
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: pct >= 80 ? 'var(--state-done)' : pct >= 50 ? 'var(--col-MA)' : 'var(--state-missed)',
                  borderRadius: 3,
                  transition: 'width 0.5s',
                }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Note about Friday */}
      <div style={{ marginTop: 24, padding: 12, background: 'var(--bg-surface)', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Friday is excluded from completion calculations — it's a recovery day by design with almost no tracked blocks.
      </div>
    </>
  )
}
