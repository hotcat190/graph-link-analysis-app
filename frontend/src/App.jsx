import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import axios from 'axios';

function App() {
  const containerRef = useRef(null);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    // Gọi API từ FastAPI backend
    axios.get(`${import.meta.env.VITE_API_URL}/api/graph`)
      .then(response => initCytoscape(response.data.elements))
      .catch(error => console.error("Error fetching graph data:", error));
  }, []);

  const initCytoscape = (data) => {
    // Khởi tạo Cytoscape instance
    const cyInstance = cytoscape({
      container: containerRef.current,
      elements: data,
      style: [ // Định nghĩa Style (Màu sắc, Icon, Cỡ chữ...)
        {
          selector: 'node[type="person"]',
          style: {
            'background-color': '#e74c3c',
            'label': 'data(label)',
            'color': '#fff',
            'text-outline-color': '#e74c3c',
            'text-outline-width': 2
          }
        },
        {
          selector: 'node[type="phone"]',
          style: {
            'background-color': '#f1c40f',
            'label': 'data(label)',
            'shape': 'rectangle'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#95a5a6',
            'target-arrow-color': '#95a5a6',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px'
          }
        }
      ],
      layout: {
        name: 'cose', // Layout tự động sắp xếp dùng lực hút đẩy
        padding: 50,
        nodeRepulsion: 400000,
        idealEdgeLength: 100
      }
    });

    cyInstance.on('tap', 'node, edge', (evt) => {
      setSelectedData(evt.target.data());
    });

    cyInstance.on('tap', (evt) => {
      if (evt.target === cyInstance) setSelectedData(null);
    });

    return () => {
      if (cyInstance) {
        cyInstance.destroy();
      }
    };
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#1e1e1e' }}>
      <h2 style={{ position: 'absolute', top: 10, left: 20, color: 'white', zIndex: 10 }}>
        Link Analysis Demo
      </h2>
      {/* Khung chứa đồ thị Cytoscape */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {/* Property Panel */}
      {selectedData && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: '300px',
          backgroundColor: '#1e1e1e',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          zIndex: 10,
          fontFamily: 'sans-serif',
          border: '1px solid #333'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#3498db' }}>Thông tin chi tiết</h3>
            <button onClick={() => setSelectedData(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ fontSize: '14px' }}>
            {Object.entries(selectedData).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '10px', borderBottom: '1px solid #222', pb: '5px' }}>
                <span style={{ color: '#888', fontWeight: 'bold', textTransform: 'capitalize' }}>{key}: </span>
                <span>{value.toString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;