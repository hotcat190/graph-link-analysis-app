import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import axios from 'axios';
import { cytoscapeStyles } from '../styles/cytoscapeStyles';

const NetworkGraph = ({ selectedData, onSelectionUpdate, onDeselect }) => {
    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const selectedEleRef = useRef(null);

    const calculatePosition = (ele) => {
        let x, y;

        if (ele.isNode()) {
            const pos = ele.renderedPosition();
            x = pos.x;
            y = pos.y;
        } else if (ele.isEdge()) {
            const boundingBox = ele.renderedBoundingBox();
            x = boundingBox.x1 + (boundingBox.w / 2);
            y = boundingBox.y1 + (boundingBox.h / 2);
        }

        return {
            display: 'block',
            position: 'absolute',
            left: `${x + 20}px`,
            top: `${y + 20}px`,
        };
    };

    const triggerUpdate = () => {
        if (!selectedEleRef.current) return;
        const posStyle = calculatePosition(selectedEleRef.current);
        onSelectionUpdate(selectedEleRef.current.data(), posStyle);
    };

    useEffect(() => {
        if (!selectedData && cyRef.current) {
            selectedEleRef.current = null;
            cyRef.current.elements().unselect();
        }
    }, [selectedData]);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/graph`)
            .then(response => initCytoscape(response.data.elements))
            .catch(error => console.error("Error fetching graph data:", error));
    }, []);

    const initCytoscape = (data) => {
        const cyInstance = cytoscape({
            container: containerRef.current,
            elements: data,
            style: cytoscapeStyles,
            layout: {
                name: 'cose',
                padding: 50,
                nodeRepulsion: 400000,
                idealEdgeLength: 100
            }
        });

        cyRef.current = cyInstance;

        cyInstance.on('tap', 'node, edge', (evt) => {
            const clickedEle = evt.target;

            if (clickedEle.selected()) {
                setTimeout(() => {
                    clickedEle.unselect();
                }, 0);
            }
        });

        cyInstance.on('select', 'node, edge', (evt) => {
            selectedEleRef.current = evt.target;
            triggerUpdate();
        });

        cyInstance.on('unselect', 'node, edge', (evt) => {
            if (selectedEleRef.current && evt.target.id() === selectedEleRef.current.id()) {
                selectedEleRef.current = null;
                onDeselect();
            }
        });

        cyInstance.on('tap', (evt) => {
            if (evt.target === cyInstance) {
                cyInstance.elements().unselect();
            }
        });

        cyInstance.on('drag', 'node', (evt) => {
            if (selectedEleRef.current && evt.target.id() === selectedEleRef.current.id()) {
                triggerUpdate();
            }
        });

        cyInstance.on('pan zoom', () => {
            if (selectedEleRef.current) {
                triggerUpdate();
            }
        });

        return () => {
            if (cyInstance) {
                cyInstance.destroy();
            }
        };
    }

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default NetworkGraph;