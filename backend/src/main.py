from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from neo4j import GraphDatabase
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

URI = os.getenv("NEO4J_URI", "bolt://db:7687")
USER = os.getenv("NEO4J_USER", "neo4j")
PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

def seed_data(tx):
    tx.run("MATCH (n) DETACH DELETE n")
    tx.run("""
    CREATE (n1:Person {id: 'n1', label: 'Nghi phạm A', type: 'person'})
    CREATE (n2:Person {id: 'n2', label: 'Nghi phạm B', type: 'person'})
    CREATE (n3:Phone {id: 'n3', label: '0901234567', type: 'phone'})
    CREATE (n4:Bank {id: 'n4', label: 'Tài khoản: 9999', type: 'bank'})
    CREATE (n5:Company {id: 'n5', label: 'Công ty C', type: 'company'})
    CREATE (n1)-[:SOHUU {label: 'SỞ HỮU'}]->(n3)
    CREATE (n3)-[:GOIDIEN {label: 'GỌI ĐIỆN (15p)'}]->(n2)
    CREATE (n2)-[:CHUYENTIEN {label: 'CHUYỂN TIỀN'}]->(n4)
    CREATE (n4)-[:RUATIEN {label: 'RỬA TIỀN'}]->(n5)
    CREATE (n1)-[:CODONG {label: 'CỔ ĐÔNG'}]->(n5)
    """)

@app.on_event("startup")
async def startup_event():
    with driver.session() as session:
        session.execute_write(seed_data)
    

@app.get("/api/graph")
async def get_graph_data():
    nodes = []
    edges = []
    
    with driver.session() as session:
        result = session.run("MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m")
        
        node_ids = set()
        edge_ids = set()
        
        for record in result:
            n = record["n"]
            if n and n.element_id not in node_ids:
                nodes.append({
                    "data": {
                        "id": dict(n).get("id", n.element_id),
                        "label": dict(n).get("label", "Unknown"),
                        "type": dict(n).get("type", "unknown")
                    }
                })
                node_ids.add(n.element_id)
            
            m = record["m"]
            if m and m.element_id not in node_ids:
                nodes.append({
                    "data": {
                        "id": dict(m).get("id", m.element_id),
                        "label": dict(m).get("label", "Unknown"),
                        "type": dict(m).get("type", "unknown")
                    }
                })
                node_ids.add(m.element_id)
            
            r = record["r"]
            if r and r.element_id not in edge_ids:
                edges.append({
                    "data": {
                        "id": r.element_id,
                        "source": dict(r.nodes[0]).get("id", r.nodes[0].element_id),
                        "target": dict(r.nodes[1]).get("id", r.nodes[1].element_id),
                        "label": dict(r).get("label", r.type)
                    }
                })
                edge_ids.add(r.element_id)
                
    return {"elements": {"nodes": nodes, "edges": edges}}