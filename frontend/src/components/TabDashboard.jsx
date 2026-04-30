import { TrendingUp, AlertTriangle, ShieldCheck, BarChart3 } from 'lucide-react';

export default function TabDashboard({ allData, assetSummaries, setSelectedAsset, setActiveTab }) {
  // Compute global signal distribution
  const totalBuy = assetSummaries.reduce((s, a) => s + a.buy_count, 0);
  const totalHold = assetSummaries.reduce((s, a) => s + a.hold_count, 0);
  const totalSell = assetSummaries.reduce((s, a) => s + a.sell_count, 0);
  const totalRecords = totalBuy + totalHold + totalSell;
  const totalAssets = assetSummaries.length;
  const highRiskAssets = assetSummaries.filter(a => a.is_high_risk).length;

  const handleCardClick = (assetName) => {
    setSelectedAsset(assetName);
    setActiveTab('signals');
  };

  return (
    <div className="tab-content">
      <div className="page-header">
        <h1>Portfolio Dashboard</h1>
        <p>Overview of all tracked assets with ML-generated trading signals</p>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total Assets</span>
          <span className="stat-value">{totalAssets}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Records</span>
          <span className="stat-value">{totalRecords.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Buy Signals</span>
          <span className="stat-value text-buy">{totalBuy.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Hold Signals</span>
          <span className="stat-value" style={{ color: 'var(--signal-hold)' }}>{totalHold.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Sell Signals</span>
          <span className="stat-value text-sell">{totalSell.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">High Risk</span>
          <span className="stat-value" style={{ color: highRiskAssets > 0 ? 'var(--risk-high)' : 'var(--risk-normal)' }}>
            {highRiskAssets} / {totalAssets}
          </span>
        </div>
      </div>

      {/* Signal Distribution */}
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div className="glass-card-header">
          <BarChart3 size={14} /> Global Signal Distribution
        </div>
        <div className="signal-dist">
          <div className="signal-dist-item">
            <div className="signal-dist-count buy">{totalBuy.toLocaleString()}</div>
            <div className="signal-dist-label">Buy</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {totalRecords > 0 ? ((totalBuy / totalRecords) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="signal-dist-item">
            <div className="signal-dist-count hold">{totalHold.toLocaleString()}</div>
            <div className="signal-dist-label">Hold</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {totalRecords > 0 ? ((totalHold / totalRecords) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div className="signal-dist-item">
            <div className="signal-dist-count sell">{totalSell.toLocaleString()}</div>
            <div className="signal-dist-label">Sell</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {totalRecords > 0 ? ((totalSell / totalRecords) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Asset Cards */}
      <div className="glass-card-header" style={{ marginBottom: 12, paddingLeft: 4 }}>
        <TrendingUp size={14} /> Asset Overview — Click to Explore
      </div>
      <div className="asset-grid">
        {assetSummaries.map(asset => (
          <div key={asset.asset_name} className="asset-card" onClick={() => handleCardClick(asset.asset_name)}>
            <div className="asset-card-header">
              <span className="asset-card-name">{asset.asset_name}</span>
              <span className="asset-card-type">{asset.asset_type}</span>
            </div>
            <div className="asset-card-price">₹{asset.latest_close?.toLocaleString()}</div>
            <div className="asset-card-row">
              <span>Signal</span>
              <span className={`signal-badge ${asset.latest_signal?.toLowerCase()}`}>
                {asset.latest_signal}
              </span>
            </div>
            <div className="asset-card-row">
              <span>Risk</span>
              <span className={`risk-badge ${asset.is_high_risk ? 'high' : 'normal'}`}>
                {asset.is_high_risk ? <><AlertTriangle size={12} /> High Risk</> : <><ShieldCheck size={12} /> Normal</>}
              </span>
            </div>
            <div className="asset-card-row">
              <span>Avg Volume</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {asset.avg_volume?.toLocaleString()}
              </span>
            </div>
            <div className="asset-card-row">
              <span>Price Range</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                ₹{asset.price_min} — ₹{asset.price_max}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
