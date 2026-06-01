import React from 'react';
import Neo4jConnectionStatus from './Neo4jConnectionStatus';

const Header = ({ currentCase, searchTerm, onSearchChange, onEditCase, onSwitchCase }) => {
    return (
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
                        onClick={onEditCase}
                        className="cursor-pointer text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Chỉnh sửa thông tin vụ án"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>

                    <button
                        onClick={onSwitchCase}
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
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-sm text-slate-200 rounded-md px-4 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
            </div>

            <Neo4jConnectionStatus status="Active" />
        </header>
    );
};

export default Header;
