import React, { useState, useEffect } from 'react';
import { getCases, createCase, updateCase, deleteCase } from '../api/casesApi';
import CaseFormModal from './CaseFormModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const CaseSelector = ({ onSelectCase }) => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCase, setEditingCase] = useState(null);
    const [deletingCase, setDeletingCase] = useState(null);

    const fetchCases = () => {
        setLoading(true);
        getCases()
            .then(data => {
                setCases(data);
                setError(null);
            })
            .catch(err => {
                console.error("Error fetching cases:", err);
                setError("Không thể tải danh sách vụ án.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCases();
    }, []);

    const handleCreateSubmit = ({ name, description, seed }) => {
        createCase({ name: name.trim(), description: description.trim() }, seed)
            .then(() => {
                setIsCreateOpen(false);
                fetchCases();
            })
            .catch(err => {
                console.error("Error creating case:", err);
                alert("Có lỗi xảy ra khi tạo vụ án mới.");
            });
    };

    const handleEditSubmit = ({ name, description }) => {
        if (!editingCase) return;
        updateCase(editingCase.id, { name: name.trim(), description: description.trim() })
            .then(() => {
                setEditingCase(null);
                fetchCases();
            })
            .catch(err => {
                console.error("Error updating case:", err);
                alert("Có lỗi xảy ra khi cập nhật vụ án.");
            });
    };

    const handleDeleteConfirm = () => {
        if (!deletingCase) return;
        deleteCase(deletingCase.id)
            .then(() => {
                setDeletingCase(null);
                fetchCases();
            })
            .catch(err => {
                console.error("Error deleting case:", err);
                alert("Có lỗi xảy ra khi xóa vụ án.");
            });
    };

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#07080a]/95 overflow-y-auto">
            {/* Header section on Dashboard */}
            <div className="w-full max-w-5xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        <span className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/40">N</span>
                        NEXUS <span className="text-blue-500 font-light">LINK ANALYSIS</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Hệ thống phân tích và truy vết liên kết mạng lưới đối tượng</p>
                </div>
                
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-blue-950/50 hover:shadow-blue-500/20 border border-blue-500/30 transition-all duration-200 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo Vụ án Mới
                </button>
            </div>

            {/* Error or Loading */}
            {loading && cases.length === 0 ? (
                <div className="w-full max-w-5xl text-center py-20 text-slate-400">
                    <span className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></span>
                    <p>Đang tải danh sách vụ án...</p>
                </div>
            ) : error ? (
                <div className="w-full max-w-5xl text-center py-20 text-red-400 glass-panel rounded-xl p-8">
                    <p>{error}</p>
                    <button onClick={fetchCases} className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded">Thử lại</button>
                </div>
            ) : cases.length === 0 ? (
                <div className="w-full max-w-5xl text-center py-20 glass-panel rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-700/50">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-200">Không có vụ án nào</h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm">Hệ thống chưa ghi nhận vụ án nào. Hãy bắt đầu bằng cách tạo một vụ án mới.</p>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="cursor-pointer mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg"
                    >
                        Tạo Vụ án Đầu tiên
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {cases.map((c) => (
                        <div
                            key={c.id}
                            className="glass-panel group rounded-xl p-5 border border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-200 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                                        {c.name}
                                    </h3>
                                    <span className="text-[10px] bg-slate-800/80 border border-slate-700 text-slate-400 px-2 py-0.5 rounded font-mono shrink-0">
                                        CASE
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 line-clamp-2 mb-6 min-h-[40px]">
                                    {c.description || "Không có mô tả cho vụ án này."}
                                </p>
                            </div>

                            <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-3">
                                <div className="flex items-center text-[11px] text-slate-500 gap-1.5 font-mono">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {formatDate(c.createdAt)}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onSelectCase(c)}
                                        className="cursor-pointer flex-1 bg-slate-800 hover:bg-blue-600 text-slate-100 font-semibold text-xs py-2 rounded transition-colors flex items-center justify-center gap-1.5 border border-slate-700 hover:border-blue-500"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Mở Vụ Án
                                    </button>

                                    <button
                                        onClick={() => setEditingCase({ id: c.id, name: c.name, description: c.description || '' })}
                                        className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white p-2 rounded border border-slate-800 hover:border-slate-700 transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => setDeletingCase(c)}
                                        className="cursor-pointer bg-slate-900 hover:bg-red-950/30 text-slate-500 hover:text-red-400 p-2 rounded border border-slate-800 hover:border-red-900/50 transition-colors"
                                        title="Xóa vụ án"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Case Modal */}
            <CaseFormModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateSubmit}
                showSeedOption={true}
            />

            {/* Edit Case Modal */}
            <CaseFormModal
                isOpen={!!editingCase}
                onClose={() => setEditingCase(null)}
                onSubmit={handleEditSubmit}
                initialData={editingCase}
            />

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={!!deletingCase}
                onClose={() => setDeletingCase(null)}
                onConfirm={handleDeleteConfirm}
                caseName={deletingCase ? deletingCase.name : ''}
            />
        </div>
    );
};

export default CaseSelector;
