import { timeToMins, minsToTime, nowMins, isBlockActive } from './dateUtils'

// Block state constants
export const BLOCK_STATE = {
  FUTURE:        'future',         // Time hasn't arrived
  ACTIVE:        'active',         // Currently in this block's window
  DONE:          'done',           // Tracked, checked
  MISSED:        'missed',         // Tracked, time passed, not checked (IMMUTABLE)
  ABSORBED:      'absorbed',       // Shifted past dinner anchor by stay-back
  STAYING_BACK:  'staying_back',   // Synthetic: user is still at college
  NOT_TRACKED:   'not_tracked',    // Fixed block (no checkbox)
}

/**
 * Compute the effective (shifted) blocks for a day given extra stay-back minutes.
 *
 * Rules:
 * 1. Fixed blocks (not tracked) never shift — they are anchored to real events.
 * 2. Tracked personal blocks shift by +extraStayBackMins.
 * 3. Blocks shifted past dinnerAnchor become ABSORBED.
 * 4. The "staying back" window is [lastClassEnd, nominalDeparture + extraStayBack].
 *
 * Returns: array of blocks with effective start/end times (strings) + state.
 */
export function computeBlockStates(blocks, config, log, extraStayBackMins = 0) {
  if (!blocks || blocks.length === 0) return []

  const current = nowMins()
  const dinnerMins = config ? timeToMins(config.dinnerAnchor) : 21 * 60
  const lastClassEndMins  = config?.lastClassEnd  ? timeToMins(config.lastClassEnd)  : null
  const nominalDepartureMins = config?.nominalDeparture ? timeToMins(config.nominalDeparture) : null

  const stayBackWindowEnd = nominalDepartureMins !== null
    ? nominalDepartureMins + extraStayBackMins
    : null

  const checkedBlocks = log?.checkedBlocks || {}
  const isEventDay    = log?.isEventDay || false

  return blocks.map(block => {
    const originalStartMins = timeToMins(block.start)
    const originalEndMins   = timeToMins(block.end)

    // Determine effective times
    let effectiveStart = originalStartMins
    let effectiveEnd   = originalEndMins

    if (block.tracked && extraStayBackMins > 0) {
      effectiveStart += extraStayBackMins
      effectiveEnd   += extraStayBackMins
    }

    const effectiveStartStr = minsToTime(effectiveStart)
    const effectiveEndStr   = minsToTime(effectiveEnd)

    // Determine state
    let state

    if (!block.tracked) {
      // Check if this block falls within the "staying back" window
      if (
        stayBackWindowEnd !== null &&
        lastClassEndMins !== null &&
        current >= lastClassEndMins &&
        current < stayBackWindowEnd &&
        originalStartMins >= lastClassEndMins &&
        originalStartMins < nominalDepartureMins  // it's in the nominal stay-back slot
      ) {
        state = BLOCK_STATE.STAYING_BACK
      } else {
        state = BLOCK_STATE.NOT_TRACKED
      }
    } else if (isEventDay) {
      // Event days: all tracked blocks are neutral (absorbed)
      state = BLOCK_STATE.ABSORBED
    } else if (effectiveEnd > dinnerMins) {
      // Shifted past dinner anchor
      state = BLOCK_STATE.ABSORBED
    } else {
      const isChecked = !!checkedBlocks[block.id]?.checked
      const blockNowActive  = current >= effectiveStart && current < effectiveEnd
      const blockIsPast     = current >= effectiveEnd

      if (isChecked) {
        state = BLOCK_STATE.DONE
      } else if (blockNowActive) {
        state = BLOCK_STATE.ACTIVE
      } else if (blockIsPast) {
        // IMMUTABLE: past unchecked block is MISSED regardless of stay-back entered late
        state = BLOCK_STATE.MISSED
      } else {
        state = BLOCK_STATE.FUTURE
      }
    }

    return {
      ...block,
      effectiveStart: effectiveStartStr,
      effectiveEnd:   effectiveEndStr,
      state,
    }
  })
}

/**
 * Is the "Staying Back" synthetic state currently active?
 * Returns { active: bool, remainingMins: number }
 */
export function stayingBackStatus(config, extraStayBackMins) {
  if (!config?.lastClassEnd || !config?.nominalDeparture) {
    return { active: false, remainingMins: 0 }
  }
  const current         = nowMins()
  const lastClassEnd    = timeToMins(config.lastClassEnd)
  const stayBackEnd     = timeToMins(config.nominalDeparture) + extraStayBackMins
  const active          = current >= lastClassEnd && current < stayBackEnd
  const remainingMins   = active ? stayBackEnd - current : 0
  return { active, remainingMins }
}

/**
 * Finds the current and next tracked blocks from a computed block list.
 * Used by the RIGHT NOW card.
 */
export function findCurrentAndNext(computedBlocks) {
  const current = nowMins()
  let currentBlock = null
  let nextBlocks   = []

  for (let i = 0; i < computedBlocks.length; i++) {
    const b = computedBlocks[i]
    const s = timeToMins(b.effectiveStart)
    const e = timeToMins(b.effectiveEnd)

    if (current >= s && current < e) {
      currentBlock = b
      // Collect next blocks (skip fixed context blocks that aren't interesting)
      nextBlocks = computedBlocks.slice(i + 1).filter(
        nb => nb.state !== BLOCK_STATE.NOT_TRACKED || nb.type === 'college' || nb.type === 'commute'
      ).slice(0, 3)
      break
    }
  }

  // If no current block found (between blocks), find next upcoming
  if (!currentBlock) {
    const upcoming = computedBlocks.find(b => timeToMins(b.effectiveStart) > current)
    if (upcoming) {
      nextBlocks = computedBlocks.slice(computedBlocks.indexOf(upcoming) + 1).slice(0, 3)
    }
  }

  return { currentBlock, nextBlocks }
}

/**
 * Returns completion fraction for tracked blocks in a day: [done, total]
 * Absorbed and Event Day blocks are excluded from denominator.
 */
export function dayCompletion(computedBlocks) {
  const relevant = computedBlocks.filter(b =>
    b.tracked &&
    b.state !== BLOCK_STATE.ABSORBED &&
    b.state !== BLOCK_STATE.STAYING_BACK
  )
  const done = relevant.filter(b => b.state === BLOCK_STATE.DONE).length
  return { done, total: relevant.length }
}

/**
 * Internship prep sub-items per phase.
 */
export function getPrepItems(phase) {
  const base = [
    { id: 'python',        label: 'Python'           },
    { id: 'project',       label: 'Project'          },
    { id: 'git',           label: 'Git'              },
    { id: 'placementPrep', label: 'Placement Prep'   },
  ]
  if (phase === 'phase1') {
    return [{ id: 'wfhDeliverables', label: 'WFH Deliverables' }, ...base]
  }
  return base
}
