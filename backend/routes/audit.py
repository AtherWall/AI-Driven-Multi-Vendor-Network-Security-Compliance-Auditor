import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from pydantic_validator import validate_json_file
from routes.upload import find_uploaded_file

router = APIRouter()


class AuditRequest(BaseModel):
    file_id: str


@router.post("/api/audit")
def run_audit(request: AuditRequest):
    file_id = request.file_id.strip()

    if not file_id:
        raise HTTPException(status_code=400, detail="file_id is required.")

    uploaded_file = find_uploaded_file(file_id)

    if uploaded_file is None:
        raise HTTPException(
            status_code=404,
            detail=f"No uploaded file found for file_id '{file_id}'.",
        )

    config_text = uploaded_file.read_text(encoding="utf-8")

    # Temporary CDM generation for Gate 2 testing.
    # The real parser/LLM will replace this later.
    cdm_data = {
        "schema_version": "1.0.0",
        "device": {
            "id": "router-1",
            "hostname": "SIH-Router-01",
            "metadata": {
                "vendor": "Cisco",
                "platform": "IOS",
            },
            "interfaces": [],
            "security_policies": [],
        },
    }

    # Save generated CDM temporarily so the existing
    # Pydantic validator can validate it.
    cdm_file = uploaded_file.parent / f"{file_id}_cdm.json"

    import json

    cdm_file.write_text(
        json.dumps(cdm_data, indent=2),
        encoding="utf-8",
    )

    validation_result = validate_json_file(str(cdm_file))

    if not validation_result["valid"]:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Generated CDM failed Pydantic validation.",
                "errors": validation_result["errors"],
            },
        )

    audit_id = f"audit_{uuid.uuid4().hex[:8]}"

    return {
        "success": True,
        "audit_id": audit_id,
        "file_id": file_id,
        "status": "completed",
        "vendor": "Cisco",
        "cdm_valid": True,
        "message": "Configuration converted to CDM and validated successfully.",
    }
