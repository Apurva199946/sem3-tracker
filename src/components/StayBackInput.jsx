import { useState, useEffect } from 'react'

export default function StayBackInput({ value, note, onChange }) {
  const [mins, setMins] = useState(String(value || ''))
  const [localNote, setLocalNote] = useState(note || '')

  // Sync external value changes (e.g. loaded from Firestore)
  useEffect(() => { setMins(String(value || '')) }, [value])
  useEffect(() => { setLocalNote(note || '') }, [note])

  const commit = () => {
    const parsed = parseInt(mins, 10)
    onChange(isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, 300)), localNote)
  }

  return (
    <div className="stayback-card">
      <div className="stayback-header">
        <span className="stayback-title">Stayed back</span>
        {value > 0 && (
          <span style={{ fontSize: 11, color: 'var(--col-FA)', fontFamily: 'JetBrains Mono, monospace' }}>
            +{value} min shift active
          </span>
        )}
      </div>
      <div className="stayback-row">
        <div className="stayback-mins-wrap">
          <input
            className="stayback-mins-input"
            type="number"
            min={0}
            max={300}
            placeholder="0"
            value={mins}
            onChange={e => setMins(e.target.value)}
            onBlur={commit}
            inputMode="numeric"
          />
          <span className="stayback-mins-label">min</span>
        </div>
        <input
          className="stayback-note-input"
          type="text"
          placeholder="Why stayed back? (optional)"
          value={localNote}
          onChange={e => setLocalNote(e.target.value)}
          onBlur={commit}
        />
      </div>
    </div>
  )
}
