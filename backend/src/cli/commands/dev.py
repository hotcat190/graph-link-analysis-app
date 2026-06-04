from __future__ import annotations

import os
import random
import uuid
import time
from datetime import datetime, timezone
from typing import List, Set, Tuple, Dict
import typer

from database import db

app = typer.Typer(help="Developer utilities for graph generation and performance testing.")

def _run(coro_or_func, *args, **kwargs) -> None:
    # Since our database methods are synchronous (using neo4j synchronous session), 
    # we can run them directly without asyncio.
    coro_or_func(*args, **kwargs)

def get_relationship_details(src_type: str, tgt_type: str) -> tuple[str, str]:
    """Helper to return realistic relationship type and label based on node types."""
    if src_type == "person" and tgt_type == "phone":
        return "SOHUU", "SỞ HỮU"
    elif src_type == "person" and tgt_type == "bank":
        return "SOHUU", "SỞ HỮU"
    elif src_type == "person" and tgt_type == "company":
        if random.random() < 0.4:
            return "CODONG", "CỔ ĐÔNG"
        else:
            return "RUATIEN", "RỬA TIỀN"
    elif src_type == "person" and tgt_type == "person":
        if random.random() < 0.5:
            return "CHUYENTIEN", f"CHUYỂN TIỀN ({random.randint(1, 100)}M)"
        else:
            return "LIEN_HE", "LIÊN HỆ"
    elif src_type == "phone" and tgt_type == "phone":
        return "GOIDIEN", f"GỌI ĐIỆN ({random.randint(1, 45)}p)"
    elif src_type == "bank" and tgt_type == "bank":
        return "CHUYENTIEN", f"CHUYỂN TIỀN ({random.randint(10, 500)}M)"
    elif src_type == "bank" and tgt_type == "company":
        return "RUATIEN", f"RỬA TIỀN ({random.randint(50, 1000)}M)"
    
    # Reverse lookups
    if tgt_type == "person" and src_type == "phone":
        return "SOHUU", "SỞ HỮU"
    if tgt_type == "person" and src_type == "bank":
        return "SOHUU", "SỞ HỮU"
    if tgt_type == "person" and src_type == "company":
        return "RUATIEN", "RỬA TIỀN"
        
    return "LIEN_KET", "LIÊN KẾT"

def _seed_graph(
    case_name: str,
    case_id_opt: str | None,
    nodes_count: int,
    edges_count: int,
    topology: str,
    append: bool,
    neo4j_uri: str,
    neo4j_user: str,
    neo4j_password: str
) -> None:
    # Initialize connection with custom URI/auth
    db.connect(uri=neo4j_uri, user=neo4j_user, password=neo4j_password)
    
    with db.get_session() as session:
        # 1. Look up existing case by name or ID
        existing_case_id = None
        if case_id_opt:
            res = session.run("MATCH (c:Case {id: $id}) RETURN c.id as id", id=case_id_opt)
            record = res.single()
            if record:
                existing_case_id = record["id"]
        else:
            res = session.run("MATCH (c:Case {name: $name}) RETURN c.id as id ORDER BY c.createdAt DESC LIMIT 1", name=case_name)
            record = res.single()
            if record:
                existing_case_id = record["id"]

        case_id = case_id_opt or existing_case_id or str(uuid.uuid4())

        # 2. Reset or resolve case node
        if existing_case_id and not append:
            typer.echo(f"Resetting case '{case_name}' (ID: {case_id}). Deleting existing nodes and edges...")
            session.run("MATCH (n) WHERE n.caseId = $case_id DETACH DELETE n", case_id=case_id)
            session.run("MATCH (c:Case {id: $case_id}) DETACH DELETE c", case_id=case_id)
            existing_case_id = None

        if not existing_case_id or not append:
            created_at_str = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            session.run("""
            CREATE (c:Case {
                id: $id,
                name: $name,
                description: $description,
                createdAt: datetime($createdAt)
            })
            """, id=case_id, name=case_name, description=f"Seeded graph ({topology})", createdAt=created_at_str)
            typer.echo(f"Created Case node: '{case_name}' (ID: {case_id})")
        else:
            typer.echo(f"Appending to existing Case: '{case_name}' (ID: {case_id})")

        # 3. Retrieve existing case nodes and edges (if appending)
        existing_nodes = []
        existing_edges = []
        label_classes = {
            "person": "Person",
            "phone": "Phone",
            "bank": "Bank",
            "company": "Company"
        }

        if append and existing_case_id:
            typer.echo("Fetching existing nodes/edges from Neo4j...")
            res_nodes = session.run("MATCH (n) WHERE n.caseId = $case_id AND NOT n:Case RETURN n.id as id, n.type as type, n.label as label", case_id=case_id)
            for r in res_nodes:
                existing_nodes.append({
                    "id": r["id"],
                    "type": r["type"],
                    "label": r["label"],
                    "label_class": label_classes.get(r["type"], "Person")
                })
            
            res_edges = session.run("MATCH (n)-[r]->(m) WHERE r.caseId = $case_id AND n.caseId = $case_id AND m.caseId = $case_id RETURN n.id as source, m.id as target", case_id=case_id)
            for r in res_edges:
                existing_edges.append((r["source"], r["target"]))
                
            typer.echo(f"Retrieved {len(existing_nodes)} nodes and {len(existing_edges)} edges.")

        # 4. Generate new nodes
        typer.echo(f"Generating {nodes_count} new nodes...")
        new_nodes = []
        
        # Name lists for realistic Vietnamese seed data
        vietnamese_last = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
        vietnamese_middle = ["Văn", "Thị", "Minh", "Hữu", "Thành", "Đức", "Hoàng", "Kim", "Ngọc", "Thu", "Xuân", "Hải", "Phương"]
        vietnamese_first = ["Anh", "Bình", "Cường", "Đức", "Dũng", "Em", "Giang", "Hương", "Hùng", "Hải", "Khánh", "Lâm", "Nam", "Phong", "Quân", "Sơn", "Trang", "Tuấn", "Vy", "Yến"]
        bank_names = ["VCB", "TCB", "BIDV", "CTG", "MBB", "ACB", "VPB", "HDB"]
        company_words = ["Đầu tư", "Thương mại", "Dịch vụ", "Phát triển", "Công nghệ", "Xây dựng", "Xuất nhập khẩu", "Du lịch", "Truyền thông", "Địa ốc"]
        company_names = ["Ánh Dương", "Bình Minh", "Cát Tường", "Đại Nam", "Trường Thành", "Hải Phát", "Vạn An", "Kim Đô", "Phú Quý", "Thịnh Vượng"]
        
        node_types = ["person", "phone", "bank", "company"]

        for i in range(nodes_count):
            ntype = node_types[i % len(node_types)]
            label_class = label_classes[ntype]
            nid = f"seeded-{uuid.uuid4().hex[:12]}"
            
            if ntype == "person":
                label = f"{random.choice(vietnamese_last)} {random.choice(vietnamese_middle)} {random.choice(vietnamese_first)}"
            elif ntype == "phone":
                label = f"09{random.randint(0, 9)}{random.randint(1000000, 9999999)}"
            elif ntype == "bank":
                label = f"Tài khoản {random.choice(bank_names)}: {random.randint(100000000, 9999999999)}"
            else:
                label = f"Công ty {random.choice(company_words)} {random.choice(company_names)}"
                
            new_nodes.append({
                "id": nid,
                "type": ntype,
                "label": label,
                "label_class": label_class
            })

        all_nodes = existing_nodes + new_nodes
        N = len(all_nodes)
        N_existing = len(existing_nodes)
        
        # Map IDs to indices
        node_id_to_idx = {node["id"]: idx for idx, node in enumerate(all_nodes)}
        
        # Populate edge pairs
        edge_pairs = set()
        for src, tgt in existing_edges:
            if src in node_id_to_idx and tgt in node_id_to_idx:
                u_idx = node_id_to_idx[src]
                v_idx = node_id_to_idx[tgt]
                edge_pairs.add((min(u_idx, v_idx), max(u_idx, v_idx)))

        new_edges = []

        def add_new_edge(u_idx: int, v_idx: int) -> bool:
            if u_idx == v_idx:
                return False
            pair = (min(u_idx, v_idx), max(u_idx, v_idx))
            if pair in edge_pairs:
                return False
            edge_pairs.add(pair)
            
            src_node = all_nodes[u_idx]
            tgt_node = all_nodes[v_idx]
            rel_type, rel_label = get_relationship_details(src_node["type"], tgt_node["type"])
            
            new_edges.append({
                "source": src_node["id"],
                "target": tgt_node["id"],
                "type": rel_type,
                "label": rel_label
            })
            return True

        # 5. Generate edges according to topology
        typer.echo(f"Generating edges ({topology} topology)...")
        if topology == "scale-free":
            degrees = [0] * N
            for u, v in edge_pairs:
                degrees[u] += 1
                degrees[v] += 1
                
            # Average degree factor (m edges added per new node)
            m = max(1, min(4, int(edges_count / max(1, nodes_count))))
            
            # Start preferential attachment
            if N_existing == 0:
                m0 = min(4, N)
                for i in range(m0):
                    for j in range(i + 1, m0):
                        if add_new_edge(i, j):
                            degrees[i] += 1
                            degrees[j] += 1
                start_node_idx = m0
            else:
                start_node_idx = N_existing
                
            for i in range(start_node_idx, N):
                total_deg = sum(degrees[:i])
                if total_deg == 0:
                    targets = random.sample(range(i), min(m, i))
                else:
                    targets = []
                    available = list(range(i))
                    while len(targets) < min(m, i):
                        w = [degrees[x] for x in available]
                        if sum(w) == 0:
                            chosen = random.choice(available)
                        else:
                            chosen = random.choices(available, weights=w, k=1)[0]
                        targets.append(chosen)
                        available.remove(chosen)
                        
                for t in targets:
                    if add_new_edge(i, t):
                        degrees[i] += 1
                        degrees[t] += 1
                        
            # Fill remaining edges randomly
            attempts = 0
            while len(new_edges) < edges_count and attempts < edges_count * 10:
                attempts += 1
                u = random.randint(0, N - 1)
                v = random.randint(0, N - 1)
                add_new_edge(u, v)

        elif topology == "clustered":
            K = 5
            cluster_size = max(1, N // K)
            node_clusters = [i // cluster_size for i in range(N)]
            
            intra_target = int(edges_count * 0.9)
            
            # Intra-cluster edges (90%)
            attempts = 0
            while len(new_edges) < intra_target and attempts < edges_count * 10:
                attempts += 1
                cluster = random.randint(0, K - 1)
                start_idx = cluster * cluster_size
                end_idx = min(N - 1, start_idx + cluster_size - 1)
                if end_idx - start_idx < 1:
                    continue
                u = random.randint(start_idx, end_idx)
                v = random.randint(start_idx, end_idx)
                add_new_edge(u, v)
                
            # Inter-cluster edges (10%)
            attempts = 0
            while len(new_edges) < edges_count and attempts < edges_count * 10:
                attempts += 1
                u = random.randint(0, N - 1)
                v = random.randint(0, N - 1)
                if node_clusters[u] != node_clusters[v]:
                    add_new_edge(u, v)
                    
        else: # random
            attempts = 0
            while len(new_edges) < edges_count and attempts < edges_count * 10:
                attempts += 1
                u = random.randint(0, N - 1)
                v = random.randint(0, N - 1)
                add_new_edge(u, v)

        # 6. Bulk Insert Nodes
        typer.echo(f"Bulk inserting {len(new_nodes)} nodes...")
        nodes_by_label = {"Person": [], "Phone": [], "Bank": [], "Company": []}
        for node in new_nodes:
            nodes_by_label[node["label_class"]].append({
                "id": node["id"],
                "label": node["label"],
                "type": node["type"],
                "caseId": case_id
            })
            
        t0_nodes = time.perf_counter()
        for label, batch in nodes_by_label.items():
            if batch:
                session.run(f"""
                UNWIND $batch as row
                CREATE (n:{label} {{id: row.id, label: row.label, type: row.type, caseId: row.caseId}})
                """, batch=batch)
        t1_nodes = time.perf_counter()
        typer.echo(f"Inserted nodes in {(t1_nodes - t0_nodes) * 1000:.2f} ms")

        # 7. Bulk Insert Edges
        typer.echo(f"Bulk inserting {len(new_edges)} edges...")
        node_id_to_label = {node["id"]: node["label_class"] for node in all_nodes}
        
        edges_grouped = {}
        for edge in new_edges:
            src_label = node_id_to_label[edge["source"]]
            tgt_label = node_id_to_label[edge["target"]]
            rel_type = edge["type"]
            
            group_key = (src_label, tgt_label, rel_type)
            if group_key not in edges_grouped:
                edges_grouped[group_key] = []
            edges_grouped[group_key].append({
                "source": edge["source"],
                "target": edge["target"],
                "label": edge["label"],
                "caseId": case_id
            })

        t0_edges = time.perf_counter()
        for (src_label, tgt_label, rel_type), batch in edges_grouped.items():
            if batch:
                session.run(f"""
                UNWIND $batch as row
                MATCH (src:{src_label} {{id: row.source, caseId: row.caseId}})
                MATCH (tgt:{tgt_label} {{id: row.target, caseId: row.caseId}})
                CREATE (src)-[r:{rel_type} {{label: row.label, caseId: row.caseId}}]->(tgt)
                """, batch=batch)
        t1_edges = time.perf_counter()
        typer.echo(f"Inserted edges in {(t1_edges - t0_edges) * 1000:.2f} ms")
        
        typer.echo(f"\nSuccessfully seeded Case '{case_name}' (ID: {case_id})!")
        typer.echo(f"Total new nodes: {len(new_nodes)}")
        typer.echo(f"Total new edges: {len(new_edges)}")

    db.close()

@app.command()
def seed(
    case_name: str = typer.Option(..., "--name", "-n", help="Tên vụ án cần seed (case name)"),
    case_id: str = typer.Option(None, "--case-id", help="ID của vụ án (tùy chọn)"),
    nodes: int = typer.Option(500, "--nodes", help="Số lượng node cần seed"),
    edges: int = typer.Option(1500, "--edges", help="Số lượng edge cần seed"),
    topology: str = typer.Option("scale-free", "--topology", help="Cấu trúc đồ thị: scale-free, clustered, random"),
    append: bool = typer.Option(False, "--append", "-a", help="Thêm vào vụ án hiện tại thay vì reset"),
    neo4j_uri: str = typer.Option(os.getenv("NEO4J_URI", "bolt://localhost:7687"), "--neo4j-uri", help="URI kết nối Neo4j"),
    neo4j_user: str = typer.Option(os.getenv("NEO4J_USER", "neo4j"), "--neo4j-user", help="User Neo4j"),
    neo4j_password: str = typer.Option(os.getenv("NEO4J_PASSWORD", "password"), "--neo4j-password", help="Password Neo4j"),
) -> None:
    """Seed project with generated graph."""
    if topology not in ("scale-free", "clustered", "random"):
        typer.echo(f"Error: Unknown topology '{topology}'")
        raise typer.Exit(1)
        
    _run(_seed_graph, case_name, case_id, nodes, edges, topology, append, neo4j_uri, neo4j_user, neo4j_password)
