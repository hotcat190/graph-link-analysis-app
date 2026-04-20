const PropertyPanel = ({ data, style, onClose }) => {
    if (!data) return null;

    return (
        <div
            className="glass-panel w-72 rounded-lg shadow-2xl p-4 border-l-4 border-l-blue-500 z-50 transition-all duration-200"
            style={{ ...style }}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-sm font-bold text-white">Thông tin chi tiết</h3>
                    <p className="text-[10px] text-blue-400 uppercase tracking-tighter">Properties</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none">✕</button>
            </div>

            <div className="space-y-2 border-t border-slate-700/50 pt-3">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-bold uppercase">{key}</span>
                        <span className="font-mono text-slate-300 ml-4 text-right break-all">{value?.toString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyPanel;