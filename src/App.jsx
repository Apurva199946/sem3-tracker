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

function SignInScreen() {
  const [loading, setLoading] = useState(false)
  const handleSignIn = async () => {
    setLoading(true)
    try { await signInWithGoogle() } catch { setLoading(false) }
  }
  return (
    <div className="signin-screen">
      <div className="signin-logo">🎯</div>
      <h1 className="signin-title">Sem III Tracker</h1>
      <p className="signin-sub">Your daily command centre for the semester.<br/>Sign in to keep your data across devices.</p>
      <button className="google-btn" onClick={handleSignIn} disabled={loading}>
        <span className="google-icon">G</span>
        {loading ? 'Signing in…' : 'Sign in with Google'}
      </button>
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
  const [user, setUser] = useState(undefined)
  useEffect(() => onAuthStateChanged(auth, u => setUser(u || null)), [])
  if (user === undefined) return <div className="loading">Loading…</div>
  if (!user) return <SignInScreen />
  return <MainApp user={user} />
}
