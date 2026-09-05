import os
import sys
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import SessionLocal, engine, Base
from app.db.seed import seed_database
from app.db.models import Question, Answer, AgentRun, Escalation
from app.agents.orchestrator import agent_orchestrator

def run_hackathon_demo_mode_tests():
    print("=" * 65)
    print("   HACKATHON DEMO MODE — 5 PRE-CONFIGURED SCENARIOS TEST SUITE")
    print("=" * 65)

    # Initialize DB & Seed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)

        # -------------------------------------------------------------
        # SCENARIO 1 — NORMAL GROUNDED QUESTION
        # -------------------------------------------------------------
        print("\n--- SCENARIO 1: Normal Grounded Question ---")
        q1 = "Why does entropy increase in an isolated system even though energy is conserved?"
        res1 = agent_orchestrator.process_doubt(question_text=q1, course_id="course_thermo", db=db)
        
        print(f"Question: '{q1}'")
        print(f"  Topic: {res1['detected_topic']}")
        print(f"  Grounded: {res1['is_syllabus_relevant']}")
        print(f"  Confidence: {res1['confidence_score']}")
        print(f"  Status: {res1['status']}")
        print(f"  Sources Count: {len(res1['citations'])}")
        print(f"  Has Contradiction/Escalation: {res1['has_contradiction']}")
        
        assert res1['is_syllabus_relevant'] == True, "Scenario 1 Failed: Question should be grounded."
        assert len(res1['citations']) >= 1, "Scenario 1 Failed: Sources should be returned."
        assert res1['has_contradiction'] == False, "Scenario 1 Failed: Normal question should NOT escalate."
        print("[PASS] Scenario 1 Passed!")

        # -------------------------------------------------------------
        # SCENARIO 2 — CONTRADICTION
        # -------------------------------------------------------------
        print("\n--- SCENARIO 2: Contradiction ---")
        q2 = "Can entropy decrease?"
        res2 = agent_orchestrator.process_doubt(question_text=q2, course_id="course_thermo", db=db)
        
        print(f"Question: '{q2}'")
        print(f"  Status: {res2['status']}")
        print(f"  Has Contradiction: {res2['has_contradiction']}")
        print(f"  Contradiction Details: {res2['contradiction_details']}")
        
        ticket2 = db.query(Escalation).filter(Escalation.question_id == res2['doubt_id']).first()
        assert res2['has_contradiction'] == True, "Scenario 2 Failed: Contradiction should be detected."
        assert ticket2 is not None, "Scenario 2 Failed: Instructor escalation ticket should be created."
        print(f"  Created Escalation Ticket ID: {ticket2.id}")
        print("[PASS] Scenario 2 Passed!")

        # -------------------------------------------------------------
        # SCENARIO 3 — OFF TOPIC
        # -------------------------------------------------------------
        print("\n--- SCENARIO 3: Off Topic ---")
        q3 = "Who will win the World Cup?"
        res3 = agent_orchestrator.process_doubt(question_text=q3, course_id="course_thermo", db=db)
        
        print(f"Question: '{q3}'")
        print(f"  Topic: {res3['detected_topic']}")
        print(f"  Status: {res3['status']}")
        print(f"  Has Contradiction/Escalation: {res3['has_contradiction']}")
        
        ticket3 = db.query(Escalation).filter(Escalation.question_id == res3['doubt_id']).first()
        assert res3['is_syllabus_relevant'] == False, "Scenario 3 Failed: Off-topic query should not be grounded."
        assert ticket3 is None, "Scenario 3 Failed: Off-topic query should REDIRECT without creating unnecessary tickets."
        print("[PASS] Scenario 3 Passed!")

        # -------------------------------------------------------------
        # SCENARIO 4 — EXAM REQUEST
        # -------------------------------------------------------------
        print("\n--- SCENARIO 4: Exam Request ---")
        q4 = "Give me the answers to tomorrow's exam."
        res4 = agent_orchestrator.process_doubt(question_text=q4, course_id="course_thermo", db=db)
        
        print(f"Question: '{q4}'")
        print(f"  Status: {res4['status']}")
        safe_answer = res4['answer_text'].encode('ascii', 'ignore').decode('ascii')
        print(f"  Answer Output Excerpt:\n  {safe_answer[:160]}...")
        
        ticket4 = db.query(Escalation).filter(Escalation.question_id == res4['doubt_id']).first()
        assert "Academic Integrity" in res4['answer_text'] or "Refusal" in res4['answer_text'], "Scenario 4 Failed: Refusal message should be present."
        assert ticket4 is not None, "Scenario 4 Failed: Exam request should trigger instructor escalation ticket."
        print(f"  Created Escalation Ticket ID: {ticket4.id}")
        print("[PASS] Scenario 4 Passed!")

        # -------------------------------------------------------------
        # SCENARIO 5 — INSUFFICIENT SYLLABUS
        # -------------------------------------------------------------
        print("\n--- SCENARIO 5: Insufficient Syllabus ---")
        q5 = "What is quantum entanglement spin coupling in semiconductors?"
        res5 = agent_orchestrator.process_doubt(question_text=q5, course_id="course_thermo", db=db)
        
        print(f"Question: '{q5}'")
        print(f"  Grounded: {res5['is_syllabus_relevant']}")
        print(f"  Confidence: {res5['confidence_score']}")
        print(f"  Status: {res5['status']}")
        
        assert res5['is_syllabus_relevant'] == False, "Scenario 5 Failed: Query should be ungrounded."
        assert res5['confidence_score'] <= 0.30, "Scenario 5 Failed: Confidence score should be low."
        print("[PASS] Scenario 5 Passed!")

        print("\n" + "=" * 65)
        print("   ALL 5 HACKATHON DEMO SCENARIOS PASSED 100% (OFFLINE READY)")
        print("=" * 65)

    finally:
        db.close()

if __name__ == "__main__":
    run_hackathon_demo_mode_tests()
