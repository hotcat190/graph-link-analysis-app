import neo4j from 'neo4j-driver';

const URI = import.meta.env.VITE_NEO4J_URI || 'bolt://localhost:7687';
const USER = import.meta.env.VITE_NEO4J_USER || 'neo4j';
const PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD || 'password';

let driver = null;

/**
 * Gets or initializes the client-side Neo4j Bolt driver instance.
 * @returns {import('neo4j-driver').Driver} The initialized Neo4j driver.
 */
export const getNeo4jDriver = () => {
  if (!driver) {
    try {
      console.log(`[Neo4jClient] Connecting to Neo4j at ${URI} as user ${USER}...`);
      driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    } catch (error) {
      console.error('[Neo4jClient] Failed to create Neo4j driver:', error);
    }
  }
  return driver;
};

/**
 * Closes the Neo4j driver instance.
 */
export const closeNeo4jDriver = async () => {
  if (driver) {
    try {
      await driver.close();
      console.log('[Neo4jClient] Closed Neo4j driver.');
    } catch (error) {
      console.error('[Neo4jClient] Error closing Neo4j driver:', error);
    }
    driver = null;
  }
};
