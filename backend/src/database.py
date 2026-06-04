import os
from neo4j import GraphDatabase

URI = os.getenv("NEO4J_URI", "bolt://db:7687")
USER = os.getenv("NEO4J_USER", "neo4j")
PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

class Database:
    def __init__(self):
        self._driver = None

    def connect(self, uri=None, user=None, password=None):
        if not self._driver:
            conn_uri = uri or URI
            conn_user = user or USER
            conn_pwd = password or PASSWORD
            self._driver = GraphDatabase.driver(conn_uri, auth=(conn_user, conn_pwd))

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
