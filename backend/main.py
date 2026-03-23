from fastapi import FastAPI, HTTPException, Header, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import httpx
import os
import time
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="HRL User Hub (Unified SOP)", version="1.0.0")

# Central Access Manager (Internal Docker Network)
ACCESS_MANAGER_URL = os.getenv("ACCESS_MANAGER_URL", "http://hrl-webhook-hub-backend:9107")

# Standard CORS for Premium SaaS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logger Middleware - CTO Requirement
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    print(f"REQUEST: {request.method} {request.url.path} | STATUS: {response.status_code} | ELAPSED: {duration:.4f}s")
    return response

@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "user-hub", "arch": "Unified HRL"}

@app.get("/api/auth")
async def get_auth_profile(email: str):
    """
    Standardowy endpoint autoryzacji - Proxy do Access Managera.
    """
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{ACCESS_MANAGER_URL}/api/auth/profile", params={"email": email})
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail="Auth Service Error")
            return resp.json()
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Access Manager Connection Error: {str(e)}")

@app.post("/api/publish/submit")
async def submit_release(data: dict, authorization: str = Header(None)):
    """
    Submission wydawniczy - Wzorcowa implementacja akcji kredytowej.
    """
    email = data.get("email") # To zostanie wyciągnięte z JWT (Krok SSO)
    if not email:
        raise HTTPException(status_code=400, detail="User email required for submission")

    # SaaS Principle: Pre-check & Consume Credits (Submission cost = 10 credits)
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{ACCESS_MANAGER_URL}/api/credits/consume",
                params={"email": email, "amount": 10}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=402, detail="Insufficient credits for Audio Publication")
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Access Manager Connection Error: {str(e)}")

    return {
        "status": "success",
        "message": "Release submitted to HRL Distribution Hub",
        "reference_id": f"HRL-D-{int(time.time())}"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9101, reload=True)
