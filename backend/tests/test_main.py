import pytest
from fastapi.testclient import TestClient
import os

if "NEO4J_URI" not in os.environ:
    os.environ["NEO4J_URI"] = "bolt://localhost:7687"

from main import app
import database

client = TestClient(app)

def test_create_empty_case_and_get_graph():
    response = client.post("/api/cases?seed=false", json={"name": "Test Case Empty", "description": "A test case without seed data"})
    assert response.status_code == 201
    data = response.json()
    
    assert "id" in data
    assert data["name"] == "Test Case Empty"
    assert data["description"] == "A test case without seed data"
    assert "createdAt" in data
    
    case_id = data["id"]
    
    graph_response = client.get(f"/api/cases/{case_id}/graph")
    assert graph_response.status_code == 200
    graph_data = graph_response.json()
    
    assert "elements" in graph_data
    assert len(graph_data["elements"]["nodes"]) == 0
    assert len(graph_data["elements"]["edges"]) == 0


def test_create_seeded_case():
    response = client.post("/api/cases?seed=true", json={"name": "Test Case Seeded", "description": "A test case with seed data"})
    assert response.status_code == 201
    data = response.json()
    case_id = data["id"]
    
    # Verify graph contains seeded nodes and edges
    graph_response = client.get(f"/api/cases/{case_id}/graph")
    assert graph_response.status_code == 200
    graph_data = graph_response.json()
    
    assert len(graph_data["elements"]["nodes"]) == 5
    assert len(graph_data["elements"]["edges"]) == 5
    
    labels = {n["data"]["label"] for n in graph_data["elements"]["nodes"]}
    assert "Nghi phạm A" in labels
    assert "Nghi phạm B" in labels


def test_get_cases_list():
    # Fetch list
    response = client.get("/api/cases")
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) >= 2  # The cases from previous tests + default case
    
    # Verify descending sort order of createdAt
    for i in range(len(cases) - 1):
        assert cases[i]["createdAt"] >= cases[i+1]["createdAt"]


def test_case_isolation():
    # Create Case A with seed data
    res_a = client.post("/api/cases?seed=true", json={"name": "Case A", "description": "Seeded case"})
    id_a = res_a.json()["id"]
    
    # Create Case B with no seed data
    res_b = client.post("/api/cases?seed=false", json={"name": "Case B", "description": "Empty case"})
    id_b = res_b.json()["id"]
    
    # Fetch graph for Case B and verify it remains empty (fully isolated from A)
    graph_b_res = client.get(f"/api/cases/{id_b}/graph")
    graph_b = graph_b_res.json()
    assert len(graph_b["elements"]["nodes"]) == 0
    assert len(graph_b["elements"]["edges"]) == 0
    
    # Fetch graph for Case A and verify it has 5 nodes and 5 edges
    graph_a_res = client.get(f"/api/cases/{id_a}/graph")
    graph_a = graph_a_res.json()
    assert len(graph_a["elements"]["nodes"]) == 5
    assert len(graph_a["elements"]["edges"]) == 5


def test_update_case():
    # Create a case
    res = client.post("/api/cases?seed=false", json={"name": "Old Name", "description": "Old Desc"})
    case_id = res.json()["id"]
    
    # Update case name
    patch_res = client.patch(f"/api/cases/{case_id}", json={"name": "New Name"})
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["name"] == "New Name"
    assert data["description"] == "Old Desc"  # description should remain unchanged
    
    # Update description only
    patch_res2 = client.patch(f"/api/cases/{case_id}", json={"description": "New Desc"})
    assert patch_res2.status_code == 200
    data2 = patch_res2.json()
    assert data2["name"] == "New Name"
    assert data2["description"] == "New Desc"


def test_delete_case():
    # Create a seeded case
    res = client.post("/api/cases?seed=true", json={"name": "To Be Deleted", "description": "Will be deleted soon"})
    case_id = res.json()["id"]
    
    # Verify graph is seeded
    graph_res = client.get(f"/api/cases/{case_id}/graph")
    assert len(graph_res.json()["elements"]["nodes"]) == 5
    
    # Delete case
    delete_res = client.delete(f"/api/cases/{case_id}")
    assert delete_res.status_code == 200
    
    # Verify fetching graph returns 404
    graph_res2 = client.get(f"/api/cases/{case_id}/graph")
    assert graph_res2.status_code == 404
    
    # Verify updating deleted case returns 404
    patch_res = client.patch(f"/api/cases/{case_id}", json={"name": "Test"})
    assert patch_res.status_code == 404
    
    # Verify deleting it again returns 404
    delete_res2 = client.delete(f"/api/cases/{case_id}")
    assert delete_res2.status_code == 404


def test_malformed_case_node():
    # 1. Insert a malformed Case node (missing id and name)
    with database.db.get_session() as session:
        session.run("CREATE (c:Case {description: 'Malformed case node', createdAt: datetime()})")
        
    try:
        # 2. Querying cases should handle the missing properties gracefully without raising Pydantic validation error (500)
        response = client.get("/api/cases")
        assert response.status_code == 200
        
        cases = response.json()
        malformed = [c for c in cases if c["description"] == "Malformed case node"]
        assert len(malformed) == 1
        assert malformed[0]["id"] == ""
        assert malformed[0]["name"] == "Không có tên"
    finally:
        # 3. Clean up the malformed node
        with database.db.get_session() as session:
            session.run("MATCH (c:Case {description: 'Malformed case node'}) DETACH DELETE c")

