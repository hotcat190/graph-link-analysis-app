import { useState, useEffect } from 'react';
import Graph from 'graphology';
import { cypherToGraph } from 'graphology-neo4j';
import { getNeo4jDriver } from '../../../api/neo4jClient';

/**
 * Custom React hook to fetch graph data from Neo4j using graphology-neo4j and construct a Graphology instance.
 * 
 * @param {string} caseId - The ID of the current case workspace.
 * @returns {{ graph: Graph|null, loading: boolean, error: string|null }}
 */
export const useGraphologyData = (caseId) => {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!caseId) {
      setGraph(null);
      setLoading(false);
      setError(null);
      return;
    }

    const driver = getNeo4jDriver();
    if (!driver) {
      setError('Neo4j connection driver not initialized.');
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    // Cypher query to retrieve all nodes in the case, and optional relationships matching caseId
    const query = `
      MATCH (n) WHERE n.caseId = $caseId
      OPTIONAL MATCH (n)-[r]->(m) WHERE r.caseId = $caseId AND m.caseId = $caseId
      RETURN n, r, m
    `;

    console.log(`[useGraphologyData] Fetching Graphology data for case: ${caseId}...`);

    cypherToGraph({ driver }, query, { caseId })
      .then((newGraph) => {
        if (!active) {
          // If the hook has been unmounted or caseId changed, close/destroy the graph
          newGraph.clear();
          return;
        }

        // Neo4j node IDs are mapped, but we need to ensure every node has basic attributes
        // like valid (x, y) coordinates for Sigma.js to avoid rendering crashes.
        newGraph.forEachNode((node, attrs) => {
          // Read x and y coordinates or assign random coordinates if they are missing
          const hasX = attrs.x !== undefined && attrs.x !== null && !isNaN(Number(attrs.x));
          const hasY = attrs.y !== undefined && attrs.y !== null && !isNaN(Number(attrs.y));
          
          if (!hasX) {
            newGraph.setNodeAttribute(node, 'x', Math.random() * 600 - 300);
          } else {
            newGraph.setNodeAttribute(node, 'x', Number(attrs.x));
          }

          if (!hasY) {
            newGraph.setNodeAttribute(node, 'y', Math.random() * 600 - 300);
          } else {
            newGraph.setNodeAttribute(node, 'y', Number(attrs.y));
          }

          // If label is missing, fall back to id
          if (!attrs.label) {
            newGraph.setNodeAttribute(node, 'label', attrs.id || node);
          }
          
          // If type is missing, default to unknown
          if (!attrs.type) {
            newGraph.setNodeAttribute(node, 'type', 'unknown');
          }
        });

        console.log(`[useGraphologyData] Loaded graph with ${newGraph.order} nodes and ${newGraph.size} edges.`);
        setGraph(newGraph);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useGraphologyData] Error loading graphology data:', err);
        if (active) {
          setError('Không thể tải dữ liệu đồ thị từ Neo4j.');
          setGraph(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [caseId]);

  return { graph, loading, error };
};
