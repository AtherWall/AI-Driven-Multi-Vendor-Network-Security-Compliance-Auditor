from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class RemediateRequest(BaseModel):
    audit_id: str
    finding_id: str


@router.post("/api/remediate")
def remediate_finding(request: RemediateRequest):
    audit_id = request.audit_id.strip()
    finding_id = request.finding_id.strip()

    if not audit_id:
        raise HTTPException(status_code=400, detail="audit_id is required.")
    if not finding_id:
        raise HTTPException(status_code=400, detail="finding_id is required.")

    # Placeholder: the real AI/remediation engine will be connected here later.
    return {
        "success": True,
        "audit_id": audit_id,
        "finding_id": finding_id,
        "recommendation": "Enable secure SSH configuration",
        "status": "recommended",
    }
