from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db, Base, engine
from app.core.demo_seed import seed_demo_data
from app.core.config import settings

router = APIRouter(prefix="/system", tags=["system"])

@router.get("/health")
def system_health():
    return {
        "status": "online",
        "app_name": settings.PROJECT_NAME,
        "demo_mode": settings.DEMO_MODE,
        "has_gemini_key": bool(settings.GEMINI_API_KEY)
    }

@router.post("/seed-demo")
def trigger_seed_demo(db: Session = Depends(get_db)):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_demo_data(db)
    return {"status": "success", "message": "Database reset and CS101 demo scenario re-seeded!"}
