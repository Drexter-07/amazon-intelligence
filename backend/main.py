from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routers import review_analytics

app = FastAPI(
    title="Amazon Market Intelligence API",
    description="Powers the Pixii Amazon Market Intelligence dashboard using ScrapingBee and Claude",
    version="2.0.0",
)

# ── CORS — allow Next.js dev server and production ────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review_analytics.router, prefix="/api")

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "oxylabs_configured": bool(os.getenv("OXYLABS_USERNAME")),
        "claude_key_set": bool(os.getenv("ANTHROPIC_API_KEY")),
    }
