import { useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function TabPriceAnalysis({ data, selectedAsset }) {
  // Downsample for chart performance
  const chartData = useMemo(() => {
    if (data.length <= 300) return data;
    const step = Math.ceil(data.length / 300);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  // Price stats
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const closes = data.map(d => d.close).filter(v => v != null);
    const volumes = data.map(d => d.volume).filter(v => v != null);
    const returns = data.map(d => d.return_5min_pct).filter(v => v != null);
    const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;
    const std = arr => {
      const m = mean(arr);
      return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
    };
    return {
      priceMin: Math.min(...closes).toFixed(2),
      priceMax: Math.max(...closes).toFixed(2),
      priceAvg: mean(closes).toFixed(2),
      priceStd: std(closes).toFixed(2),
      volumeAvg: Math.round(mean(volumes)).toLocaleString(),
      volumeMax: Math.max(...volumes).toLocaleString(),
      returnAvg: mean(returns).toFixed(4),
      returnStd: std(returns).toFixed(4),
      totalPoints: data.length,
    };
  }, [data]);

  // Return distribution buckets
  const returnDist = useMemo(() => {
    const buckets = {};
    const labels = ['<-1%', '-1 to -0.5%', '-0.5 to 0%', '0 to 0.5%', '0.5 to 1%', '>1%'];
    labels.forEach(l => buckets[l] = 0);
    data.forEach(d => {
      const r = d.return_5min_pct;
      if (r == null) return;
      if (r < -1) buckets['<-1%']++;
      else if (r < -0.5) buckets['-1 to -0.5%']++;
      else if (r < 0) buckets['-0.5 to 0%']++;
      else if (r < 0.5) buckets['0 to 0.5%']++;
      else if (r < 1) buckets['0.5 to 1%']++;
      else buckets['>1%']++;
    });
    return labels.map(l => ({ range: l, count: buckets[l] }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="tab-content">
        <div className="page-header"><h1>Price Analysis — {selectedAsset}</h1></div>
        <div className="empty-state"><p>No data available.</p></div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="page-header">
        <h1>Price Analysis — {selectedAsset}</h1>
        <p>OHLC pricing, volume trends, and return distribution</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Price Min</div>
            <div className="metric-value">₹{stats.priceMin}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Price Max</div>
            <div className="metric-value">₹{stats.priceMax}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Price Avg</div>
            <div className="metric-value">₹{stats.priceAvg}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Price Std Dev</div>
            <div className="metric-value">₹{stats.priceStd}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Avg Volume</div>
            <div className="metric-value">{stats.volumeAvg}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Data Points</div>
            <div className="metric-value">{stats.totalPoints.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Price Area Chart with High/Low Bands */}
      <div className="chart-container">
        <div className="chart-title"><BarChart3 size={16} /> Price Chart (Close with High-Low Range)</div>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
              <YAxis stroke="#555d75" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1f2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 12
                }}
                labelFormatter={val => new Date(val).toLocaleString()}
                formatter={(value, name) => [`₹${Number(value).toFixed(2)}`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="high" name="High" stroke="transparent" fill="rgba(59,130,246,0.08)" />
              <Area type="monotone" dataKey="low" name="Low" stroke="transparent" fill="rgba(59,130,246,0.04)" />
              <Area type="monotone" dataKey="close" name="Close" stroke="#3b82f6" fill="rgba(59,130,246,0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        {/* Volume Chart */}
        <div className="chart-container">
          <div className="chart-title">Volume Over Time</div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  stroke="#555d75"
                  tick={{ fontSize: 9 }}
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
                <Bar dataKey="volume" name="Volume" fill="rgba(139,92,252,0.5)" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Return Distribution */}
        <div className="chart-container">
          <div className="chart-title">5-Min Return Distribution</div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={returnDist} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="range" stroke="#555d75" tick={{ fontSize: 9 }} />
                <YAxis stroke="#555d75" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1f2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12
                  }}
                />
                <Bar dataKey="count" name="Count" fill="rgba(6,182,212,0.6)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gold Correlation */}
      <div className="chart-container">
        <div className="chart-title">Gold Price vs Asset Price Overlay</div>
        <div style={{ width: '100%', height: 280 }}>
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
              <YAxis yAxisId="left" stroke="#f59e0b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fontSize: 10 }} />
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
              <Line yAxisId="left" type="monotone" dataKey="gold_price_close" name="Gold Price" stroke="#f59e0b" dot={false} strokeWidth={1.5} />
              <Line yAxisId="right" type="monotone" dataKey="close" name={`${selectedAsset} Close`} stroke="#3b82f6" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
