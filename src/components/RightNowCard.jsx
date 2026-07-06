import { useEffect, useState } from 'react'
import { BLOCK_STATE } from '../utils/blockUtils'
import { timeToMins, blockProgress, nowMins, timeToDisplay } from '../utils/dateUtils'
import { SUBJECT_COLOURS, BLOCK_COLOURS } from '../data/schedule'

function getBlockColour(block) {
  if (block.subject && SUBJECT_COLOURS[block.subject]) return SUBJECT_COLOURS[block.subject]
  return BLOCK_COLOURS[block.type] || '#334155'
}

// What to display when the "Staying Back" window is active
function StayingBackCard({ remainingMins }) {
  const hrs  = Math.floor(remainingMins / 60)
  const mins = remainingMins % 60
  const display = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`

  return (
    <div className="rn-card rn-staying-back">
      <div className="rn-inner">
        <div className="rn-accent-bar" style={{ background: '#F59E0B' }} />
        <div className="rn-content">
          <div className="rn-eyebrow">Right Now</div>
          <div className="rn-label">📍 Staying Back</div>
          <div className="rn-staying-remaining">{display}</div>
          <div className="rn-staying-label">remaining at college</div>
        </div>
      </div>
    </div>
  )
}

// Between-block card (gap between scheduled items)
function BetweenCard({ nextBlock }) {
  if (!nextBlock) {
    return (
      <div className="rn-card">
        <div className="rn-inner">
          <div className="rn-accent-bar" style={{ background: '#334155' }} />
          <div className="rn-content">
            <div className="rn-eyebrow">Right Now</div>
            <div className="rn-label">Free time</div>
            <div className="rn-time">Nothing scheduled</div>
          </div>
        </div>
      </div>
    )
  }
  const colour = getBlockColour(nextBlock)
  const minsUntil = timeToMins(nextBlock.effectiveStart) - nowMins()
  const display = minsUntil <= 0 ? 'Starting now'
    : minsUntil < 60 ? `In ${minsUntil}m`
    : `In ${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m`

  return (
    <div className="rn-card">
      <div className="rn-inner">
        <div className="rn-accent-bar" style={{ background: colour }} />
        <div className="rn-content">
          <div className="rn-eyebrow">Up Next · {timeToDisplay(nextBlock.effectiveStart)}</div>
          <div className="rn-label" style={{ color: colour }}>{nextBlock.label}</div>
          <div className="rn-time">{display}</div>
        </div>
      </div>
    </div>
  )
}

export default function RightNowCard({
  currentBlock,
  nextBlocks,
  stayingBack,
  onCheck,
  onFitness,
  checkedBlocks,
  fitness,
}) {
  const [tick, setTick] = useState(0)

  // Re-render every 30s to update progress bar
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  if (stayingBack?.active) {
    return <StayingBackCard remainingMins={stayingBack.remainingMins} />
  }

  if (!currentBlock) {
    const next = nextBlocks?.[0]
    return <BetweenCard nextBlock={next} />
  }

  const colour   = getBlockColour(currentBlock)
  const startM   = timeToMins(currentBlock.effectiveStart)
  const endM     = timeToMins(currentBlock.effectiveEnd)
  const progress = blockProgress(startM, endM, nowMins())
  const isTracked = currentBlock.tracked
  const isChecked = !!checkedBlocks?.[currentBlock.id]?.checked

  // Fitness block special handling
  const isFitness = currentBlock.type === 'fitness'
  const currentFitness = fitness

  return (
    <div className="rn-card">
      <div className="rn-inner">
        <div className="rn-accent-bar" style={{ background: colour }} />
        <div className="rn-content">
          <div className="rn-eyebrow">
            Right Now · {timeToDisplay(currentBlock.effectiveStart)}–{timeToDisplay(currentBlock.effectiveEnd)}
          </div>
          <div className="rn-label" style={{ color: isTracked ? colour : 'var(--text-primary)' }}>
            {currentBlock.label}
          </div>

          <div className="rn-progress-track">
            <div
              className="rn-progress-fill"
              style={{ width: `${Math.round(progress * 100)}%`, background: colour }}
            />
          </div>

          {isTracked && !isFitness && (
            <div className="rn-actions">
              <button
                className={`check-btn ${isChecked ? 'done' : 'active'}`}
                onClick={() => onCheck(currentBlock.id, !isChecked)}
              >
                {isChecked ? '✓ Done' : 'Mark done'}
              </button>
            </div>
          )}

          {isFitness && (
            <div className="rn-actions">
              <button
                className={`fitness-btn ${currentFitness === 'full' ? 'selected-full' : ''}`}
                onClick={() => onFitness('full')}
              >
                💪 Full
              </button>
              <button
                className={`fitness-btn ${currentFitness === 'minimum' ? 'selected-min' : ''}`}
                onClick={() => onFitness('minimum')}
              >
                ⚡ Min mode
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
