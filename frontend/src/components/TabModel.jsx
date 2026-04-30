import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import { Brain } from 'lucide-react';

const ASSET_COLORS = ['#7c5cfc', '#00d4ff', '#f59e0b', '#ec4899', '#10b981', '#3b82f6'];

const FEATURE_LABELS = {
  'return_5min_pct': '5-Min Return %',
  'return_1d_pct': '1-Day Return %',
  'volatility_5d': '5-Day Volatility',
  'range_hl_pct': 'High-Low Range %',
  'gold_return_1d_pct': 'Gold 1-Day Return %',
  'mf_return_1d_pct': 'MF 1-Day Return %'
};

export default function TabModel({ selectedAsset, modelMetrics, featureImportances }) {
  // Feature importances for selected asset
  const assetImportances = useMemo(() => {
    return featureImportances
      .filter(f => f.asset_name === selectedAsset)
      .sort((a, b) => b.importance - a.importance);
  }, [featureImportances, selectedAsset]);

  const maxImportance = useMemo(() => {
    return Math.max(...assetImportances.map(f => f.importance), 0.01);
  }, [assetImportances]);

  // Current asset metrics
  const currentMetrics = useMemo(() => {
    return modelMetrics.find(m => m.asset_name === selectedAsset);
  }, [modelMetrics, selectedAsset]);

  // R² comparison across assets
  const r2Comparison = useMemo(() => {
    return modelMetrics.map(m => ({
      asset: m.asset_name,
      r2: m.r2,
    }));
  }, [modelMetrics]);

  // RMSE comparison
  const rmseComparison = useMemo(() => {
    return modelMetrics.map(m => ({
      asset: m.asset_name,
      rmse: m.rmse,
    }));
  }, [modelMetrics]);

  return (
    <div className="tab-content">
      <div className="page-header">
        <h1>Model Insights — {selectedAsset}</h1>
        <p>XGBoost Regressor performance metrics and feature importances</p>
      </div>

      {/* Current asset metrics */}
      {currentMetrics && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label"><Brain size={14} /> RMSE</div>
            <div className="metric-value">{currentMetrics.rmse}</div>
            <div className="metric-sub">Root Mean Squared Error</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">MAE</div>
            <div className="metric-value">{currentMetrics.mae}</div>
            <div className="metric-sub">Mean Absolute Error</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">R² Score</div>
            <div className="metric-value" style={{ color: currentMetrics.r2 > 0.5 ? 'var(--signal-buy)' : currentMetrics.r2 > 0 ? 'var(--chart-orange)' : 'var(--signal-sell)' }}>
              {currentMetrics.r2}
            </div>
            <div className="metric-sub">Coefficient of Determination</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Train / Test Split</div>
            <div className="metric-value" style={{ fontSize: 18 }}>
              {currentMetrics.train_size?.toLocaleString()} / {currentMetrics.test_size?.toLocaleString()}
            </div>
            <div className="metric-sub">80/20 split</div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Feature Importance */}
        <div className="glass-card">
          <div className="glass-card-header"><Brain size={14} /> Feature Importances — {selectedAsset}</div>
          <div className="importance-bars">
            {assetImportances.map(f => (
              <div key={f.feature} className="importance-row">
                <span className="importance-label">{FEATURE_LABELS[f.feature] || f.feature}</span>
                <div className="importance-bar-bg">
                  <div
                    className="importance-bar-fill"
                    style={{ width: `${(f.importance / maxImportance) * 100}%` }}
                  />
                </div>
                <span className="importance-value">{(f.importance * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* R² across assets */}
        <div className="chart-container">
          <div className="chart-title">R² Score — All Assets</div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={r2Comparison} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                <Bar dataKey="r2" name="R² Score" radius={[4,4,0,0]}>
                  {r2Comparison.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.asset === selectedAsset ? '#7c5cfc' : 'rgba(124,92,252,0.3)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RMSE comparison */}
      <div className="chart-container">
        <div className="chart-title">RMSE Comparison — All Assets</div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={rmseComparison} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
              <Bar dataKey="rmse" name="RMSE" radius={[4,4,0,0]}>
                {rmseComparison.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.asset === selectedAsset ? '#ec4899' : 'rgba(236,72,153,0.3)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full metrics table */}
      <div className="glass-card">
        <div className="glass-card-header">Model Performance — All Assets</div>
        <table className="model-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>RMSE</th>
              <th>MAE</th>
              <th>R²</th>
              <th>Train Size</th>
              <th>Test Size</th>
            </tr>
          </thead>
          <tbody>
            {modelMetrics.map(m => (
              <tr key={m.asset_name} style={m.asset_name === selectedAsset ? { background: 'var(--bg-hover)' } : {}}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.asset_name}</td>
                <td>{m.rmse}</td>
                <td>{m.mae}</td>
                <td style={{ color: m.r2 > 0.5 ? 'var(--signal-buy)' : m.r2 > 0 ? 'var(--chart-orange)' : 'var(--signal-sell)' }}>
                  {m.r2}
                </td>
                <td>{m.train_size?.toLocaleString()}</td>
                <td>{m.test_size?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model Info */}
      <div className="info-card">
        <h4>Model Methodology</h4>
        <ul>
          <li><strong>Algorithm:</strong> XGBoost Regressor (n_estimators=100, max_depth=6, lr=0.1)</li>
          <li><strong>Target:</strong> Next 5-minute return percentage</li>
          <li><strong>Features:</strong> 5-min return, 1-day return, 5-day volatility, high-low range, gold return, mutual fund return</li>
          <li><strong>Train/Test:</strong> 80/20 random split per asset</li>
          <li><strong>Per-Asset Training:</strong> Each asset gets its own dedicated model for better accuracy</li>
        </ul>
      </div>
    </div>
  );
}
