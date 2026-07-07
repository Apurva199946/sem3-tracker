import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, signInWithGoogle } from './firebase'
import { useData } from './hooks/useData'
import BottomNav from './components/BottomNav'
import TodayView from './views/Today'
import WeekView from './views/Week'
import StatsView from './views/Stats'
import AssignmentsView from './views/Assignments'
import SettingsView from './views/Settings'
import FirstLaunch from './components/FirstLaunch'

function SignInScreen({ installPrompt, onInstall }) {
  const [loading, setLoading] = useState(false)
  const handleSignIn = async () => {
    setLoading(true)
    try { await signInWithGoogle() } catch { setLoading(false) }
  }
  return (
    <div className="signin-screen">
      <div className="signin-logo">⚡</div>
      <h1 className="signin-title">Sem III Tracker</h1>
      <p className="signin-sub">Your daily command centre for the semester.<br/>Sign in to keep your data across devices.</p>
      <button className="google-btn" onClick={handleSignIn} disabled={loading}>
        <span className="google-icon">G</span>
        {loading ? 'Signing in…' : 'Sign in with Google'}
      </button>
      {installPrompt && (
        <button
          onClick={onInstall}
          style={{
            marginTop: 16,
            padding: '12px 24px',
            background: 'rgba(212,102,255,0.15)',
            border: '1.5px solid rgba(212,102,255,0.5)',
            borderRadius: 12,
            color: '#D466FF',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 0 16px rgba(212,102,255,0.25)',
          }}
        >
          ⚡ Install App to Home Screen
        </button>
      )}
      {!installPrompt && (
        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260 }}>
          After signing in, use Chrome menu → Add to Home Screen to install.
        </p>
      )}
    </div>
  )
}

function MainApp({ user }) {
  const [activeTab, setActiveTab] = useState('today')
  const data = useData(user)
  if (!data.settingsLoaded) return <div className="loading">Loading…</div>
  if (!data.settings?.batch) return <FirstLaunch onSelect={(batch) => data.updateSettings({ batch })} />
  const viewProps = { user, data, setActiveTab }
  return (
    <div className="app-shell">
      <div className="view-scroll">
        {activeTab === 'today'       && <TodayView       {...viewProps} />}
        {activeTab === 'week'        && <WeekView        {...viewProps} />}
        {activeTab === 'stats'       && <StatsView       {...viewProps} />}
        {activeTab === 'assignments' && <AssignmentsView {...viewProps} />}
        {activeTab === 'settings'    && <SettingsView    {...viewProps} />}
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default function App() {
  const [user, setUser]             = useState(undefined)
  const [installPrompt, setInstall] = useState(null)

  useEffect(() => onAuthStateChanged(auth, u => setUser(u || null)), [])

  useEffect(() => {
    // Check for prompt captured early by inline script in index.html
    if (window.__pwaInstallPrompt) {
      setInstall(window.__pwaInstallPrompt)
    }
    // Also listen for future fires (e.g. after service worker update)
    const handler = (e) => {
      e.preventDefault()
      setInstall(e)
      window.__pwaInstallPrompt = e
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstall(null)
  }

  if (user === undefined) return <div className="loading">Loading…</div>
  if (!user) return <SignInScreen installPrompt={installPrompt} onInstall={handleInstall} />
  return <MainApp user={user} />
}
