from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import os

import database
from routes.cases import router as cases_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to database
    database.db.connect()
    
    # Initialize schema, constraints and seed default case if empty
    with database.db.get_session() as session:
        # Create constraint for Case id uniqueness
        try:
            session.run("CREATE CONSTRAINT case_id_constraint IF NOT EXISTS FOR (c:Case) REQUIRE c.id IS UNIQUE")
        except Exception as e:
            # Neo4j version/edition differences can sometimes raise errors on constraint syntax
            print(f"Warning: Could not create constraint: {e}")
            
        # Create index on caseId property for general nodes to optimize searches
        try:
            session.run("CREATE INDEX node_case_id_index IF NOT EXISTS FOR (n:Person) ON (n.caseId)")
            session.run("CREATE INDEX phone_case_id_index IF NOT EXISTS FOR (n:Phone) ON (n.caseId)")
            session.run("CREATE INDEX bank_case_id_index IF NOT EXISTS FOR (n:Bank) ON (n.caseId)")
            session.run("CREATE INDEX company_case_id_index IF NOT EXISTS FOR (n:Company) ON (n.caseId)")
        except Exception as e:
            print(f"Warning: Could not create indices: {e}")

        # Check if database has any Case nodes. If none, create default case and seed it.
        res = session.run("MATCH (c:Case) RETURN count(c) as count")
        count = res.single()["count"]
        if count == 0:
            default_case_id = "default-case"
            created_at_str = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            
            # Create Case node
            session.run("""
            CREATE (c:Case {
                id: $id,
                name: $name,
                description: $description,
                createdAt: datetime($createdAt)
            })
            """, id=default_case_id, name="Vụ án mẫu (Mặc định)", description="Vụ án mẫu khởi tạo tự động khi hệ thống trống", createdAt=created_at_str)
            
            # Seed default case data with caseId='default-case'
            seed_query = """
            CREATE (n1:Person {id: 'n1', label: 'Nghi phạm A', type: 'person', caseId: $case_id})
            CREATE (n2:Person {id: 'n2', label: 'Nghi phạm B', type: 'person', caseId: $case_id})
            CREATE (n3:Phone {id: 'n3', label: '0901234567', type: 'phone', caseId: $case_id})
            CREATE (n4:Bank {id: 'n4', label: 'Tài khoản: 9999', type: 'bank', caseId: $case_id})
            CREATE (n5:Company {id: 'n5', label: 'Công ty C', type: 'company', caseId: $case_id})
            CREATE (n1)-[:SOHUU {label: 'SỞ HỮU', caseId: $case_id}]->(n3)
            CREATE (n3)-[:GOIDIEN {label: 'GỌI ĐIỆN (15p)', caseId: $case_id}]->(n2)
            CREATE (n2)-[:CHUYENTIEN {label: 'CHUYỂN TIỀN', caseId: $case_id}]->(n4)
            CREATE (n4)-[:RUATIEN {label: 'RỬA TIỀN', caseId: $case_id}]->(n5)
            CREATE (n1)-[:CODONG {label: 'CỔ ĐÔNG', caseId: $case_id}]->(n5)
            """
            session.run(seed_query, case_id=default_case_id)
            print("Successfully auto-seeded default case!")
            
    yield
    # Shutdown: Close database driver
    database.db.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register cases router
app.include_router(cases_router)

@app.get("/api/graph")
async def get_graph_data():
    nodes = []
    edges = []
    
    with database.db.get_session() as session:
        result = session.run("MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m")
        
        node_ids = set()
        edge_ids = set()
        
        for record in result:
            n = record["n"]
            # Exclude Case nodes from the old general graph endpoint to avoid rendering Case nodes on the old canvas
            if n and "Case" not in n.labels and n.element_id not in node_ids:
                nodes.append({
                    "data": {
                        "id": dict(n).get("id", n.element_id),
                        "label": dict(n).get("label", "Unknown"),
                        "type": dict(n).get("type", "unknown")
                    }
                })
                node_ids.add(n.element_id)
            
            m = record["m"]
            if m and "Case" not in m.labels and m.element_id not in node_ids:
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
                # Only include relationship if both source and target are not Case nodes
                source_node = r.nodes[0]
                target_node = r.nodes[1]
                if "Case" not in source_node.labels and "Case" not in target_node.labels:
                    edges.append({
                        "data": {
                            "id": r.element_id,
                            "source": dict(source_node).get("id", source_node.element_id),
                            "target": dict(target_node).get("id", target_node.element_id),
                            "label": dict(r).get("label", r.type)
                        }
                    })
                    edge_ids.add(r.element_id)
                
    return {"elements": {"nodes": nodes, "edges": edges}}