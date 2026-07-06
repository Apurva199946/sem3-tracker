import { useState, useEffect, useCallback } from 'react'
import { getScheduleForDate } from '../data/schedule'
import {
  computeBlockStates, findCurrentAndNext,
  stayingBackStatus, dayCompletion, BLOCK_STATE,
} from '../utils/blockUtils'
import { todayKey, toWeekKey, friendlyDate, nowMins, timeToMins } from '../utils/dateUtils'
import RightNowCard from '../components/RightNowCard'
import StayBackInput from '../components/StayBackInput'
import InternshipPrepBlock from '../components/InternshipPrepBlock'
import BlockItem from '../components/BlockItem'
import AssignmentBadge from '../components/AssignmentBadge'

export default function TodayView({ data, setActiveTab }) {
  const { settings, phase, todayLog, todayLogLoaded,
          toggleBlock, togglePrepItem, setFitness,
          setStayBack, setEventDay, weekLog, toggleLinkedin,
          assignments } = data

  const [tick, setTick] = useState(0)

  // Re-render every 60s to update block states
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const today  = new Date()
  const batch  = settings?.batch || 1
  const { blocks, config, label: dayLabel, isFree } = getScheduleForDate(today, batch)
  const isWeekend = today.getDay() === 0 // Sunday
  const stayBackMins = todayLog?.stayBackMinutes || 0

  // Compute all block states
  const computedBlocks = computeBlockStates(blocks, config, todayLog, stayBackMins)
  const { currentBlock, nextBlocks } = findCurrentAndNext(computedBlocks)
  const staying = stayingBackStatus(config, stayBackMins)
  const { done, total } = dayCompletion(computedBlocks)

  // Event day modal state
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventNote, setEventNote] = useState('')

  const handleStayBack = useCallback((mins, note) => {
    setStayBack(mins, note)
  }, [setStayBack])

  const handleEventDay = () => {
    if (!eventNote.trim()) return
    setEventDay(true, eventNote)
    setShowEventModal(false)
  }

  const handleClearEventDay = () => setEventDay(false, '')

  // LinkedIn: show on Friday stay-back or Saturday
  const dayIdx = today.getDay()
  const showLinkedin = (dayIdx === 5 && stayBackMins > 0) || dayIdx === 6
  const weekKey = toWeekKey(today)
  const linkedinDone = weekLog?.linkedinDone

  if (!todayLogLoaded) return <div className="loading">Loading today…</div>

  return (
    <>
      {/* Day header */}
      <div className="day-header">
        <div className="day-name">{dayLabel || 'Sunday'}</div>
        <div className="day-date">{friendlyDate(today)}</div>
      </div>

      {/* Upcoming assignment badge */}
      <AssignmentBadge assignments={assignments} onNavigate={setActiveTab} />

      {/* Event day banner */}
      {todayLog?.isEventDay && (
        <div className="event-banner">
          <div className="event-banner-icon">🗓️</div>
          <div className="event-banner-text">
            <div className="event-banner-label">Event Day — all streaks frozen</div>
            {todayLog.eventDayNote && (
              <div className="event-banner-note">{todayLog.eventDayNote}</div>
            )}
          </div>
          <button
            onClick={handleClearEventDay}
            style={{ fontSize: 11, color: 'var(--text-muted)', padding: '4px 8px' }}
          >Clear</button>
        </div>
      )}

      {/* Sunday / no schedule */}
      {isWeekend && today.getDay() === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😴</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Sunday — rest day</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>No schedule. You earned it.</div>
        </div>
      )}

      {!isWeekend && (
        <>
          {/* RIGHT NOW card */}
          <RightNowCard
            currentBlock={currentBlock}
            nextBlocks={nextBlocks}
            stayingBack={staying}
            onCheck={toggleBlock}
            onFitness={setFitness}
            checkedBlocks={todayLog?.checkedBlocks}
            fitness={todayLog?.fitness}
          />

          {/* Coming up */}
          {nextBlocks.length > 0 && !staying.active && (
            <div className="coming-up card" style={{ padding: '0 14px', marginBottom: 20 }}>
              <div style={{ padding: '12px 0 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Coming up
              </div>
              {nextBlocks.map(b => (
                <div key={b.id} className="coming-up-item">
                  <div className="cu-time">
                    {timeToMins(b.effectiveStart) >= 0
                      ? b.effectiveStart.replace(':','').replace(/^0/,'').replace(/(\d{1,2})(\d{2})$/,'$1:$2')
                      : '—'}
                  </div>
                  <div className="cu-dot" style={{
                    background: b.tracked
                      ? (b.type === 'fitness' ? 'var(--col-fitness)' :
                         b.type === 'internship_prep' ? 'var(--col-prep)' :
                         b.type === 'study' ? 'var(--col-study)' : 'var(--border-light)')
                      : 'var(--border)'
                  }} />
                  <div className="cu-label">{b.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Stay-back input — only on college days */}
          {config && (
            <StayBackInput
              value={stayBackMins}
              note={todayLog?.stayBackNote || ''}
              onChange={handleStayBack}
            />
          )}

          {/* Day completion bar */}
          {total > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div className="section-header">
                <span className="section-title">Today's progress</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
                  {done}/{total}
                </span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${total > 0 ? Math.round((done / total) * 100) : 0}%`,
                  background: done === total ? 'var(--state-done)' : 'var(--col-study)',
                  borderRadius: 2,
                  transition: 'width 0.4s',
                }} />
              </div>
            </div>
          )}

          {/* Block list */}
          <div className="section-header">
            <span className="section-title">Schedule</span>
            {!todayLog?.isEventDay && (
              <button
                style={{ fontSize: 11, color: 'var(--text-muted)' }}
                onClick={() => setShowEventModal(true)}
              >
                Mark event day
              </button>
            )}
          </div>

          <div className="block-list">
            {computedBlocks.map(block => {
              // Internship prep gets its own expanded component
              if (block.type === 'internship_prep' && block.tracked) {
                if (block.state === BLOCK_STATE.ABSORBED) {
                  return (
                    <div key={block.id} className="block-item state-absorbed">
                      <div className="block-time" style={{ paddingLeft: 8 }}>{block.effectiveStart}</div>
                      <div className="block-label-wrap">
                        <div className="block-label">Internship Prep</div>
                        <div className="block-state-label">absorbed</div>
                      </div>
                    </div>
                  )
                }
                return (
                  <InternshipPrepBlock
                    key={block.id}
                    block={block}
                    phase={phase}
                    prepState={todayLog?.internshipPrep || {}}
                    onToggle={togglePrepItem}
                  />
                )
              }

              // LinkedIn
              if (block.type === 'linkedin' && block.tracked) {
                if (!showLinkedin && dayIdx === 5) return null
                return (
                  <div key={block.id} className="block-item" style={{ borderColor: linkedinDone ? 'rgba(56,189,248,0.3)' : 'var(--border)', background: linkedinDone ? 'rgba(56,189,248,0.06)' : 'var(--bg-surface)' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--col-linkedin)' }} />
                    <div className="block-time" style={{ paddingLeft: 8 }}>{block.effectiveStart}</div>
                    <div className="block-label-wrap">
                      <div className="block-label" style={{ color: linkedinDone ? 'var(--col-linkedin)' : undefined }}>
                        {block.label}
                      </div>
                    </div>
                    <button
                      className={`check-btn ${linkedinDone ? 'done' : 'future'}`}
                      onClick={toggleLinkedin}
                    >
                      {linkedinDone ? '✓ Done' : 'Done'}
                    </button>
                  </div>
                )
              }

              return (
                <BlockItem
                  key={block.id}
                  block={block}
                  onCheck={(id, val) => toggleBlock(id, val)}
                  onFitness={setFitness}
                  fitness={todayLog?.fitness}
                />
              )
            })}
          </div>

          {/* Friday note */}
          {dayIdx === 5 && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 12 }}>
              Recovery day — attendance is the job. Stay-back unlocks LinkedIn.
            </div>
          )}
        </>
      )}

      {/* Event day modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Mark as Event Day</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              All streaks will be frozen — this day won't count for or against any streak. You must record why.
            </p>
            <div className="form-field">
              <label className="form-label">Reason (required)</label>
              <input
                className="form-input"
                placeholder="e.g. College fest, medical appointment…"
                value={eventNote}
                onChange={e => setEventNote(e.target.value)}
                autoFocus
              />
            </div>
            <button
              className="submit-btn"
              onClick={handleEventDay}
              disabled={!eventNote.trim()}
              style={{ opacity: eventNote.trim() ? 1 : 0.5 }}
            >
              Confirm Event Day
            </button>
            <button className="cancel-btn" onClick={() => setShowEventModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}
