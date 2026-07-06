import { getPrepItems } from '../utils/blockUtils'
import { timeToDisplay } from '../utils/dateUtils'

export default function InternshipPrepBlock({ block, phase, prepState, onToggle }) {
  const items = getPrepItems(phase)
  const anyChecked = items.some(item => prepState?.[item.id])

  return (
    <div className="prep-block">
      <div className="prep-header">
        <div
          className="prep-check"
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: anyChecked ? 'var(--col-prep)' : 'var(--border-light)',
            flexShrink: 0,
          }}
        />
        <div className="prep-title">Internship Prep</div>
        <div className="prep-time">
          {timeToDisplay(block.effectiveStart)}–{timeToDisplay(block.effectiveEnd)}
        </div>
      </div>

      <div className="prep-items">
        {items.map(item => {
          const checked = !!prepState?.[item.id]
          return (
            <button
              key={item.id}
              className={`prep-item ${checked ? 'checked' : ''}`}
              onClick={() => onToggle(item.id, !checked)}
            >
              <div className="prep-check">
                {checked && '✓'}
              </div>
              <span className="prep-item-label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
