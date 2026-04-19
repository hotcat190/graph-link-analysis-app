const PropertyPanel = ({ data, style, onClose }) => {
    if (!data) return null;

    return (
        <div style={{
            ...style,
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
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ fontSize: '14px' }}>
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '5px' }}>
                        <span style={{ color: '#888', fontWeight: 'bold', textTransform: 'capitalize' }}>{key}: </span>
                        <span>{value?.toString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PropertyPanel;