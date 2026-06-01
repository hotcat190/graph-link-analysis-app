import os
from neo4j import GraphDatabase

URI = os.getenv("NEO4J_URI", "bolt://db:7687")
USER = os.getenv("NEO4J_USER", "neo4j")
PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

class Database:
    def __init__(self):
        self._driver = None

    def connect(self):
        if not self._driver:
            self._driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

    def close(self):
        if self._driver:
            self._driver.close()
            self._driver = None

    @property
    def driver(self):
        if not self._driver:
            self.connect()
        if self._driver is None:
            raise RuntimeError("Database driver not initialized")
        return self._driver

    def get_session(self):
        return self.driver.session()

db = Database()

def get_db_session():
    db.connect()
    with db.get_session() as session:
        yield session
