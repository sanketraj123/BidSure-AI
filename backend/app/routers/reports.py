from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime

router = APIRouter()

@router.post("/summary")
def report_summary(result: dict):
    return JSONResponse({
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "report_type": "Synthetic Compliance Demonstration",
        "result": result
    })
