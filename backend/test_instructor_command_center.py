import os
import sys
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import SessionLocal, engine, Base
from app.db.seed import seed_database
from app.api.routes.instructor import (
    get_overview_metrics,
    get_analytics_details,
    get_escalations,
    perform_ticket_action,
    get_course_documents
)

def run_instructor_command_center_test():
    print("=" * 65)
    print("   INSTRUCTOR COMMAND CENTER — ENDPOINTS & METRICS TEST SUITE")
    print("=" * 65)

    # Initialize DB & Seed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)

        # -------------------------------------------------------------
        # TEST 1: Overview Metrics
        # -------------------------------------------------------------
        print("\n--- TEST 1: Instructor Overview Metrics ---")
        overview = get_overview_metrics(course_id="course_thermo", db=db)
        print(f"Students Count: {overview['students_count']}")
        print(f"Questions Today: {overview['questions_today']}")
        print(f"AI Resolution Rate: {overview['ai_resolution_rate']}%")
        print(f"Pending Escalations: {overview['escalated_count']}")
        print(f"Average Confidence: {overview['avg_confidence']}")
        print(f"Low Confidence Count: {overview['low_confidence_count']}")
        print(f"Escalation Rate: {overview['escalation_rate']}%")
        
        assert overview['students_count'] >= 1
        assert overview['ai_resolution_rate'] >= 0.0
        assert overview['avg_confidence'] > 0.50
        print("[PASS] Test 1 (Overview Metrics) Passed!")

        # -------------------------------------------------------------
        # TEST 2: Doubt Analytics Details
        # -------------------------------------------------------------
        print("\n--- TEST 2: Doubt Analytics Details ---")
        analytics = get_analytics_details(course_id="course_thermo", db=db)
        print(f"Total Doubts Tracked: {analytics['total_questions']}")
        print(f"Most Confusing Topic: {analytics.get('most_confusing_topic')}")
        print(f"Top Topics Count: {len(analytics['top_topics'])}")
        print(f"Module Breakdown Count: {len(analytics['questions_per_module'])}")
        
        assert analytics['total_questions'] >= 1
        assert len(analytics['top_topics']) >= 1
        print("[PASS] Test 2 (Doubt Analytics Details) Passed!")

        # -------------------------------------------------------------
        # TEST 3: Escalation Queue Triage Payload
        # -------------------------------------------------------------
        print("\n--- TEST 3: Escalation Queue Triage Payload ---")
        tickets = get_escalations(course_id="course_thermo", status_filter="ALL", db=db)
        print(f"Escalation Tickets Found: {len(tickets)}")
        
        assert len(tickets) >= 1, "Test 3 Failed: Escalation tickets should exist."
        sample_ticket = tickets[0]
        print(f"Sample Ticket ID: {sample_ticket['id']}")
        print(f"Question: '{sample_ticket['student_question']}'")
        print(f"Topic: {sample_ticket['topic']} | Module: {sample_ticket['module']}")
        print(f"Retrieved Sources: {sample_ticket['retrieved_sources']}")
        print(f"Reason: {sample_ticket['reason']}")
        
        assert "student_question" in sample_ticket
        assert "retrieved_sources" in sample_ticket
        assert "suggested_answer" in sample_ticket
        print("[PASS] Test 3 (Escalation Queue Triage Payload) Passed!")

        # -------------------------------------------------------------
        # TEST 4: Ticket Triage Action Execution
        # -------------------------------------------------------------
        print("\n--- TEST 4: Ticket Triage Action Execution ---")
        action_res = perform_ticket_action(
            escalation_id=sample_ticket['id'],
            req={"action": "approve_answer", "edited_answer": "Approved by Dr. Vance."},
            db=db
        )
        print(f"Action Execution Result: {action_res}")
        assert action_res['status'] == "success"
        assert action_res['action'] == "approve_answer"
        print("[PASS] Test 4 (Ticket Triage Action Execution) Passed!")

        # -------------------------------------------------------------
        # TEST 5: Knowledge Base Course Documents
        # -------------------------------------------------------------
        print("\n--- TEST 5: Knowledge Base Course Documents ---")
        docs = get_course_documents(course_id="course_thermo", db=db)
        print(f"Course Documents Count: {len(docs)}")
        for d in docs:
            print(f"  Doc: {d['title']} ({d['file_type']}) - Status: {d['status']} ({d['chunk_count']} Chunks)")
            assert d['status'] in ["Indexed", "Processed"]
            assert d['chunk_count'] >= 1
            
        assert len(docs) >= 1
        print("[PASS] Test 5 (Knowledge Base Course Documents) Passed!")

        print("\n" + "=" * 65)
        print("   ALL 5 INSTRUCTOR COMMAND CENTER TESTS PASSED 100%")
        print("=" * 65)

    finally:
        db.close()

if __name__ == "__main__":
    run_instructor_command_center_test()
