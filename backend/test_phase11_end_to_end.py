import os
import sys
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import SessionLocal, engine, Base
from app.db.seed import seed_database
from app.db.models import Question, Answer, AgentRun, Escalation, AnalyticsEvent
from app.agents.orchestrator import agent_orchestrator
from app.api.routes.student import get_agent_trace

def run_phase11_end_to_end_test():
    print("=" * 60)
    print("   PHASE 11: END-TO-END 5-AGENT WORKFLOW & TRACE TEST SUITE")
    print("=" * 60)

    # Initialize DB & Seed
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        
        # -------------------------------------------------------------
        # TEST 1: Normal Grounded Conceptual Question
        # -------------------------------------------------------------
        print("\n--- TEST 1: Normal Grounded Conceptual Question ---")
        q1 = "Why does entropy increase in an isolated system?"
        res1 = agent_orchestrator.process_doubt(question_text=q1, course_id="course_thermo", db=db)
        
        print(f"Question: '{q1}'")
        print(f"Doubt ID: {res1['doubt_id']}")
        print(f"Detected Topic: {res1['detected_topic']}")
        print(f"Is Syllabus Relevant: {res1['is_syllabus_relevant']}")
        print(f"Confidence Score: {res1['confidence_score']}")
        print(f"Status: {res1['status']}")
        print(f"Total Latency: {res1['total_latency_ms']} ms")
        print(f"Agent Runs Logged: {len(res1['agent_runs'])}")
        
        assert res1['is_syllabus_relevant'] == True, "Test 1 Failed: Question should be grounded."
        assert res1['confidence_score'] >= 0.65, "Test 1 Failed: Confidence score should be high."
        assert len(res1['agent_runs']) == 6, f"Test 1 Failed: Expected 6 agent run logs, got {len(res1['agent_runs'])}."
        
        # Verify Agent Runs in DB
        db_runs = db.query(AgentRun).filter(AgentRun.question_id == res1['doubt_id']).order_by(AgentRun.step_index).all()
        assert len(db_runs) == 6, f"Test 1 DB Check Failed: Expected 6 DB rows in agent_runs, got {len(db_runs)}."
        
        step_names = [r.agent_name for r in db_runs]
        print("Logged Agents Sequence:")
        for r in db_runs:
            print(f"  Step {r.step_index}: [{r.status.upper()}] {r.agent_name} ({r.execution_time_ms} ms) - {r.action}")
            assert r.input_data is not None, f"Step {r.step_index} missing input_data"
            assert r.output_data is not None, f"Step {r.step_index} missing output_data"
            
        assert "Student Interaction Agent" in step_names[0]
        assert "Syllabus Grounding Agent" in step_names[1]
        assert "Contradiction Analysis" in step_names[2]
        assert "Escalation Agent" in step_names[3]
        assert "Answer Composition Agent" in step_names[4]
        assert "Doubt Analytics Agent" in step_names[5]
        
        print("[PASS] Test 1 (Normal Grounded Conceptual Question) Passed!")

        # -------------------------------------------------------------
        # TEST 2: Agent Trace API Verification
        # -------------------------------------------------------------
        print("\n--- TEST 2: Agent Trace API Verification ---")
        trace_api_res = get_agent_trace(question_id=res1['doubt_id'], db=db)
        print(f"Fetched Trace API for Question ID: {trace_api_res['question_id']}")
        print(f"Subject: {trace_api_res['subject']} | Topic: {trace_api_res['topic']}")
        print(f"Total API Trace Latency: {trace_api_res['total_latency_ms']} ms")
        print(f"API Agent Runs Count: {len(trace_api_res['agent_runs'])}")
        
        assert trace_api_res['question_id'] == res1['doubt_id']
        assert len(trace_api_res['agent_runs']) == 6
        assert trace_api_res['agent_runs'][0]['agent_name'] == "Student Interaction Agent"
        print("[PASS] Test 2 (Agent Trace API Verification) Passed!")

        # -------------------------------------------------------------
        # TEST 3: Conflicting Specifications Query (Escalation Trigger)
        # -------------------------------------------------------------
        print("\n--- TEST 3: Conflicting Specifications Query (Escalation Trigger) ---")
        q3 = "In Lab 3, do we use constant heat capacity or polynomial heat capacity?"
        res3 = agent_orchestrator.process_doubt(question_text=q3, course_id="course_thermo", db=db)
        
        print(f"Question: '{q3}'")
        print(f"Status: {res3['status']}")
        print(f"Has Contradiction: {res3['has_contradiction']}")
        print(f"Contradiction Details: {res3['contradiction_details']}")
        
        assert res3['status'] == "escalated", f"Test 3 Failed: Status should be 'escalated', got {res3['status']}"
        assert res3['has_contradiction'] == True, "Test 3 Failed: has_contradiction should be True"
        
        # Verify Escalation Ticket created in DB
        ticket = db.query(Escalation).filter(Escalation.question_id == res3['doubt_id']).first()
        assert ticket is not None, "Test 3 Failed: Escalation ticket should exist in DB"
        print(f"Created Escalation Ticket ID: {ticket.id} | Status: {ticket.status}")
        
        print("[PASS] Test 3 (Conflicting Specifications Query) Passed!")

        # -------------------------------------------------------------
        # TEST 4: Off-Topic / Redirect Query
        # -------------------------------------------------------------
        print("\n--- TEST 4: Off-Topic / Redirect Query ---")
        q4 = "How do I bake a chocolate cake at home?"
        res4 = agent_orchestrator.process_doubt(question_text=q4, course_id="course_thermo", db=db)
        
        print(f"Question: '{q4}'")
        print(f"Detected Topic: {res4['detected_topic']}")
        print(f"Is Syllabus Relevant: {res4['is_syllabus_relevant']}")
        
        assert res4['is_syllabus_relevant'] == False, "Test 4 Failed: Off-topic query should not be grounded"
        print("[PASS] Test 4 (Off-Topic Query) Passed!")

        print("\n" + "=" * 60)
        print("   ALL 4 PHASE 11 END-TO-END WORKFLOW TESTS PASSED 100%")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    run_phase11_end_to_end_test()
