import React, { useEffect, useRef, useState } from 'react';
import Sigma from 'sigma';
import FA2Layout from 'graphology-layout-forceatlas2/worker';

/**
 * SigmaGraphView component renders the network graph using Sigma.js and Graphology.
 * It uses WebGL for high performance rendering and connects to the PropertyPanel.
 */
const SigmaGraphView = ({ graph, loading, error, selectedData, searchTerm, onSelectionUpdate, onDeselect }) => {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const rendererRef = useRef(null);
  const layoutRef = useRef(null);
  const layoutTimerRef = useRef(null);

  const [selectedNodeIds, setSelectedNodeIds] = useState(new Set());
  const selectedNodeIdsRef = useRef(new Set());
  useEffect(() => {
    selectedNodeIdsRef.current = selectedNodeIds;
  }, [selectedNodeIds]);

  const [layoutRunning, setLayoutRunning] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);

  // Dragging state ref (OGI style)
  const dragStateRef = useRef({
    dragging: false,
    draggedNode: null,
    startX: 0,
    startY: 0,
    hasMoved: false,
    startGraphPointer: { x: 0, y: 0 },
    initialNodePositions: new Map(),
  });

  // Box selection refs
  const isBoxSelectingRef = useRef(false);
  const boxSelectStartRef = useRef(null);

  // Synchronize external deselect action (e.g. from closing PropertyPanel manually)
  useEffect(() => {
    if (!selectedData) {
      setSelectedNodeIds(new Set());
    }
  }, [selectedData]);

  const triggerLayoutForDuration = (durationMs = 3000) => {
    if (layoutRef.current) {
      if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);
      
      if (!layoutRef.current.isRunning()) {
        layoutRef.current.start();
      }
      setLayoutRunning(true);
      
      layoutTimerRef.current = setTimeout(() => {
        if (layoutRef.current && layoutRef.current.isRunning()) {
          console.log('[SigmaGraphView] Auto-stopping layout worker.');
          layoutRef.current.stop();
        }
        setLayoutRunning(false);
      }, durationMs);
    }
  };

  const handleUnpinAll = () => {
    if (!graph) return;
    graph.forEachNode(node => {
      graph.removeNodeAttribute(node, 'fixed');
    });
    triggerLayoutForDuration(3000);
  };

  const handleResetLayout = () => {
    if (!graph) return;
    graph.forEachNode(node => {
      graph.removeNodeAttribute(node, 'fixed');
      graph.setNodeAttribute(node, 'x', Math.random() * 600 - 300);
      graph.setNodeAttribute(node, 'y', Math.random() * 600 - 300);
    });
    triggerLayoutForDuration(4000);
  };

  // Main effect to initialize Sigma and layout worker
  useEffect(() => {
    if (!containerRef.current || !graph) return;

    console.log('[SigmaGraphView] Initializing Sigma.js with Graphology instance...');

    // Initialize Sigma renderer with baseline node and edge reducers
    // to map custom DB types (e.g. 'person', 'phone') to valid WebGL shaders ('circle', 'arrow')
    // right at initialization before the constructor processes the graph nodes.
    const renderer = new Sigma(graph, containerRef.current, {
      allowInvalidContainer: true,
      renderEdgeLabels: true,
      defaultEdgeType: 'arrow', // Directed relationships
      labelFont: 'Inter, sans-serif',
      labelColor: { color: '#cbd5e1' },
      edgeLabelColor: { color: '#94a3b8' },
      nodeReducer: (node, data) => ({
        ...data,
        type: 'circle',
      }),
      edgeReducer: (edge, data) => ({
        ...data,
        type: 'arrow',
      }),
    });

    rendererRef.current = renderer;

    // Start ForceAtlas2 physics layout worker with optimized settings to prevent wobbly behavior
    const layout = new FA2Layout(graph, {
      settings: {
        gravity: 0.2, // Lower gravity reduces squeezing and bouncing
        barnesHutOptimize: true,
        strongGravityMode: false,
        linLogMode: true,
        outboundAttractionDistribution: true,
        slowDown: 10, // Higher slowdown dampens node velocity, preventing endless wobbly movement
      }
    });
    layout.start();
    setLayoutRunning(true);
    layoutRef.current = layout;

    // Auto-stop layout after initial convergence period
    if (layoutTimerRef.current) clearTimeout(layoutTimerRef.current);
    layoutTimerRef.current = setTimeout(() => {
      if (layoutRef.current && layoutRef.current.isRunning()) {
        console.log('[SigmaGraphView] Initial layout convergence completed. Auto-stopping layout.');
        layoutRef.current.stop();
      }
      setLayoutRunning(false);
    }, 4000);

    // Handle node selection click event (for click-to-select and shift-click to toggle)
    renderer.on('clickNode', ({ node, event }) => {
      const ds = dragStateRef.current;
      if (ds.hasMoved) return; // Prevent selection click if we just dragged

      const isShift = event.original.shiftKey;
      const currentSelection = new Set(selectedNodeIdsRef.current);

      if (isShift) {
        if (currentSelection.has(node)) {
          currentSelection.delete(node);
        } else {
          currentSelection.add(node);
        }
      } else {
        currentSelection.clear();
        currentSelection.add(node);
      }
      setSelectedNodeIds(currentSelection);
    });

    // Handle background canvas down event to start box selection or clear selection
    renderer.on('downStage', (e) => {
      const isShift = e.event.original.shiftKey;
      if (isShift) {
        isBoxSelectingRef.current = true;
        
        // Calculate positions relative to wrapper bounds
        const rect = wrapperRef.current.getBoundingClientRect();
        const startX = e.event.original.clientX - rect.left;
        const startY = e.event.original.clientY - rect.top;

        boxSelectStartRef.current = { x: startX, y: startY };
        setSelectionBox({
          startX,
          startY,
          currentX: startX,
          currentY: startY,
        });

        // Disable camera panning during box selection
        renderer.getCamera().disable();
        
        e.event.preventSigmaDefault();
        e.event.original.preventDefault();
        e.event.original.stopPropagation();
      } else {
        setSelectedNodeIds(new Set());
        onDeselect();
      }
    });

    // Handle node drag start (left click only)
    renderer.on('downNode', (e) => {
      if (e.event.original.button !== 0) return;

      if (layoutRef.current && layoutRef.current.isRunning()) {
        layoutRef.current.stop();
        setLayoutRunning(false);
      }

      const clickedNode = e.node;
      const ds = dragStateRef.current;
      ds.dragging = true;
      ds.draggedNode = clickedNode;
      ds.hasMoved = false;
      ds.startX = e.event.x;
      ds.startY = e.event.y;
      ds.initialNodePositions = new Map();

      const currentSelection = new Set(selectedNodeIdsRef.current);
      const isShift = e.event.original.shiftKey;

      if (isShift) {
        if (currentSelection.has(clickedNode)) {
          currentSelection.delete(clickedNode);
        } else {
          currentSelection.add(clickedNode);
        }
      } else {
        if (!currentSelection.has(clickedNode)) {
          currentSelection.clear();
          currentSelection.add(clickedNode);
        }
      }
      setSelectedNodeIds(currentSelection);

      // Lock bounding box during drag to prevent camera jitter
      if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());

      // Save start positions in graph coordinate space
      ds.startGraphPointer = renderer.viewportToGraph(e.event);
      currentSelection.forEach((nodeId) => {
        if (graph.hasNode(nodeId)) {
          ds.initialNodePositions.set(nodeId, {
            x: Number(graph.getNodeAttribute(nodeId, 'x')) || 0,
            y: Number(graph.getNodeAttribute(nodeId, 'y')) || 0,
          });
        }
      });

      // Disable camera on drag
      renderer.getCamera().disable();

      e.event.preventSigmaDefault();
      e.event.original.preventDefault();
      e.event.original.stopPropagation();
    });

    // Handle dragging movements using Sigma's mouse captor
    renderer.getMouseCaptor().on('mousemovebody', (event) => {
      const ds = dragStateRef.current;
      if (!ds.dragging || !ds.draggedNode) return;

      event.preventSigmaDefault?.();
      event.original?.preventDefault?.();
      event.original?.stopPropagation?.();

      // Check if user has moved enough to count as drag
      const dx = event.x - ds.startX;
      const dy = event.y - ds.startY;
      if (!ds.hasMoved && Math.sqrt(dx * dx + dy * dy) > 3) {
        ds.hasMoved = true;
      }

      // Convert viewport coords to graph coords
      const pointerGraphPos = renderer.viewportToGraph(event);
      const delta = {
        x: pointerGraphPos.x - ds.startGraphPointer.x,
        y: pointerGraphPos.y - ds.startGraphPointer.y,
      };

      for (const [groupNodeId, initialPosition] of ds.initialNodePositions) {
        if (graph.hasNode(groupNodeId)) {
          const targetX = initialPosition.x + delta.x;
          const targetY = initialPosition.y + delta.y;
          graph.setNodeAttribute(groupNodeId, 'x', targetX);
          graph.setNodeAttribute(groupNodeId, 'y', targetY);
          graph.setNodeAttribute(groupNodeId, 'fixed', true); // Keep node pinned
        }
      }
    });

    // Handle drag release using Sigma's mouse captor
    renderer.getMouseCaptor().on('mouseup', () => {
      const ds = dragStateRef.current;
      if (ds.dragging) {
        ds.dragging = false;
        ds.draggedNode = null;
        renderer.setCustomBBox(null); // Release locked camera bounding box
        renderer.refresh();
        
        // Re-enable camera
        renderer.getCamera().enable();

        // Restart layout briefly with selected/moved nodes pinned to let others adjust
        triggerLayoutForDuration(3000);
      }
    });

    // Keep the PropertyPanel aligned during zooming, panning, or layout updates
    renderer.on('afterRender', () => {
      const activeNodes = selectedNodeIdsRef.current;
      if (activeNodes && activeNodes.size > 0) {
        if (activeNodes.size === 1) {
          const activeNode = Array.from(activeNodes)[0];
          if (graph.hasNode(activeNode)) {
            const attrs = graph.getNodeAttributes(activeNode);
            const displayData = renderer.getNodeDisplayData(activeNode);
            const screenCoords = renderer.graphToViewport({ x: displayData.x, y: displayData.y });

            onSelectionUpdate(attrs, {
              display: 'block',
              position: 'absolute',
              left: `${screenCoords.x + 20}px`,
              top: `${screenCoords.y + 20}px`,
            });
          }
        } else {
          // Multi-node selection: display at average coordinate of all selected nodes
          const validNodes = Array.from(activeNodes).filter(node => graph.hasNode(node));
          if (validNodes.length > 0) {
            const attrsArray = validNodes.map(node => graph.getNodeAttributes(node));
            
            let sumX = 0;
            let sumY = 0;
            validNodes.forEach(node => {
              const displayData = renderer.getNodeDisplayData(node);
              const screenCoords = renderer.graphToViewport({ x: displayData.x, y: displayData.y });
              sumX += screenCoords.x;
              sumY += screenCoords.y;
            });
            const avgX = sumX / validNodes.length;
            const avgY = sumY / validNodes.length;

            onSelectionUpdate(attrsArray, {
              display: 'block',
              position: 'absolute',
              left: `${avgX + 20}px`,
              top: `${avgY + 20}px`,
            });
          }
        }
      }
    });

    return () => {
      console.log('[SigmaGraphView] Cleaning up Sigma.js and layout worker...');
      if (layoutTimerRef.current) {
        clearTimeout(layoutTimerRef.current);
      }
      if (layoutRef.current) {
        layoutRef.current.stop();
        layoutRef.current.kill();
        layoutRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.kill();
        rendererRef.current = null;
      }
    };
  }, [graph]);

  // Apply node and edge styling dynamically based on type, search term, and selection
  useEffect(() => {
    if (!rendererRef.current || !graph) return;

    const renderer = rendererRef.current;

    // Node attribute reducer (styling each node dynamically)
    renderer.setSetting('nodeReducer', (node, data) => {
      const res = { ...data };

      // Determine node color based on its type
      let color = '#94a3b8'; // default slate
      if (data.type === 'person') color = '#3b82f6'; // blue
      else if (data.type === 'phone') color = '#f59e0b'; // orange
      else if (data.type === 'company') color = '#a855f7'; // purple
      else if (data.type === 'bank') color = '#22c55e'; // green

      res.color = color;
      res.size = 18;
      res.type = 'circle'; // Fallback to default circle shader program

      // Visual feedback for selected node(s)
      if (selectedNodeIds.has(node)) {
        res.highlighted = true;
        res.size = 24;
        res.color = '#38bdf8'; // Selected highlight color
      }

      // Search term filtering and highlighting
      if (searchTerm) {
        const labelText = data.label || '';
        const isMatch = labelText.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!isMatch) {
          // Fade out non-matching nodes
          res.color = '#1e293b';
          res.label = '';
        } else {
          // Highlight matching nodes
          res.highlighted = true;
          res.size = 26;
          res.color = '#fbbf24'; // Yellow highlight
        }
      }

      return res;
    });

    // Edge attribute reducer (styling each edge dynamically)
    renderer.setSetting('edgeReducer', (edge, data) => {
      const res = { ...data };
      res.color = '#334155'; // default dark slate
      res.size = 1.5;

      if (searchTerm) {
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, 'label') || '';
        const targetLabel = graph.getNodeAttribute(target, 'label') || '';

        const sourceMatches = sourceLabel.toLowerCase().includes(searchTerm.toLowerCase());
        const targetMatches = targetLabel.toLowerCase().includes(searchTerm.toLowerCase());

        if (!sourceMatches && !targetMatches) {
          // Fade/Hide non-matching connections
          res.color = '#07080a';
          res.hidden = true;
        } else {
          res.color = '#fbbf24'; // Highlight matching path edge
          res.size = 2.5;
        }
      }

      return res;
    });

    // Apply the updates
    renderer.refresh();
  }, [searchTerm, selectedNodeIds, graph]);

  // Window-bound Box Selection Effect
  useEffect(() => {
    if (!selectionBox || !wrapperRef.current || !rendererRef.current) return;

    const handleMove = (event) => {
      const rect = wrapperRef.current.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      setSelectionBox((current) =>
        current
          ? {
              ...current,
              currentX,
              currentY,
            }
          : current
      );

      // Highlight nodes inside the selection box in real-time
      const renderer = rendererRef.current;
      const startX = selectionBox.startX;
      const startY = selectionBox.startY;
      const xMin = Math.min(startX, currentX);
      const xMax = Math.max(startX, currentX);
      const yMin = Math.min(startY, currentY);
      const yMax = Math.max(startY, currentY);

      const boxSelectedNodes = new Set();
      graph.forEachNode((node) => {
        const displayData = renderer.getNodeDisplayData(node);
        const screenCoords = renderer.graphToViewport({ x: displayData.x, y: displayData.y });

        if (
          screenCoords.x >= xMin &&
          screenCoords.x <= xMax &&
          screenCoords.y >= yMin &&
          screenCoords.y <= yMax
        ) {
          boxSelectedNodes.add(node);
        }
      });

      setSelectedNodeIds(boxSelectedNodes);
    };

    const handleUp = () => {
      isBoxSelectingRef.current = false;
      boxSelectStartRef.current = null;
      setSelectionBox(null);
      rendererRef.current?.getCamera().enable();
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [selectionBox, graph]);

  // Loading/Error states
  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs z-30 px-6 text-center">
        <div className="max-w-md p-8 rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-2xl">
          <span className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></span>
          <p className="text-sm text-slate-400">Đang tải và đồng bộ dữ liệu bằng Graphology...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs z-30 px-6 text-center">
        <div className="max-w-md p-8 rounded-xl border border-red-900/50 bg-slate-900/60 backdrop-blur-md shadow-2xl text-red-400">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Đã xảy ra lỗi</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">{error}</p>
        </div>
      </div>
    );
  }

  const isEmpty = graph && graph.order === 0;

  return (
    <div ref={wrapperRef} className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" style={{ background: '#07080a' }} />
      
      {/* Rectangle selection box overlay */}
      {selectionBox && (
        <div
          style={{
            position: 'absolute',
            border: '1.5px dashed #3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.startX - selectionBox.currentX),
            height: Math.abs(selectionBox.startY - selectionBox.currentY),
            pointerEvents: 'none',
            zIndex: 40,
            borderRadius: '2px',
          }}
        />
      )}

      {/* Floating control panels */}
      {!isEmpty && (
        <div className="absolute bottom-6 left-6 flex flex-col gap-3 z-40 pointer-events-auto">
          {/* Layout control group */}
          <div className="glass-panel flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
            <button
              onClick={() => {
                if (layoutRef.current) {
                  if (layoutRunning) {
                    layoutRef.current.stop();
                    setLayoutRunning(false);
                  } else {
                    triggerLayoutForDuration(5000);
                  }
                }
              }}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-150 flex items-center gap-2"
              title={layoutRunning ? "Tạm dừng tự động sắp xếp" : "Kích hoạt tự động sắp xếp"}
            >
              <div className="relative flex h-2 w-2">
                {layoutRunning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${layoutRunning ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
              </div>
              <span className="text-[11px] font-semibold select-none">
                {layoutRunning ? "Đang chạy" : "Đã dừng"}
              </span>
            </button>
            
            <div className="w-px h-4 bg-slate-800 mx-1"></div>

            <button
              onClick={handleUnpinAll}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Gỡ ghim tất cả các nút"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414m-2.657-3.94l-8.485 8.485m11.314-11.314a3 3 0 11-4.243 4.243L6.343 17.657a8 8 0 1111.314-11.314z" />
              </svg>
            </button>

            <button
              onClick={handleResetLayout}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Sắp xếp lại toàn bộ đồ thị"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
              </svg>
            </button>
          </div>

          {/* Camera / Zoom control group */}
          <div className="glass-panel flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg border border-slate-800/80 bg-slate-900/60 backdrop-blur-md self-start">
            <button
              onClick={() => rendererRef.current?.getCamera().animatedZoom({ duration: 250 })}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors font-bold text-sm select-none"
              title="Phóng to"
            >
              ＋
            </button>
            <button
              onClick={() => rendererRef.current?.getCamera().animatedUnzoom({ duration: 250 })}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors font-bold text-sm select-none"
              title="Thu nhỏ"
            >
              －
            </button>
            <button
              onClick={() => rendererRef.current?.getCamera().animatedReset({ duration: 350 })}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Căn giữa màn hình"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs z-30 px-6 text-center">
          <div className="max-w-md p-8 rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 text-blue-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Vụ án chưa có dữ liệu mạng lưới</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Vui lòng quay lại Dashboard nạp dữ liệu mẫu cho vụ án này.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SigmaGraphView;
