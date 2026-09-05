from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.db.database import Base, engine, SessionLocal
from app.core.exceptions import (
    EduAgentException,
    eduagent_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    global_exception_handler
)
from app.api import health
from app.api.routes import student, instructor, materials, system
from app.core.demo_seed import seed_demo_data

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI Teaching Assistant Agent Platform with RAG Grounding & Demo Mode",
    version="1.0.0"
)

# Exception Handlers
app.add_exception_handler(EduAgentException, eduagent_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Health Check Route (GET /health)
app.include_router(health.router)

# API v1 Routes
app.include_router(student.router, prefix=settings.API_V1_STR)
app.include_router(instructor.router, prefix=settings.API_V1_STR)
app.include_router(materials.router, prefix=settings.API_V1_STR)
app.include_router(system.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    print(f"[{settings.PROJECT_NAME}] Server running. DEMO_MODE={settings.DEMO_MODE}")

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "demo_mode": settings.DEMO_MODE,
        "health_check": "/health",
        "docs_url": "/docs"
    }
