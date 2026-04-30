import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

const ASSET_COLORS = ['#7c5cfc', '#00d4ff', '#f59e0b', '#ec4899', '#10b981', '#3b82f6'];

export default function TabVolatility({ data, allData, selectedAsset, assetSummaries }) {
  // Downsample for chart
  const chartData = useMemo(() => {
    if (data.length <= 300) return data;
    const step = Math.ceil(data.length / 300);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  // Volatility stats
  const volStats = useMemo(() => {
    const vols = data.map(d => d.volatility_5d).filter(v => v != null);
    if (vols.length === 0) return null;
    const mean = vols.reduce((s, v) => s + v, 0) / vols.length;
    const sorted = [...vols].sort((a, b) => a - b);
    const p80 = sorted[Math.floor(sorted.length * 0.8)];
    return {
      min: Math.min(...vols).toFixed(4),
      max: Math.max(...vols).toFixed(4),
      avg: mean.toFixed(4),
      p80: p80.toFixed(4),
      highRiskCount: data.filter(d => d.is_high_risk).length,
      normalCount: data.filter(d => !d.is_high_risk).length,
    };
  }, [data]);

  // Cross-asset volatility comparison
  const assetVolComparison = useMemo(() => {
    return assetSummaries.map(a => ({
      asset: a.asset_name,
      avgVolatility: a.avg_volatility,
      highRiskPct: a.high_risk_pct,
    }));
  }, [assetSummaries]);

  // Risk distribution data
  const riskDistData = useMemo(() => {
    if (!volStats) return [];
    return [
      { name: 'Normal Risk', count: volStats.normalCount, fill: '#00e676' },
      { name: 'High Risk', count: volStats.highRiskCount, fill: '#ff5252' },
    ];
  }, [volStats]);

  if (data.length === 0) {
    return (
      <div className="tab-content">
        <div className="page-header"><h1>Volatility & Risk — {selectedAsset}</h1></div>
        <div className="empty-state"><p>No data available.</p></div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="page-header">
        <h1>Volatility & Risk — {selectedAsset}</h1>
        <p>5-day rolling volatility analysis and risk classification</p>
      </div>

      {/* Vol Stats */}
      {volStats && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label"><ShieldAlert size={14} /> Min Volatility</div>
            <div className="metric-value">{volStats.min}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Max Volatility</div>
            <div className="metric-value">{volStats.max}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Avg Volatility</div>
            <div className="metric-value">{volStats.avg}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">80th Percentile</div>
            <div className="metric-value">{volStats.p80}</div>
            <div className="metric-sub">Threshold for high risk</div>
          </div>
          <div className="metric-card">
            <div className="metric-label"><ShieldCheck size={14} /> Normal Risk</div>
            <div className="metric-value text-buy">{volStats.normalCount.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label"><AlertTriangle size={14} /> High Risk</div>
            <div className="metric-value text-sell">{volStats.highRiskCount.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Volatility Line Chart */}
      <div className="chart-container">
        <div className="chart-title">5-Day Rolling Volatility Over Time</div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                stroke="#555d75"
                tick={{ fontSize: 10 }}
                tickFormatter={val => {
                  const d = new Date(val);
                  return `${d.getMonth()+1}/${d.getDate()}`;
                }}
              />
              <YAxis stroke="#555d75" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1f2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 12
                }}
                labelFormatter={val => new Date(val).toLocaleString()}
              />
              <Line type="monotone" dataKey="volatility_5d" name="Volatility" stroke="#ec4899" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        {/* Risk Distribution */}
        <div className="chart-container">
          <div className="chart-title">Risk Classification Distribution</div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={riskDistData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#555d75" tick={{ fontSize: 11 }} />
                <YAxis stroke="#555d75" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1f2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12
                  }}
                />
                <Bar dataKey="count" name="Count" radius={[4,4,0,0]}>
                  {riskDistData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cross-asset Volatility Comparison */}
        <div className="chart-container">
          <div className="chart-title">Cross-Asset Volatility Comparison</div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={assetVolComparison} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="asset" stroke="#555d75" tick={{ fontSize: 10 }} />
                <YAxis stroke="#555d75" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1f2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12
                  }}
                />
                <Bar dataKey="avgVolatility" name="Avg Volatility" radius={[4,4,0,0]}>
                  {assetVolComparison.map((_, i) => (
                    <Cell key={i} fill={ASSET_COLORS[i % ASSET_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cross-asset risk table */}
      <div className="glass-card">
        <div className="glass-card-header"><ShieldAlert size={14} /> Risk Matrix — All Assets</div>
        <table className="model-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Avg Volatility</th>
              <th>High Risk %</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {assetSummaries.map(a => (
              <tr key={a.asset_name} style={a.asset_name === selectedAsset ? { background: 'var(--bg-hover)' } : {}}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.asset_name}</td>
                <td>{a.avg_volatility?.toFixed(4)}</td>
                <td>{a.high_risk_pct}%</td>
                <td>
                  <span className={`risk-badge ${a.high_risk_pct > 20 ? 'high' : 'normal'}`}>
                    {a.high_risk_pct > 20 ? 'Elevated' : 'Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
