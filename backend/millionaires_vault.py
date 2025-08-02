import requests
from fastapi import APIRouter, Request
from bs4 import BeautifulSoup
from fastapi.responses import JSONResponse

router = APIRouter()

MAM_BASE_URL = "https://www.myanonamouse.net"
POT_URL = f"{MAM_BASE_URL}/millionaires/pot.php"
DONATE_URL = f"{MAM_BASE_URL}/millionaires/donate.php"

# TODO: Use session/cookies from config or env
COOKIES = {}  # Fill with your session cookies for authentication

@router.post("/api/automation/millionaires_vault")
async def trigger_millionaires_vault(request: Request):
    """
    Scrape the pot page, check if donation is allowed, and donate the specified amount if possible.
    """
    try:
        data = await request.json()
        amount = int(data.get("amount", 2000))
        if not (100 <= amount <= 2000):
            return {"success": False, "error": "Amount must be between 100 and 2000"}
        resp = requests.get(POT_URL, cookies=COOKIES)
        if resp.status_code != 200:
            return JSONResponse({"success": False, "error": "Failed to load pot page"}, status_code=500)
        soup = BeautifulSoup(resp.text, "html.parser")
        # Check if already donated today
        if soup.find(string=lambda t: "already donated" in t.lower()):
            return {"success": False, "error": "Already donated today"}
        # Find the donation form and submit
        donate_form = soup.find("form", {"action": "/millionaires/donate.php"})
        if not donate_form:
            return {"success": False, "error": "Donation form not found"}
        # The form likely needs the amount as a GET or POST param, e.g. /millionaires/donate.php?amount=2000
        donate_url = f"{DONATE_URL}?amount={amount}"
        donate_resp = requests.get(donate_url, cookies=COOKIES)
        if donate_resp.status_code == 200:
            return {"success": True}
        else:
            return {"success": False, "error": "Donation failed"}
    except Exception as e:
        return {"success": False, "error": str(e)}
