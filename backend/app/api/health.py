from fastapi import APIRouter
from datetime import datetime
from app.core.config import settings
from app.db.database import check_db_connection

router = APIRouter(tags=["health"])

@router.get("/health")
def health_check():
    db_ok = check_db_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "app_name": settings.PROJECT_NAME,
        "demo_mode": settings.DEMO_MODE,
        "database_connected": db_ok,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
