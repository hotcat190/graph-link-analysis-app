const PropertyPanel = ({ data, style, onClose }) => {
    if (!data) return null;

    const isArray = Array.isArray(data);

    return (
        <div
            className="glass-panel w-80 rounded-lg shadow-2xl p-4 border-l-4 border-l-blue-500 z-50 transition-all duration-200"
            style={{ ...style }}
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-sm font-bold text-white">Thông tin chi tiết</h3>
                    <p className="text-[10px] text-blue-400 uppercase tracking-tighter">
                        {isArray ? 'Multi-Selection' : 'Properties'}
                    </p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none">✕</button>
            </div>

            {isArray ? (
                <div className="space-y-2 border-t border-slate-700/50 pt-3 max-h-[300px] overflow-y-auto pr-1">
                    <div className="text-xs font-semibold text-slate-400 mb-2">
                        Đang chọn {data.length} đối tượng:
                    </div>
                    {data.map((item, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-900/50 border border-slate-800 flex justify-between items-center text-[11px] gap-2">
                            <span className="text-slate-200 font-medium truncate" title={item.label || item.name || item.id}>
                                {item.label || item.name || item.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                                item.type === 'person' ? 'bg-blue-500/20 text-blue-400' :
                                item.type === 'phone' ? 'bg-amber-500/20 text-amber-400' :
                                item.type === 'company' ? 'bg-purple-500/20 text-purple-400' :
                                item.type === 'bank' ? 'bg-emerald-500/20 text-emerald-400' :
                                'bg-slate-500/20 text-slate-400'
                            }`}>
                                {item.type || 'unknown'}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2 border-t border-slate-700/50 pt-3">
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-500 font-bold uppercase">{key}</span>
                            <span className="font-mono text-slate-300 ml-4 text-right break-all">{value?.toString()}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PropertyPanel;
