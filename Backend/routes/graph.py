from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.get("/api/graph/{audit_id}")
def get_graph(audit_id: str):
    if not audit_id.strip():
        raise HTTPException(status_code=400, detail="audit_id is required.")

    # Placeholder: the real graph engine will replace this mock data later.
    return {
        "success": True,
        "audit_id": audit_id,
        "nodes": [
            {
                "id": "router_1",
                "label": "Cisco Router",
                "type": "device",
            }
        ],
        "edges": [],
    }
