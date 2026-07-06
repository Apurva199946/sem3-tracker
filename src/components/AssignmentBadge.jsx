export default function AssignmentBadge({ assignments, onNavigate }) {
  const today = Date.now()
  const urgent = assignments.filter(a => {
    if (a.status === 'done') return false
    const due = a.dueDate?.toMillis ? a.dueDate.toMillis() : a.dueDate
    return due && (due - today) <= 3 * 24 * 60 * 60 * 1000
  })

  if (urgent.length === 0) return null

  return (
    <button className="assignment-badge" onClick={() => onNavigate('assignments')}>
      <span className="badge-icon">⚠️</span>
      <span className="badge-text">
        {urgent.length} assignment{urgent.length > 1 ? 's' : ''} due within 3 days
      </span>
      <span className="badge-arrow">→</span>
    </button>
  )
}
