import { useEffect } from 'react';

export const useGraphSearch = (cyRef, searchTerm) => {
    useEffect(() => {
        if (!cyRef.current) return;

        const timer = setTimeout(() => {
            const cy = cyRef.current;

            cy.batch(() => {
                cy.elements().removeClass('search-highlight faded');

                if (!searchTerm || !searchTerm.trim()) return;

                const term = searchTerm.toLowerCase();
                const matchedNodes = cy.nodes().filter(node => {
                    const label = (node.data('label') || '').toLowerCase();
                    return label.includes(term);
                });

                if (matchedNodes.length > 0) {
                    cy.elements().not(matchedNodes).addClass('faded');
                    matchedNodes.addClass('search-highlight');
                    matchedNodes.connectedEdges().removeClass('faded');
                }
            });

            if (searchTerm && searchTerm.trim()) {
                const matchedNodes = cy.nodes('.search-highlight');
                if (matchedNodes.length > 0) {
                    cy.animate({
                        fit: { eles: matchedNodes, padding: 100 },
                        duration: 500,
                        easing: 'ease-out-cubic'
                    });
                }
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, cyRef]);

};