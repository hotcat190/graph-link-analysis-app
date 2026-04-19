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
                // Push the unselect action to the end of the Event Loop (Macrotask Queue).
                // This ensures our unselect runs AFTER Cytoscape's default synchronous 
                // behavior (which automatically selects tapped elements) has finished.
                setTimeout(() => {
                    clickedEle.unselect();
                }, 0);
            }
        });

        let debounceTimer;

        const handleSelectionChange = () => {
            clearTimeout(debounceTimer);

            // Debounce selection changes to prevent UI flashing. We need a timer here because Cytoscape fires multiple
            // synchronous events when selecting/unselecting a group of elements. This delay waits for the entire event
            // noise to settle before calculating the final number of selected elements. Without debounce (e.g., using
            // setTimeout 0), drag-selecting floods the event queue with hundreds of updates. This chokes the main
            // thread, causing the browser to miss the 'mouseup' event, which leaves Cytoscape's native selection box
            // UI permanently stuck on the screen.
            debounceTimer = setTimeout(() => {
                const selectedElements = cyInstance.elements(':selected');

                if (selectedElements.length === 1) {
                    selectedEleRef.current = selectedElements[0];
                    triggerUpdate();
                } else {
                    selectedEleRef.current = null;
                    onDeselect();
                }
            }, 0);
        };

        cyInstance.on('select unselect', 'node, edge', handleSelectionChange);

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
            if (debounceTimer) clearTimeout(debounceTimer);
            if (cyInstance) {
                cyInstance.destroy();
            }
        };
    }

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default NetworkGraph;