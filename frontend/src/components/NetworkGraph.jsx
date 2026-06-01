import React, { useRef } from 'react';
import { useGraphData } from '../hooks/useGraphData';
import { useCytoscape } from '../hooks/useCytoscape';
import { useGraphSearch } from '../hooks/useGraphSearch';

const NetworkGraph = ({ caseId, selectedData, searchTerm, onSelectionUpdate, onDeselect }) => {
    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const graphData = useGraphData(caseId);

    useCytoscape({
        containerRef,
        cyRef,
        data: graphData,
        selectedData,
        onSelectionUpdate,
        onDeselect
    });

    useGraphSearch(cyRef, searchTerm);

    const isEmpty = graphData && (!graphData.nodes || graphData.nodes.length === 0);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="w-full h-full" />
            
            {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs z-30 px-6 text-center">
                    <div className="max-w-md p-8 rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-2xl shadow-blue-500/5">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 text-blue-400">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-200 mb-2">Vụ án chưa có dữ liệu mạng lưới</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Vui lòng bấm nạp dữ liệu mẫu hoặc sử dụng chức năng nhập tập tin.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NetworkGraph;