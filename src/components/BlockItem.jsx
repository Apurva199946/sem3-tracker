import { BLOCK_STATE } from '../utils/blockUtils'
import { timeToDisplay } from '../utils/dateUtils'
import { SUBJECT_COLOURS, BLOCK_COLOURS } from '../data/schedule'

function getAccentColour(block) {
  if (block.subject && SUBJECT_COLOURS[block.subject]) return SUBJECT_COLOURS[block.subject]
  return BLOCK_COLOURS[block.type] || '#334155'
}

const STATE_LABELS = {
  [BLOCK_STATE.DONE]:     'done',
  [BLOCK_STATE.MISSED]:   'missed',
  [BLOCK_STATE.ACTIVE]:   'now',
  [BLOCK_STATE.FUTURE]:   '',
  [BLOCK_STATE.ABSORBED]: 'absorbed',
}

export default function BlockItem({ block, onCheck, onFitness, fitness }) {
  const { state, type, label, effectiveStart, effectiveEnd } = block
  const colour  = getAccentColour(block)
  const isFixed = state === BLOCK_STATE.NOT_TRACKED
  const isFitness = type === 'fitness'
  const isChecked = state === BLOCK_STATE.DONE

  // Don't render dinner/sleep/pure break blocks that are empty context
  if (isFixed && (type === 'break' || type === 'admin') && state !== BLOCK_STATE.ACTIVE) {
    // Still render commute blocks as context
    if (type !== 'commute' && type !== 'break') return null
  }

  return (
    <div
      className={`block-item state-${state} ${isFixed ? 'state-not_tracked' : ''} ${type === 'college' ? 'college-block' : ''}`}
      style={{ '--accent': colour }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: isFixed ? 'transparent' : colour,
        opacity: state === BLOCK_STATE.MISSED ? 0.4 : state === BLOCK_STATE.DONE ? 0.8 : 1,
        borderRadius: '0 0 0 0',
      }} />

      <div className="block-time" style={{ paddingLeft: 8 }}>
        {timeToDisplay(effectiveStart)}
      </div>

      <div className="block-label-wrap">
        <div className="block-label">{label}</div>
        {STATE_LABELS[state] && (
          <div className="block-state-label">{STATE_LABELS[state]}</div>
        )}
      </div>

      {/* Actions for tracked blocks */}
      {!isFixed && !isFitness && (
        <div>
          {(state === BLOCK_STATE.ACTIVE || state === BLOCK_STATE.FUTURE) && (
            <button
              className={`check-btn ${isChecked ? 'done' : state}`}
              onClick={() => onCheck(block.id, true)}
            >
              {isChecked ? '✓' : 'Done'}
            </button>
          )}
          {state === BLOCK_STATE.DONE && (
            <span style={{ fontSize: 18 }}>✅</span>
          )}
          {state === BLOCK_STATE.MISSED && (
            <span style={{ fontSize: 18 }}>❌</span>
          )}
        </div>
      )}

      {isFitness && (state === BLOCK_STATE.ACTIVE || state === BLOCK_STATE.FUTURE || state === BLOCK_STATE.DONE) && (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={`fitness-btn ${fitness === 'full' ? 'selected-full' : ''}`}
            style={{ padding: '5px 8px', fontSize: 11 }}
            onClick={() => onFitness('full')}
          >💪</button>
          <button
            className={`fitness-btn ${fitness === 'minimum' ? 'selected-min' : ''}`}
            style={{ padding: '5px 8px', fontSize: 11 }}
            onClick={() => onFitness('minimum')}
          >⚡</button>
        </div>
      )}
      {isFitness && state === BLOCK_STATE.MISSED && (
        <span style={{ fontSize: 18 }}>❌</span>
      )}
    </div>
  )
}
