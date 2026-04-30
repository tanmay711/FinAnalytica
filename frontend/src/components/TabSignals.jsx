import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TabSignals({ data, selectedAsset }) {
  const latestData = data.length > 0 ? data[data.length - 1] : null;

  const signalCounts = useMemo(() => {
    const buy = data.filter(d => d.trade_signal === 'BUY').length;
    const hold = data.filter(d => d.trade_signal === 'HOLD').length;
    const sell = data.filter(d => d.trade_signal === 'SELL').length;
    return { buy, hold, sell };
  }, [data]);

  const pieData = useMemo(() => [
    { name: 'BUY', value: signalCounts.buy, fill: '#00e676' },
    { name: 'HOLD', value: signalCounts.hold, fill: '#8b92a8' },
    { name: 'SELL', value: signalCounts.sell, fill: '#ff5252' },
  ], [signalCounts]);

  // Downsample for chart performance
  const chartData = useMemo(() => {
    if (data.length <= 300) return data;
    const step = Math.ceil(data.length / 300);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  if (!latestData) {
    return (
      <div className="tab-content">
        <div className="page-header">
          <h1>Trading Signals — {selectedAsset}</h1>
        </div>
        <div className="empty-state"><p>No data available for this asset/date combination.</p></div>
      </div>
    );
  }

  const signalClass = latestData.trade_signal?.toLowerCase();

  return (
    <div className="tab-content">
      <div className="page-header">
        <h1>Trading Signals — {selectedAsset}</h1>
        <p>XGBoost-powered signal generation with risk adjustment</p>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label"><TrendingUp size={14} /> Current Price</div>
          <div className="metric-value">₹{latestData.close?.toFixed(2)}</div>
          <div className="metric-sub">{latestData.asset_type} • {latestData.trading_date}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label"><Activity size={14} /> Predicted 5min Return</div>
          <div className="metric-value" style={{ color: latestData.predicted_return > 0 ? 'var(--signal-buy)' : latestData.predicted_return < 0 ? 'var(--signal-sell)' : 'var(--text-primary)' }}>
            {latestData.predicted_return?.toFixed(4)}%
          </div>
          <div className="metric-sub">Actual: {latestData.target_next_5min_return_pct?.toFixed(4)}%</div>
        </div>
        <div className="metric-card" style={{ textAlign: 'center' }}>
          <div className="metric-label" style={{ justifyContent: 'center' }}>Trade Signal</div>
          <div style={{ marginTop: 8 }}>
            <span className={`signal-badge signal-large ${signalClass}`}>{latestData.trade_signal}</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">
            {latestData.is_high_risk ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />} Risk Status
          </div>
          <div style={{ marginTop: 8 }}>
            <span className={`risk-badge ${latestData.is_high_risk ? 'high' : 'normal'}`}>
              {latestData.is_high_risk ? '⚠️ High Risk' : '✅ Normal Risk'}
            </span>
          </div>
          <div className="metric-sub">Volatility: {latestData.volatility_5d?.toFixed(4)}</div>
        </div>
      </div>

      <div className="grid-2-1">
        {/* Predicted vs Actual Chart */}
        <div className="chart-container">
          <div className="chart-title">Predicted vs Actual Returns</div>
          <div style={{ width: '100%', height: 340 }}>
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
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="target_next_5min_return_pct" name="Actual" stroke="#3b82f6" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="predicted_return" name="Predicted" stroke="#f59e0b" dot={<SignalDot />} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Signal Pie */}
        <div className="chart-container">
          <div className="chart-title">Signal Distribution</div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1f2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="signal-dist" style={{ marginTop: 8 }}>
            <div className="signal-dist-item">
              <div className="signal-dist-count buy">{signalCounts.buy}</div>
              <div className="signal-dist-label">Buy</div>
            </div>
            <div className="signal-dist-item">
              <div className="signal-dist-count hold">{signalCounts.hold}</div>
              <div className="signal-dist-label">Hold</div>
            </div>
            <div className="signal-dist-item">
              <div className="signal-dist-count sell">{signalCounts.sell}</div>
              <div className="signal-dist-label">Sell</div>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="info-card">
        <h4>How Signals Are Generated</h4>
        <ul>
          <li><strong>XGBoost Model</strong> predicts <code style={{ background: 'var(--bg-hover)', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>target_next_5min_return_pct</code></li>
          <li><strong>Base Signal:</strong> BUY if predicted &gt; 0.2%, SELL if &lt; -0.2%, else HOLD</li>
          <li><strong>Risk Downgrade:</strong> If 5-day volatility is in the top 20%, signals are downgraded (BUY→HOLD, HOLD→SELL)</li>
        </ul>
      </div>
    </div>
  );
}

function SignalDot(props) {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  if (payload.trade_signal === 'BUY') {
    return <circle cx={cx} cy={cy} r={4} fill="#00e676" stroke="none" />;
  } else if (payload.trade_signal === 'SELL') {
    return <circle cx={cx} cy={cy} r={4} fill="#ff5252" stroke="none" />;
  }
  return null;
}
