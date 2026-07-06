import { signOutUser } from '../firebase'
import { getCurrentPhase } from '../utils/dateUtils'

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-wrap">
      <input type="checkbox" className="toggle-input" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  )
}

export default function SettingsView({ user, data }) {
  const { settings, updateSettings } = data
  if (!settings) return <div className="loading">Loading…</div>

  const phase = getCurrentPhase(settings.phaseManualOverride)

  return (
    <>
      <div className="day-header" style={{ marginBottom: 24 }}>
        <div className="day-name" style={{ fontSize: 22 }}>Settings</div>
      </div>

      {/* User */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Signed in as</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.displayName || user?.email}</div>
      </div>

      {/* Schedule settings */}
      <div className="section-header"><span className="section-title">Schedule</span></div>
      <div className="card" style={{ padding: '0 16px', marginBottom: 20 }}>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">SC-VI Batch</div>
            <div className="setting-desc">Determines Tue vs Wed for SC-VI practical</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2].map(b => (
              <button
                key={b}
                onClick={() => updateSettings({ batch: b })}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: settings.batch === b ? 'var(--col-prep)' : 'var(--bg-elevated)',
                  color:      settings.batch === b ? 'white' : 'var(--text-muted)',
                  border:     settings.batch === b ? 'none' : '1px solid var(--border)',
                }}
              >
                B{b}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Tuesday outbound commute</div>
            <div className="setting-desc">What to do on the way home on Tuesdays</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['rest','review'].map(v => (
              <button
                key={v}
                onClick={() => updateSettings({ tuesdayOutbound: v })}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  background: settings.tuesdayOutbound === v ? 'var(--col-prep)' : 'var(--bg-elevated)',
                  color:      settings.tuesdayOutbound === v ? 'white' : 'var(--text-muted)',
                  border:     settings.tuesdayOutbound === v ? 'none' : '1px solid var(--border)',
                  textTransform: 'capitalize',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">DDA-III group active</div>
            <div className="setting-desc">Enable once your group is formed</div>
          </div>
          <Toggle
            checked={settings.ddaIIIActive}
            onChange={v => updateSettings({ ddaIIIActive: v })}
          />
        </div>
      </div>

      {/* Phase settings */}
      <div className="section-header"><span className="section-title">Internship phase</span></div>
      <div className="card" style={{ padding: '0 16px', marginBottom: 20 }}>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Current phase</div>
            <div className="setting-desc">
              Phase 1 (Jul): WFH deliverables checkbox visible<br />
              Phase 2 (Aug+): WFH deliverables removed
            </div>
          </div>
          <div className="setting-value">{phase === 'phase1' ? 'Phase 1' : 'Phase 2'}</div>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Manual phase override</div>
            <div className="setting-desc">
              Auto-switches to Phase 2 on Aug 1. Override if internship ends early.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { v: null,     label: 'Auto' },
              { v: 'phase1', label: 'P1'   },
              { v: 'phase2', label: 'P2'   },
            ].map(({ v, label }) => (
              <button
                key={String(v)}
                onClick={() => updateSettings({ phaseManualOverride: v })}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  background: settings.phaseManualOverride === v ? 'var(--col-prep)' : 'var(--bg-elevated)',
                  color:      settings.phaseManualOverride === v ? 'white' : 'var(--text-muted)',
                  border:     settings.phaseManualOverride === v ? 'none' : '1px solid var(--border)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={signOutUser}
        style={{
          width: '100%',
          padding: 14,
          borderRadius: 10,
          border: '1px solid var(--border)',
          color: 'var(--state-missed)',
          fontSize: 14,
          fontWeight: 600,
          marginTop: 8,
        }}
      >
        Sign out
      </button>

      <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
        Sem III Tracker · AY 2026–27
      </div>
    </>
  )
}
