import { useState, useEffect } from 'react'
import { toDateKey, fromDateKey, friendlyDate, shortDayName } from '../utils/dateUtils'
import { weekCompletion } from '../utils/streakUtils'
import { getScheduleForDate } from '../data/schedule'
import { computeBlockStates, dayCompletion } from '../utils/blockUtils'

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getPctClass(pct) {
  if (pct === null) return 'none'
  if (pct >= 80) return 'high'
  if (pct >= 50) return 'mid'
  return 'low'
}

export default function WeekView({ data }) {
  const { settings, historyLogs, loadHistory } = data
  const batch = settings?.batch || 1

  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    loadHistory(14).then(() => setLoaded(true))
  }, [])

  // Build current week (Mon–Sat)
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

  const weekDays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  return (
    <>
      <div className="day-header" style={{ marginBottom: 24 }}>
        <div className="day-name" style={{ fontSize: 22 }}>This Week</div>
        <div className="day-date">{shortDayName(monday)} – {shortDayName(weekDays[5])}</div>
      </div>

      {!loaded ? (
        <div className="loading">Loading…</div>
      ) : (
        <>
          {/* 6-day grid */}
          <div className="week-grid">
            {weekDays.map(d => {
              const key = toDateKey(d)
              const log = historyLogs[key]
              const { blocks, config } = getScheduleForDate(d, batch)
              const computed = computeBlockStates(blocks, config, log, log?.stayBackMinutes || 0)
              const { done, total } = dayCompletion(computed)
              const isFuture = d > today
              const isToday  = key === toDateKey(today)
              const isSunday = d.getDay() === 0

              let pctDisplay = '—'
              let pct = null
              if (!isSunday && total > 0) {
                if (isFuture) { pctDisplay = '·'; pct = null }
                else {
                  pct = Math.round((done / total) * 100)
                  pctDisplay = `${pct}%`
                }
              } else if (!isSunday && total === 0 && !isFuture) {
                pctDisplay = '—'
              }

              // Friday: neutral label
              const isFriday = d.getDay() === 5
              if (isFriday && !isFuture) { pctDisplay = '📋'; pct = null }

              return (
                <div key={key} className={`week-day-cell ${isToday ? 'today' : ''}`}>
                  <div className="wdc-name">{DAY_NAMES[d.getDay()]}</div>
                  <div className={`wdc-pct ${getPctClass(pct)}`}>{pctDisplay}</div>
                  {pct !== null && (
                    <div className="wdc-bar-track">
                      <div className="wdc-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                  {log?.isEventDay && (
                    <div style={{ fontSize: 9, color: 'var(--col-MA)', marginTop: 4, fontWeight: 600 }}>EVENT</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Previous week */}
          <div className="section-header" style={{ marginTop: 8 }}>
            <span className="section-title">Last week</span>
          </div>
          <div className="week-grid">
            {Array.from({ length: 6 }, (_, i) => {
              const d = new Date(monday)
              d.setDate(monday.getDate() - 7 + i)
              const key = toDateKey(d)
              const log = historyLogs[key]
              const { blocks, config } = getScheduleForDate(d, batch)
              const computed = computeBlockStates(blocks, config, log, log?.stayBackMinutes || 0)
              const { done, total } = dayCompletion(computed)
              const isFriday = d.getDay() === 5
              const pct = (!isFriday && total > 0) ? Math.round((done / total) * 100) : null

              return (
                <div key={key} className="week-day-cell" style={{ opacity: 0.7 }}>
                  <div className="wdc-name">{DAY_NAMES[d.getDay()]}</div>
                  <div className={`wdc-pct ${getPctClass(pct)}`}>
                    {isFriday ? '📋' : pct !== null ? `${pct}%` : '—'}
                  </div>
                  {pct !== null && (
                    <div className="wdc-bar-track">
                      <div className="wdc-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: '≥ 80%', cls: 'high', colour: 'var(--state-done)' },
              { label: '50–79%', cls: 'mid', colour: 'var(--col-MA)' },
              { label: '< 50%', cls: 'low', colour: 'var(--state-missed)' },
            ].map(item => (
              <div key={item.cls} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.colour }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12 }}>📋</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Recovery day</span>
            </div>
          </div>
        </>
      )}
    </>
  )
}
