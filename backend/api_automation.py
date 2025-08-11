from fastapi import APIRouter
from backend.automation import wedge_automation_job, vip_automation_job
from backend.perk_automation import buy_wedge, buy_vip, buy_upload_credit

router = APIRouter()

# Add automation-related endpoints here, e.g.:
# @router.post("/automation/wedge")
# def ...
