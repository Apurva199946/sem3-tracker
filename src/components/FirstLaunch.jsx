export default function FirstLaunch({ onSelect }) {
  return (
    <div className="launch-screen">
      <h1 className="launch-title">One quick thing</h1>
      <p className="launch-sub">Which SC-VI batch are you in?<br/>This determines your Tuesday and Wednesday schedule.</p>
      <p className="launch-question">SC-VI Practical</p>
      <div className="launch-options">
        <button className="launch-opt-btn" onClick={() => onSelect(1)}>
          Batch 1 — Tuesday
          <div className="launch-opt-desc">SC-VI on Tue 12–2 PM · LAB 8</div>
        </button>
        <button className="launch-opt-btn" onClick={() => onSelect(2)}>
          Batch 2 — Wednesday
          <div className="launch-opt-desc">SC-VI on Wed 12–2 PM · CR 927 Mithibai</div>
        </button>
      </div>
      <p className="text-muted text-sm mt-4">You can change this in Settings anytime.</p>
    </div>
  )
}
