import React, { useState } from 'react';
import { updateCase } from './features/cases/api/casesApi';
import NetworkGraph from './features/graph/components/NetworkGraph';
import SigmaGraphView from './features/graph/components/SigmaGraphView';
import PropertyPanel from './features/graph/components/PropertyPanel';
import Header from './features/graph/components/Header';
import CaseSelector from './features/cases/components/CaseSelector';
import CaseFormModal from './features/cases/components/CaseFormModal';
import { useGraphologyData } from './features/graph/hooks/useGraphologyData';

function App() {
  const [currentCase, setCurrentCase] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [panelStyle, setPanelStyle] = useState({ display: 'none' });
  const [searchTerm, setSearchTerm] = useState('');
  const [engine, setEngine] = useState('cytoscape'); // 'cytoscape' or 'sigma'
  
  // Modal state for header-based editing
  const [isHeaderEditOpen, setIsHeaderEditOpen] = useState(false);

  // Fetch graphology data only when using the Sigma.js engine
  const graphologyResult = useGraphologyData(engine === 'sigma' ? currentCase?.id : null);

  const handleSelectionUpdate = (data, style) => {
    setSelectedData(data);
    setPanelStyle(style);
  };

  const handleDeselect = () => {
    setSelectedData(null);
    setPanelStyle({ display: 'none' });
  };

  const handleSelectCase = (caseObj) => {
    setCurrentCase(caseObj);
    handleDeselect(); // reset selection when changing case
  };

  const handleHeaderEditSubmit = ({ name, description }) => {
    if (!currentCase) return;

    updateCase(currentCase.id, { name: name.trim(), description: description.trim() })
      .then(updatedCase => {
        setCurrentCase(updatedCase);
        setIsHeaderEditOpen(false);
      })
      .catch(err => {
        console.error("Error updating case from header:", err);
        alert("Có lỗi xảy ra khi cập nhật vụ án.");
      });
  };

  // If no case is selected, show the Dashboard Selector
  if (!currentCase) {
    return <CaseSelector onSelectCase={handleSelectCase} />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07080a] text-slate-200 font-sans">
      <div className="absolute inset-0 graph-grid opacity-20 pointer-events-none"></div>

      <Header
        currentCase={currentCase}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEditCase={() => setIsHeaderEditOpen(true)}
        onSwitchCase={() => {
          handleDeselect();
          setCurrentCase(null);
        }}
        engine={engine}
        onEngineChange={(newEngine) => {
          handleDeselect(); // Close details panel when switching engines
          setEngine(newEngine);
        }}
      />

      <div className="absolute inset-0 z-0">
        {engine === 'cytoscape' ? (
          <NetworkGraph
            caseId={currentCase.id}
            selectedData={selectedData}
            searchTerm={searchTerm}
            onSelectionUpdate={handleSelectionUpdate}
            onDeselect={handleDeselect}
          />
        ) : (
          <SigmaGraphView
            graph={graphologyResult.graph}
            loading={graphologyResult.loading}
            error={graphologyResult.error}
            selectedData={selectedData}
            searchTerm={searchTerm}
            onSelectionUpdate={handleSelectionUpdate}
            onDeselect={handleDeselect}
          />
        )}
      </div>

      <PropertyPanel
        data={selectedData}
        style={panelStyle}
        onClose={handleDeselect}
      />

      {/* Header Edit Case Modal */}
      <CaseFormModal
        isOpen={isHeaderEditOpen}
        onClose={() => setIsHeaderEditOpen(false)}
        onSubmit={handleHeaderEditSubmit}
        initialData={currentCase}
      />
    </div>
  );
}

export default App;