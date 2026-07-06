import { useState } from 'react'
import { SUBJECTS } from '../data/schedule'

function daysUntil(dueDate) {
  if (!dueDate) return null
  const due = dueDate?.toMillis ? dueDate.toMillis() : Number(dueDate)
  const diff = due - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDue(dueDate) {
  if (!dueDate) return ''
  const due = dueDate?.toMillis ? dueDate.toMillis() : Number(dueDate)
  const d = new Date(due)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

function AddModal({ onAdd, onClose }) {
  const [title,   setTitle]   = useState('')
  const [subject, setSubject] = useState('IMLT')
  const [due,     setDue]     = useState('')
  const [notes,   setNotes]   = useState('')

  const submit = () => {
    if (!title.trim()) return
    onAdd({
      title: title.trim(),
      subject,
      dueDate: due ? new Date(due).getTime() : null,
      notes: notes.trim(),
      status: 'pending',
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Add Assignment</div>

        <div className="form-field">
          <label className="form-label">Title</label>
          <input
            className="form-input"
            placeholder="e.g. Test 1, Research paper draft…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label">Subject</label>
            <select
              className="form-select"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            >
              {SUBJECTS.map(s => (
                <option key={s.code} value={s.code}>{s.code} — {s.label.split(' ').slice(0,2).join(' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Due date</label>
            <input
              className="form-input"
              type="date"
              value={due}
              onChange={e => setDue(e.target.value)}
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Notes (optional)</label>
          <input
            className="form-input"
            placeholder="Weightage, details…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button className="submit-btn" onClick={submit} disabled={!title.trim()} style={{ opacity: title.trim() ? 1 : 0.5 }}>
          Add Assignment
        </button>
        <button className="cancel-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export default function AssignmentsView({ data }) {
  const { assignments, createAssignment, editAssignment, removeAssignment } = data
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter]  = useState('pending') // 'pending' | 'done'

  const filtered = assignments.filter(a => a.status === filter)

  // Group by subject
  const bySubject = {}
  for (const a of filtered) {
    const key = a.subject || 'OTHER'
    if (!bySubject[key]) bySubject[key] = []
    bySubject[key].push(a)
  }

  // Sort each subject's assignments by due date
  for (const key in bySubject) {
    bySubject[key].sort((a, b) => {
      const da = a.dueDate?.toMillis ? a.dueDate.toMillis() : a.dueDate || Infinity
      const db = b.dueDate?.toMillis ? b.dueDate.toMillis() : b.dueDate || Infinity
      return da - db
    })
  }

  const subjectOrder = SUBJECTS.map(s => s.code).filter(c => bySubject[c])

  return (
    <>
      <div className="day-header" style={{ marginBottom: 16 }}>
        <div className="day-name" style={{ fontSize: 22 }}>Assignments</div>
        <button
          style={{ fontSize: 22, color: 'var(--col-prep)' }}
          onClick={() => setShowAdd(true)}
        >+</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['pending', 'done'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              background: filter === f ? 'var(--col-prep)' : 'var(--bg-elevated)',
              color:      filter === f ? 'white' : 'var(--text-muted)',
              border:     filter === f ? 'none' : '1px solid var(--border)',
              transition: 'all 0.15s',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>
            {filter === 'pending' ? '🎉' : '📂'}
          </div>
          <div style={{ fontSize: 14 }}>
            {filter === 'pending' ? 'No pending assignments' : 'No completed assignments yet'}
          </div>
        </div>
      )}

      {subjectOrder.map(code => {
        const subj = SUBJECTS.find(s => s.code === code)
        const items = bySubject[code]
        return (
          <div key={code} className="assign-section">
            <div className="assign-section-header">
              <div className="assign-subject-dot" style={{ background: subj?.colour || '#6B7280' }} />
              <div className="assign-subject-name">{code}</div>
              <div className="assign-count">{items.length}</div>
            </div>

            {items.map(a => {
              const days  = daysUntil(a.dueDate)
              const dueTxt = formatDue(a.dueDate)
              const urgent = days !== null && days <= 3 && a.status !== 'done'
              return (
                <div key={a.id} className={`assign-item ${a.status === 'done' ? 'done-item' : ''}`}>
                  <button
                    className={`assign-check-btn ${a.status === 'done' ? 'done' : ''}`}
                    onClick={() => editAssignment(a.id, {
                      status: a.status === 'done' ? 'pending' : 'done',
                      completedAt: a.status === 'done' ? null : Date.now(),
                    })}
                  >
                    {a.status === 'done' && '✓'}
                  </button>

                  <div className="assign-info">
                    <div className="assign-title">{a.title}</div>
                    {dueTxt && (
                      <div className={`assign-due ${urgent ? 'urgent' : ''}`}>
                        Due {dueTxt}
                        {days !== null && a.status !== 'done' && (
                          <span> · {days === 0 ? 'today' : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}</span>
                        )}
                      </div>
                    )}
                    {a.notes && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.notes}</div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${a.title}"?`)) removeAssignment(a.id)
                    }}
                    style={{ fontSize: 16, color: 'var(--text-muted)', padding: '4px 8px', flexShrink: 0 }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )
      })}

      <button className="add-assign-btn" onClick={() => setShowAdd(true)}>
        + Add assignment
      </button>

      {showAdd && (
        <AddModal
          onAdd={createAssignment}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  )
}
