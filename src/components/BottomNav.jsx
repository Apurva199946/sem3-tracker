const TABS = [
  { id: 'today',       icon: '⚡', label: 'Today'   },
  { id: 'week',        icon: '📅', label: 'Week'    },
  { id: 'stats',       icon: '🔥', label: 'Stats'   },
  { id: 'assignments', icon: '📋', label: 'Tasks'   },
  { id: 'settings',    icon: '⚙️', label: 'Settings'},
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`nav-btn ${active === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="nav-icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
