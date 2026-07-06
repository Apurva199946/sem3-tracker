import { fromDateKey, toDateKey, toWeekKey } from './dateUtils'
import { getScheduleForDate } from '../data/schedule'
import { BLOCK_STATE } from './blockUtils'

// Streak categories
export const STREAK_CATEGORIES = [
  { id: 'study',         label: 'Study',           emoji: '📚' },
  { id: 'python',        label: 'Python',          emoji: '🐍' },
  { id: 'project',       label: 'Project',         emoji: '🔬' },
  { id: 'git',           label: 'Git',             emoji: '🌿' },
  { id: 'placementPrep', label: 'Placement Prep',  emoji: '🎯' },
  { id: 'fitness',       label: 'Fitness',         emoji: '💪' },
  { id: 'linkedin',      label: 'LinkedIn',        emoji: '🔗', isWeekly: true },
]

/**
 * Given a day log and the schedule blocks for that day, determine
 * whether each streak category was satisfied, neutral (not scheduled),
 * or broken (scheduled but missed).
 *
 * Returns: { [categoryId]: 'done' | 'missed' | 'neutral' | 'event' }
 */
export function evaluateDayStreaks(log, blocks, batch) {
  if (!log && !blocks) return {}

  const result = {}

  // Event day → all categories neutral (frozen)
  if (log?.isEventDay) {
    STREAK_CATEGORIES.forEach(c => { result[c.id] = 'event' })
    return result
  }

  const checked = log?.checkedBlocks || {}
  const prep    = log?.internshipPrep || {}
  const fitness = log?.fitness

  // Study: at least one study block checked
  const hasStudyBlocks = blocks.some(b => b.type === 'study' && b.tracked)
  if (hasStudyBlocks) {
    const studyChecked = blocks.some(b => b.type === 'study' && b.tracked && checked[b.id]?.checked)
    result.study = studyChecked ? 'done' : 'missed'
  } else {
    result.study = 'neutral'
  }

  // Internship prep sub-items: each is independent
  const hasPrepBlock = blocks.some(b => b.type === 'internship_prep' && b.tracked)
  if (hasPrepBlock) {
    result.python        = prep.python        ? 'done' : 'missed'
    result.project       = prep.project       ? 'done' : 'missed'
    result.git           = prep.git           ? 'done' : 'missed'
    result.placementPrep = prep.placementPrep ? 'done' : 'missed'
  } else {
    result.python = result.project = result.git = result.placementPrep = 'neutral'
  }

  // Fitness: has a fitness block today?
  const hasFitnessBlock = blocks.some(b => b.type === 'fitness' && b.tracked)
  if (hasFitnessBlock) {
    result.fitness = fitness ? 'done' : 'missed'
  } else {
    result.fitness = 'neutral'
  }

  // LinkedIn is weekly, evaluated separately
  result.linkedin = 'neutral'

  return result
}

/**
 * Calculate current streak for a single category from a map of day results.
 * dayResults: { [dateKey]: { [categoryId]: 'done'|'missed'|'neutral'|'event' } }
 * Ordered newest-first.
 */
export function calculateStreak(dayResults, categoryId, sortedDateKeys) {
  let streak = 0
  for (const key of sortedDateKeys) {
    const val = dayResults[key]?.[categoryId]
    if (!val || val === 'neutral' || val === 'event') continue // skip non-scheduled days
    if (val === 'done') { streak++ }
    else break // 'missed' breaks the streak
  }
  return streak
}

/**
 * Calculate LinkedIn weekly streak from week logs.
 * weekResults: { [weekKey]: { linkedinDone: bool } }
 * sortedWeekKeys: newest first.
 */
export function calculateLinkedinStreak(weekResults, sortedWeekKeys) {
  let streak = 0
  for (const key of sortedWeekKeys) {
    const done = weekResults[key]?.linkedinDone
    if (done) { streak++ }
    else if (done === undefined || done === null) continue // no data = skip
    else break
  }
  return streak
}

/**
 * Calculate completion percentage for a week (Mon-Sat).
 * tracked blocks checked / total tracked blocks scheduled (excl. absorbed/event).
 */
export function weekCompletion(dayLogsMap, batch, dateKeys) {
  let totalDone  = 0
  let totalSched = 0

  for (const key of dateKeys) {
    const date   = fromDateKey(key)
    const { blocks } = getScheduleForDate(date, batch)
    const log    = dayLogsMap[key]
    const checked = log?.checkedBlocks || {}
    const isEvent = log?.isEventDay || false

    if (isEvent) continue

    blocks.forEach(b => {
      if (!b.tracked) return
      totalSched++
      if (checked[b.id]?.checked) totalDone++
    })
  }

  return totalSched === 0 ? null : Math.round((totalDone / totalSched) * 100)
}
