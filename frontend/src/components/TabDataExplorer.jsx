import { useState, useMemo } from 'react';
import { Table2, ChevronUp, ChevronDown, Search } from 'lucide-react';

const COLUMNS = [
  { key: 'date', label: 'Date/Time', width: 150 },
  { key: 'trading_date', label: 'Trading Date', width: 100 },
  { key: 'asset_name', label: 'Asset', width: 110 },
  { key: 'open', label: 'Open', width: 80, format: v => v != null ? `₹${v.toFixed(2)}` : '—' },
  { key: 'high', label: 'High', width: 80, format: v => v != null ? `₹${v.toFixed(2)}` : '—' },
  { key: 'low', label: 'Low', width: 80, format: v => v != null ? `₹${v.toFixed(2)}` : '—' },
  { key: 'close', label: 'Close', width: 80, format: v => v != null ? `₹${v.toFixed(2)}` : '—' },
  { key: 'volume', label: 'Volume', width: 90, format: v => v != null ? v.toLocaleString() : '—' },
  { key: 'return_5min_pct', label: '5m Ret%', width: 80, format: v => v != null ? v.toFixed(4) : '—' },
  { key: 'volatility_5d', label: 'Vol 5d', width: 80, format: v => v != null ? v.toFixed(4) : '—' },
  { key: 'predicted_return', label: 'Predicted', width: 80, format: v => v != null ? v.toFixed(4) : '—' },
  { key: 'trade_signal', label: 'Signal', width: 70 },
  { key: 'is_high_risk', label: 'Risk', width: 60 },
];

const PAGE_SIZE = 50;

export default function TabDataExplorer({ data, selectedAsset }) {
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    let result = [...data];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(v =>
          String(v).toLowerCase().includes(term)
        )
      );
    }

    result.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });

    return result;
  }, [data, searchTerm, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const renderCell = (col, value) => {
    if (col.key === 'trade_signal') {
      const cls = value === 'BUY' ? 'buy' : value === 'SELL' ? 'sell' : 'hold';
      return (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <span className={`dot dot-${cls}`} />
          {value}
        </span>
      );
    }
    if (col.key === 'is_high_risk') {
      return value ? (
        <span style={{ color: 'var(--risk-high)', fontWeight: 600 }}>⚠</span>
      ) : (
        <span style={{ color: 'var(--risk-normal)' }}>✓</span>
      );
    }
    if (col.key === 'return_5min_pct' || col.key === 'predicted_return') {
      const num = Number(value);
      const color = num > 0 ? 'var(--signal-buy)' : num < 0 ? 'var(--signal-sell)' : 'inherit';
      return <span style={{ color }}>{col.format ? col.format(value) : value}</span>;
    }
    if (col.format) return col.format(value);
    return String(value ?? '—');
  };

  return (
    <div className="tab-content">
      <div className="page-header">
        <h1>Data Explorer — {selectedAsset}</h1>
        <p>Browse, search, and sort {data.length.toLocaleString()} records</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3><Table2 size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {filtered.length.toLocaleString()} records
            {searchTerm && ` (filtered from ${data.length.toLocaleString()})`}
          </h3>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="table-search"
              placeholder="Search records..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
              style={{ paddingLeft: 30 }}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={sortKey === col.key ? 'sorted' : ''}
                    style={{ minWidth: col.width }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === 'asc'
                          ? <ChevronUp size={12} />
                          : <ChevronDown size={12} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, i) => (
                <tr key={i}>
                  {COLUMNS.map(col => (
                    <td key={col.key}>{renderCell(col, row[col.key])}</td>
                  ))}
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage(0)}>«</button>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>‹</button>
            <span className="page-info">
              Page {page + 1} of {totalPages}
            </span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>›</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>»</button>
          </div>
        )}
      </div>
    </div>
  );
}
