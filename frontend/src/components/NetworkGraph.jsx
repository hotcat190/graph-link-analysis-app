import React, { useRef } from 'react';
import { useGraphData } from '../hooks/useGraphData';
import { useCytoscape } from '../hooks/useCytoscape';
import { useGraphSearch } from '../hooks/useGraphSearch';

const NetworkGraph = ({ selectedData, searchTerm, onSelectionUpdate, onDeselect }) => {
    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const graphData = useGraphData();

    useCytoscape({
        containerRef,
        cyRef,
        data: graphData,
        selectedData,
        onSelectionUpdate,
        onDeselect
    });

    useGraphSearch(cyRef, searchTerm);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default NetworkGraph;