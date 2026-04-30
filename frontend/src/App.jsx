import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import TabDashboard from './components/TabDashboard';
import TabSignals from './components/TabSignals';
import TabPriceAnalysis from './components/TabPriceAnalysis';
import TabVolatility from './components/TabVolatility';
import TabModel from './components/TabModel';
import TabDataExplorer from './components/TabDataExplorer';
import './App.css';

function App() {
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Load structured data.json
  useEffect(() => {
    axios.get(`${import.meta.env.BASE_URL}data.json`)
      .then(res => {
        const d = res.data;
        setRawData(d);

        // Default to first asset
        if (d.assetSummaries && d.assetSummaries.length > 0) {
          setSelectedAsset(d.assetSummaries[0].asset_name);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load data.json:", err);
        setError("Failed to load data.json. Did you run `python dataseed.py`?");
        setLoading(false);
      });
  }, []);

  // Unique asset names
  const assets = useMemo(() => {
    if (!rawData?.assetSummaries) return [];
    return rawData.assetSummaries.map(a => a.asset_name);
  }, [rawData]);

  // Filtered records for the selected asset + date
  const filteredData = useMemo(() => {
    if (!rawData?.records) return [];
    let filtered = rawData.records.filter(r => r.asset_name === selectedAsset);
    if (targetDate) {
      filtered = filtered.filter(r => r.date?.startsWith(targetDate));
    }
    return filtered;
  }, [rawData, selectedAsset, targetDate]);

  if (loading) {
    return (
      <div className="loader">
        <div className="loader-spinner" />
        <div className="loader-text">Loading Financial Data...</div>
      </div>
    );
  }

  if (error || !rawData) {
    return (
      <div className="loader">
        <div className="loader-text" style={{ color: 'var(--signal-sell)' }}>
          {error || 'Error loading data.'}
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <TabDashboard
            allData={rawData.records}
            assetSummaries={rawData.assetSummaries}
            setSelectedAsset={setSelectedAsset}
            setActiveTab={setActiveTab}
          />
        );
      case 'signals':
        return (
          <TabSignals
            data={filteredData}
            selectedAsset={selectedAsset}
          />
        );
      case 'price':
        return (
          <TabPriceAnalysis
            data={filteredData}
            selectedAsset={selectedAsset}
          />
        );
      case 'volatility':
        return (
          <TabVolatility
            data={filteredData}
            allData={rawData.records}
            selectedAsset={selectedAsset}
            assetSummaries={rawData.assetSummaries}
          />
        );
      case 'model':
        return (
          <TabModel
            selectedAsset={selectedAsset}
            modelMetrics={rawData.modelMetrics}
            featureImportances={rawData.featureImportances}
          />
        );
      case 'explorer':
        return (
          <TabDataExplorer
            data={filteredData}
            selectedAsset={selectedAsset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        assets={assets}
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        targetDate={targetDate}
        setTargetDate={setTargetDate}
      />
      <main className="main">
        {renderTab()}
      </main>
    </div>
  );
}

export default App;
