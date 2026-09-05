from sqlalchemy.orm import Session
from app.db.seed import seed_database

def seed_demo_data(db: Session):
    seed_database(db)
