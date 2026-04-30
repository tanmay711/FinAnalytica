import { LayoutDashboard, TrendingUp, BarChart3, ShieldAlert, Brain, Table2 } from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'signals', label: 'Trading Signals', icon: TrendingUp },
  { id: 'price', label: 'Price Analysis', icon: BarChart3 },
  { id: 'volatility', label: 'Volatility & Risk', icon: ShieldAlert },
  { id: 'model', label: 'Model Insights', icon: Brain },
  { id: 'explorer', label: 'Data Explorer', icon: Table2 },
];

export default function Sidebar({ activeTab, setActiveTab, assets, selectedAsset, setSelectedAsset, targetDate, setTargetDate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>FinAnalytica</h1>
        <p>Advanced Analytics Platform</p>
      </div>

      <nav className="sidebar-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <div
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="nav-icon" size={18} />
              <span>{tab.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-filters">
        <div className="filter-group">
          <label className="filter-label">Asset</label>
          <select
            className="filter-select"
            value={selectedAsset}
            onChange={e => setSelectedAsset(e.target.value)}
          >
            {assets.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Date Filter</label>
          <input
            className="filter-input"
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
          />
        </div>
        {targetDate && (
          <button
            style={{
              width: '100%', marginTop: 8, padding: '6px',
              background: 'var(--bg-hover)', border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', fontSize: 11
            }}
            onClick={() => setTargetDate('')}
          >
            Clear Date Filter
          </button>
        )}
      </div>
    </aside>
  );
}
