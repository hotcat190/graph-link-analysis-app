import React from 'react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, caseName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-sm rounded-xl p-6 shadow-2xl border border-red-900/35 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-12 h-12 mx-auto mb-3 bg-red-950/20 rounded-full flex items-center justify-center border border-red-500/20 text-red-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h3 className="text-lg font-bold text-center text-slate-100 mb-1">Xác nhận xóa Vụ án?</h3>
                <p className="text-xs text-center text-slate-400 mb-6 px-2 leading-relaxed">
                    Hành động này sẽ xóa vĩnh viễn vụ án <strong className="text-red-400">"{caseName}"</strong> và toàn bộ dữ liệu mạng lưới thuộc vụ án này. Không thể phục hồi!
                </p>

                <div className="flex gap-2 justify-center">
                    <button
                        onClick={onClose}
                        className="cursor-pointer flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs py-2.5 rounded-lg border border-slate-700 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={onConfirm}
                        className="cursor-pointer flex-1 bg-red-600 hover:bg-red-500 text-white font-medium text-xs py-2.5 rounded-lg border border-red-500/50 shadow-md shadow-red-950/30 transition-colors"
                    >
                        Xác nhận Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
