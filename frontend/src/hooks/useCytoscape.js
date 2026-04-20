import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { cytoscapeStyles } from '../styles/cytoscapeStyles';
import { calculatePosition } from '../utils/graphPosition';

export const useCytoscape = ({ containerRef, cyRef, data, selectedData, onSelectionUpdate, onDeselect }) => {
    const selectedEleRef = useRef(null);

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
    }, [selectedData, cyRef]);

    useEffect(() => {
        if (!data || !containerRef.current) return;

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

        cyInstance.on('tap', 'node, edge', (evt) => {
            const clickedEle = evt.target;
            if (clickedEle.selected()) {
                // Push the unselect action to the end of the Event Loop (Macrotask Queue).
                // This ensures our unselect runs AFTER Cytoscape's default synchronous 
                // behavior (which automatically selects tapped elements) has finished.
                setTimeout(() => { clickedEle.unselect(); }, 0);
            }
        });

        cyInstance.on('tap', (evt) => {
            if (evt.target === cyInstance) cyInstance.elements().unselect();
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
            if (cyInstance) cyInstance.destroy();
        };
    }, [data]);
};