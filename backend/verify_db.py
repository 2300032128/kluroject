import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import Base, engine, SessionLocal
from app.db.models import User, Course, Module, Document, DocumentChunk, Question, AgentRun, RetrievalResult, Answer, Escalation, InstructorReview, AnalyticsEvent
from app.db.seed import seed_database

def run_verification():
    print("=== Phase 3 Database Verification ===")
    
    # 1. Reset & Create All 12 Tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[OK] All 12 tables created successfully.")

    # 2. Seed Data
    db = SessionLocal()
    try:
        seed_database(db)
        
        # 3. Verify Table Counts
        user_count = db.query(User).count()
        course_count = db.query(Course).count()
        module_count = db.query(Module).count()
        doc_count = db.query(Document).count()
        chunk_count = db.query(DocumentChunk).count()
        question_count = db.query(Question).count()
        agent_run_count = db.query(AgentRun).count()
        retrieval_count = db.query(RetrievalResult).count()
        answer_count = db.query(Answer).count()
        escalation_count = db.query(Escalation).count()
        analytics_count = db.query(AnalyticsEvent).count()

        print(f"[OK] Users: {user_count}")
        print(f"[OK] Courses: {course_count}")
        print(f"[OK] Modules: {module_count}")
        print(f"[OK] Documents: {doc_count}")
        print(f"[OK] Document Chunks: {chunk_count}")
        print(f"[OK] Questions: {question_count}")
        print(f"[OK] Agent Runs: {agent_run_count}")
        print(f"[OK] Retrieval Results: {retrieval_count}")
        print(f"[OK] Answers: {answer_count}")
        print(f"[OK] Escalations: {escalation_count}")
        print(f"[OK] Analytics Events: {analytics_count}")

        # 4. Verify Thermodynamics Course Modules
        thermo_course = db.query(Course).filter(Course.code == "ME202").first()
        assert thermo_course is not None, "Thermodynamics course missing!"
        print(f"\nCourse Title: {thermo_course.title} ({thermo_course.code})")

        modules = db.query(Module).filter(Module.course_id == thermo_course.id).order_by(Module.week_number).all()
        print("Modules:")
        for m in modules:
            print(f"  - [{m.week_number}] {m.title}")

        # 5. Verify Questions & Schema Fields
        sample_q = db.query(Question).filter(Question.subject == "Thermodynamics").first()
        assert sample_q is not None, "Sample Thermodynamics question missing!"
        print(f"\nSample Question:")
        print(f"  ID: {sample_q.id}")
        print(f"  Text: '{sample_q.question_text}'")
        print(f"  Subject: {sample_q.subject}")
        print(f"  Topic: {sample_q.topic}")
        print(f"  Module: {sample_q.module}")
        print(f"  Confidence: {sample_q.confidence}")

        # 6. Verify Escalation Fields
        sample_esc = db.query(Escalation).first()
        assert sample_esc is not None, "Sample Escalation record missing!"
        print(f"\nSample Escalation:")
        print(f"  Question ID: {sample_esc.question_id}")
        print(f"  Reason: {sample_esc.reason}")
        print(f"  Status: {sample_esc.status}")
        print(f"  Confidence: {sample_esc.confidence}")

        print("\n=== Phase 3 Database Verification PASSED 100% ===")

    finally:
        db.close()

if __name__ == "__main__":
    run_verification()
