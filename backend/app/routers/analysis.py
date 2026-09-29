from fastapi import APIRouter
from pydantic import BaseModel
from app.services.compliance_engine import analyze
from app.db import save_analysis
import json

router = APIRouter()

class AnalysisRequest(BaseModel):
    extracted: dict
    requirements: list[dict] | None = None

@router.post("/run")
def run_analysis(payload: AnalysisRequest):
    result = analyze(payload.extracted, payload.requirements)
    save_analysis(json.dumps(result))
    return result
