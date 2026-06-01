import React, { useState, useEffect } from 'react';

const CaseFormModal = ({ isOpen, onClose, onSubmit, initialData = null, showSeedOption = false }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [seed, setSeed] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setName(initialData ? initialData.name : '');
            setDescription(initialData ? (initialData.description || '') : '');
            setSeed(true);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, description, seed });
    };

    const isEdit = !!initialData;

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md rounded-xl p-6 shadow-2xl border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {isEdit ? (
                            <>
                                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Chỉnh sửa thông tin
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                Tạo Vụ án Mới
                            </>
                        )}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tên Vụ Án <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="Nhập tên vụ án..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-900/80 border border-slate-700 text-sm text-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mô tả chi tiết</label>
                        <textarea
                            rows="3"
                            placeholder="Nhập mô tả tóm tắt..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-900/80 border border-slate-700 text-sm text-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        />
                    </div>

                    {showSeedOption && !isEdit && (
                        <div className="flex items-center gap-2.5 py-1.5">
                            <input
                                type="checkbox"
                                id="seed-checkbox"
                                checked={seed}
                                onChange={(e) => setSeed(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900 cursor-pointer"
                            />
                            <label htmlFor="seed-checkbox" className="text-xs text-slate-300 font-medium cursor-pointer select-none">
                                Khởi tạo kèm dữ liệu đồ thị mẫu (Demo Data)
                            </label>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs px-4 py-2.5 rounded-lg border border-slate-700 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg border border-blue-500/50 shadow-md shadow-blue-900/30 transition-colors"
                        >
                            {isEdit ? 'Lưu Thay đổi' : 'Xác nhận Tạo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CaseFormModal;
