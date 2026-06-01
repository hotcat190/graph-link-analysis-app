import React, { useState } from 'react';
import axios from 'axios';
import NetworkGraph from './components/NetworkGraph';
import PropertyPanel from './components/PropertyPanel';
import Neo4jConnectionStatus from './components/Neo4jConnectionStatus';
import CaseSelector from './components/CaseSelector';

function App() {
  const [currentCase, setCurrentCase] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [panelStyle, setPanelStyle] = useState({ display: 'none' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for editing case from the header
  const [headerEditingCase, setHeaderEditingCase] = useState(null);

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

  const handleHeaderEditSubmit = (e) => {
    e.preventDefault();
    if (!headerEditingCase || !headerEditingCase.name.trim()) return;

    axios.patch(`${import.meta.env.VITE_API_URL}/api/cases/${headerEditingCase.id}`, {
      name: headerEditingCase.name.trim(),
      description: headerEditingCase.description.trim()
    })
    .then(response => {
      setCurrentCase(response.data);
      setHeaderEditingCase(null);
    })
    .catch(err => {
      console.error("Error updating case:", err);
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

      <header className="absolute top-0 left-0 w-full h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 z-50 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/40">N</div>
            <h1 className="font-bold tracking-tight text-slate-100 hidden md:block">
              NEXUS <span className="text-blue-500">LINK ANALYSIS</span>
            </h1>
          </div>
          
          <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

          <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vụ án:</span>
            <span className="text-sm font-bold text-blue-400 max-w-[150px] truncate" title={currentCase.name}>
              {currentCase.name}
            </span>
            
            <button
              onClick={() => setHeaderEditingCase({ id: currentCase.id, name: currentCase.name, description: currentCase.description || '' })}
              className="cursor-pointer text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition-colors"
              title="Chỉnh sửa thông tin vụ án"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            <button
              onClick={() => {
                handleDeselect();
                setCurrentCase(null);
              }}
              className="cursor-pointer ml-2 text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-700 px-2 py-0.5 rounded text-xs border border-slate-700 flex items-center gap-1 transition-colors font-medium"
              title="Quay lại danh sách vụ án"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </button>
          </div>
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
          caseId={currentCase.id}
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

      {/* Header Edit Case Modal */}
      {headerEditingCase && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-xl p-6 shadow-2xl border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Chỉnh sửa thông tin vụ án
              </h2>
              <button
                onClick={() => setHeaderEditingCase(null)}
                className="text-slate-500 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleHeaderEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tên Vụ Án <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={headerEditingCase.name}
                  onChange={(e) => setHeaderEditingCase({ ...headerEditingCase, name: e.target.value })}
                  className="w-full bg-slate-900/80 border border-slate-700 text-sm text-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mô tả chi tiết</label>
                <textarea
                  rows="3"
                  value={headerEditingCase.description}
                  onChange={(e) => setHeaderEditingCase({ ...headerEditingCase, description: e.target.value })}
                  className="w-full bg-slate-900/80 border border-slate-700 text-sm text-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setHeaderEditingCase(null)}
                  className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs px-4 py-2.5 rounded-lg border border-slate-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg border border-blue-500/50 shadow-md shadow-blue-900/30 transition-colors"
                >
                  Lưu Thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;