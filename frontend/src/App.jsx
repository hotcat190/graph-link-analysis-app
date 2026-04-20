import React, { useState } from 'react';
import NetworkGraph from './components/NetworkGraph';
import PropertyPanel from './components/PropertyPanel';
import Neo4jConnectionStatus from './components/Neo4jConnectionStatus';

function App() {
  const [selectedData, setSelectedData] = useState(null);
  const [panelStyle, setPanelStyle] = useState({ display: 'none' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectionUpdate = (data, style) => {
    setSelectedData(data);
    setPanelStyle(style);
  };

  const handleDeselect = () => {
    setSelectedData(null);
    setPanelStyle({ display: 'none' });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07080a] text-slate-200 font-sans">
      <div className="absolute inset-0 graph-grid opacity-20 pointer-events-none"></div>

      <header className="absolute top-0 left-0 w-full h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 z-50 pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/40">N</div>
          <h1 className="font-bold tracking-tight text-slate-100">
            NEXUS <span className="text-blue-500">LINK ANALYSIS</span> <span className="ml-2 text-[10px] text-slate-500 font-mono py-0.5 px-2 border border-slate-700 rounded">v1.2.0-MVP</span>
          </h1>
        </div>

        <div className="flex-1 max-w-md mx-8 pointer-events-auto">
          <input
            type="text"
            placeholder="Tìm kiếm Tên, SDT, Công ty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 text-sm text-slate-200 rounded-md px-4 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <Neo4jConnectionStatus status="Active" />
      </header>

      <div className="absolute inset-0 z-0">
        <NetworkGraph
          selectedData={selectedData}
          searchTerm={searchTerm}
          onSelectionUpdate={handleSelectionUpdate}
          onDeselect={handleDeselect}
        />
      </div>

      <PropertyPanel
        data={selectedData}
        style={panelStyle}
        onClose={handleDeselect}
      />
    </div>
  );
}

export default App;