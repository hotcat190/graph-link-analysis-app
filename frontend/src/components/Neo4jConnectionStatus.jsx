const Neo4jConnectionStatus = ({ status }) => {
    return (
        <div className="flex items-center gap-6 pointer-events-auto">
            <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-slate-400 uppercase tracking-widest">Neo4j Connection: {status}</span>
            </div>
        </div>
    );
};

export default Neo4jConnectionStatus;