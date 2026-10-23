export const TABS = [
  { id: 'detection', label: 'Detection', icon: '🔍' },
  { id: 'prevention', label: 'Prevention', icon: '🛡️' },
  { id: 'bankers', label: "Banker's", icon: '🏦' },
  { id: 'game', label: 'Game', icon: '🎮' },
  { id: 'history', label: 'History', icon: '🕘' },
  { id: 'theory', label: 'Theory', icon: '📚' },
  { id: 'quiz', label: 'Quiz', icon: '📝' },
  { id: 'exams', label: 'Exams', icon: '🎓' },
  { id: 'guide', label: 'Guide', icon: '🧭' },
  { id: 'references', label: 'References', icon: '🔗' },
  { id: 'innovation', label: 'Innovation', icon: '💡' },
  { id: 'about', label: 'Developed By', icon: '👥' },
];

export default function TopBar({ tab, onTab, theme, onTheme }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo" aria-hidden="true">🔒</span>
        <div>
          Deadlock Game
          <small>DBMS · detection · prevention · avoidance</small>
        </div>
      </div>
      <nav className="tabs" role="tablist" aria-label="Modes">
        {TABS.map((t) => (
          <button key={t.id} role="tab" className="tab" aria-selected={tab === t.id} onClick={() => onTab(t.id)} id={`tab-${t.id}`}>
            <span className="tab-icon" aria-hidden="true">{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>
      <div className="topbar-actions">
        <button className="btn btn-icon" onClick={onTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
