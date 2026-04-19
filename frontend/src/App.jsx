import React, { useState } from 'react';
import NetworkGraph from './components/NetworkGraph';
import PropertyPanel from './components/PropertyPanel';

function App() {
  const [selectedData, setSelectedData] = useState(null);
  const [panelStyle, setPanelStyle] = useState({ display: 'none' });

  const handleSelectionUpdate = (data, style) => {
    setSelectedData(data);
    setPanelStyle(style);
  };

  const handleDeselect = () => {
    setSelectedData(null);
    setPanelStyle({ display: 'none' });
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#1e1e1e', overflow: 'hidden' }}>
      <h2 style={{ position: 'absolute', top: 10, left: 20, color: 'white', zIndex: 10, pointerEvents: 'none' }}>
        Link Analysis Demo
      </h2>

      <NetworkGraph
        selectedData={selectedData}
        onSelectionUpdate={handleSelectionUpdate}
        onDeselect={handleDeselect}
      />

      <PropertyPanel
        data={selectedData}
        style={panelStyle}
        onClose={handleDeselect}
      />
    </div>
  );
}

export default App;