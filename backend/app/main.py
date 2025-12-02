from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import segment, warp
import os

app = FastAPI()

# Allow CORS for all origins for MVP ease; lock down in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(segment.router)
app.include_router(warp.router)

@app.get("/")
def read_root():
    return {"status": "AutoMapper Backend Running", "docs": "/docs"}
