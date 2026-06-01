from fastapi import APIRouter, Depends, HTTPException, Query
from neo4j import Session
from typing import List
import uuid
from datetime import datetime, timezone

from database import get_db_session
from schemas import CaseCreate, CaseUpdate, CaseResponse

router = APIRouter(prefix="/api/cases", tags=["cases"])

def record_to_case_response(record) -> CaseResponse:
    node = record["c"]
    properties = dict(node)
    
    # Neo4j DateTime object or ISO string conversion
    created_at_val = properties.get("createdAt")
    if hasattr(created_at_val, "to_native"):
        # Neo4j DateTime has a to_native() method
        created_at = created_at_val.to_native()
    elif isinstance(created_at_val, str):
        created_at = datetime.fromisoformat(created_at_val.replace("Z", "+00:00"))
    else:
        # Fallback to current time if missing or unrecognized
        created_at = datetime.now(timezone.utc)
        
    case_id_val = properties.get("id")
    case_id = str(case_id_val) if case_id_val is not None else ""

    case_name_val = properties.get("name")
    case_name = str(case_name_val) if case_name_val is not None else "Không có tên"
        
    return CaseResponse(
        id=case_id,
        name=case_name,
        description=properties.get("description"),
        createdAt=created_at
    )

@router.get("", response_model=List[CaseResponse])
def get_cases(session: Session = Depends(get_db_session)):
    query = "MATCH (c:Case) RETURN c ORDER BY c.createdAt DESC"
    result = session.run(query)
    cases = []
    for record in result:
        cases.append(record_to_case_response(record))
    return cases

@router.post("", response_model=CaseResponse, status_code=201)
def create_case(
    case_data: CaseCreate,
    seed: bool = Query(False, description="Tự động nạp dữ liệu mẫu"),
    session: Session = Depends(get_db_session)
):
    case_id = str(uuid.uuid4())
    # Use standard ISO string for compatibility and query simplicity
    created_at_str = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    
    # Create the Case node
    query = """
    CREATE (c:Case {
        id: $id,
        name: $name,
        description: $description,
        createdAt: datetime($createdAt)
    })
    RETURN c
    """
    result = session.run(
        query,
        id=case_id,
        name=case_data.name,
        description=case_data.description,
        createdAt=created_at_str
    )
    
    record = result.single()
    if not record:
        raise HTTPException(status_code=500, detail="Không thể tạo vụ án")
        
    case_response = record_to_case_response(record)
    
    # Seeding demo data if requested
    if seed:
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
        session.run(seed_query, case_id=case_id)
        
    return case_response

@router.patch("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: str,
    case_data: CaseUpdate,
    session: Session = Depends(get_db_session)
):
    # Verify case exists first
    check_query = "MATCH (c:Case {id: $case_id}) RETURN c"
    check_result = session.run(check_query, case_id=case_id)
    if not check_result.peek():
        raise HTTPException(status_code=404, detail="Không tìm thấy vụ án")
        
    provided = case_data.model_dump(exclude_unset=True)
    updates = []
    params = {"case_id": case_id}
    
    for key, val in provided.items():
        updates.append(f"c.{key} = ${key}")
        params[key] = val
        
    if updates:
        query = f"MATCH (c:Case {{id: $case_id}}) SET {', '.join(updates)} RETURN c"
    else:
        query = "MATCH (c:Case {id: $case_id}) RETURN c"
        
    result = session.run(query, **params)
    record = result.single()
    return record_to_case_response(record)

@router.delete("/{case_id}")
def delete_case(case_id: str, session: Session = Depends(get_db_session)):
    # Verify case exists first
    check_query = "MATCH (c:Case {id: $case_id}) RETURN c"
    check_result = session.run(check_query, case_id=case_id)
    if not check_result.peek():
        raise HTTPException(status_code=404, detail="Không tìm thấy vụ án")
        
    # Delete all nodes and relationships with matching caseId
    delete_nodes_query = "MATCH (n) WHERE n.caseId = $case_id DETACH DELETE n"
    session.run(delete_nodes_query, case_id=case_id)
    
    # Delete the Case node itself
    delete_case_query = "MATCH (c:Case {id: $case_id}) DETACH DELETE c"
    session.run(delete_case_query, case_id=case_id)
    
    return {"message": f"Đã xóa vụ án {case_id} thành công"}

@router.get("/{case_id}/graph")
def get_case_graph(case_id: str, session: Session = Depends(get_db_session)):
    # Verify case exists first
    check_query = "MATCH (c:Case {id: $case_id}) RETURN c"
    check_result = session.run(check_query, case_id=case_id)
    if not check_result.peek():
        raise HTTPException(status_code=404, detail="Không tìm thấy vụ án")
        
    nodes = []
    edges = []
    node_ids = set()
    edge_ids = set()
    
    # Query to fetch all nodes in the case, and optional relationships matching caseId
    query = """
    MATCH (n) WHERE n.caseId = $case_id
    OPTIONAL MATCH (n)-[r]->(m) WHERE r.caseId = $case_id AND m.caseId = $case_id
    RETURN n, r, m
    """
    result = session.run(query, case_id=case_id)
    
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
