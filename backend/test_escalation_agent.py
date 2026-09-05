import os
import sys
import json

# Add backend root directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import Base, engine, SessionLocal
from app.db.seed import seed_database
from app.agents.student_interaction import student_interaction_agent
from app.agents.syllabus_grounding import syllabus_grounding_agent
from app.agents.escalation import escalation_agent

def run_escalation_agent_tests():
    print("==================================================")
    print("   PHASE 9: ESCALATION AGENT TEST SUITE")
    print("==================================================")

    # Initialize DB & Seed Data
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        seed_database(db)

        # TEST CASE 1: Decision = ANSWER (High Confidence Grounded Query)
        print("\n--- TEST 1: Decision = ANSWER ---")
        q1 = "Why does entropy increase in an isolated system?"
        interaction1 = student_interaction_agent.analyze(q1, "Thermodynamics")
        grounding1 = syllabus_grounding_agent.process(q1, interaction1, db)
        res1 = escalation_agent.process(q1, interaction1, grounding1, grounding1.get("contradiction_analysis"), question_id="q_seed_101", db=db)

        print(f"Question: '{q1}'")
        print(f"Result:\n{json.dumps(res1, indent=2)}")

        assert res1["decision"] == "ANSWER", f"Test 1 Failed: Expected ANSWER, got {res1['decision']}"
        assert res1["should_escalate"] is False, "Test 1 Failed: should_escalate must be False"
        print("[PASS] Test 1 (Decision = ANSWER) Passed!")

        # TEST CASE 2: Decision = CLARIFY (Ambiguous Query)
        print("\n--- TEST 2: Decision = CLARIFY ---")
        q2 = "entropy?"
        interaction2 = student_interaction_agent.analyze(q2, "Thermodynamics")
        grounding2 = syllabus_grounding_agent.process(q2, interaction2, db)
        res2 = escalation_agent.process(q2, interaction2, grounding2, grounding2.get("contradiction_analysis"), question_id="q_seed_102", db=db)

        print(f"Question: '{q2}'")
        print(f"Result:\n{json.dumps(res2, indent=2)}")

        assert res2["decision"] == "CLARIFY", f"Test 2 Failed: Expected CLARIFY, got {res2['decision']}"
        assert res2["should_escalate"] is False, "Test 2 Failed: should_escalate should be False for clarify"
        print("[PASS] Test 2 (Decision = CLARIFY) Passed!")

        # TEST CASE 3: Decision = ESCALATE (Signal: Conflicting Documents)
        print("\n--- TEST 3: Decision = ESCALATE (Conflicting Documents) ---")
        q3 = "In Lab 3, do we use constant heat capacity or polynomial heat capacity?"
        interaction3 = student_interaction_agent.analyze(q3, "Thermodynamics")
        grounding3 = syllabus_grounding_agent.process(q3, interaction3, db)
        res3 = escalation_agent.process(q3, interaction3, grounding3, grounding3.get("contradiction_analysis"), question_id="q_seed_103", db=db)

        print(f"Question: '{q3}'")
        print(f"Result:\n{json.dumps(res3, indent=2)}")

        assert res3["decision"] == "ESCALATE", f"Test 3 Failed: Expected ESCALATE, got {res3['decision']}"
        assert res3["should_escalate"] is True, "Test 3 Failed: should_escalate must be True"
        assert res3["ticket_id"] is not None, "Test 3 Failed: Ticket ID should be generated"
        print("[PASS] Test 3 (Decision = ESCALATE - Conflicting Documents) Passed!")

        # TEST CASE 4: Decision = ESCALATE (Signal: Sensitive / Academic Integrity Flag)
        print("\n--- TEST 4: Decision = ESCALATE (Sensitive / Cheating Question) ---")
        q4 = "Can I hack the online thermodynamics exam to bypass questions?"
        interaction4 = student_interaction_agent.analyze(q4, "Thermodynamics")
        grounding4 = syllabus_grounding_agent.process(q4, interaction4, db)
        res4 = escalation_agent.process(q4, interaction4, grounding4, grounding4.get("contradiction_analysis"), question_id="q_seed_104", db=db)

        print(f"Question: '{q4}'")
        print(f"Result:\n{json.dumps(res4, indent=2)}")

        assert res4["decision"] == "ESCALATE", f"Test 4 Failed: Expected ESCALATE, got {res4['decision']}"
        assert res4["should_escalate"] is True, "Test 4 Failed: should_escalate must be True"
        print("[PASS] Test 4 (Decision = ESCALATE - Sensitive Question) Passed!")

        # TEST CASE 5: Decision = ESCALATE (Signal: Explicit Student Request for Instructor)
        print("\n--- TEST 5: Decision = ESCALATE (Explicit Student Request) ---")
        q5 = "I want to speak with Dr. Vance about my homework grade."
        interaction5 = student_interaction_agent.analyze(q5, "Thermodynamics")
        grounding5 = syllabus_grounding_agent.process(q5, interaction5, db)
        res5 = escalation_agent.process(q5, interaction5, grounding5, grounding5.get("contradiction_analysis"), question_id="q_seed_101", db=db)

        print(f"Question: '{q5}'")
        print(f"Result:\n{json.dumps(res5, indent=2)}")

        assert res5["decision"] == "ESCALATE", f"Test 5 Failed: Expected ESCALATE, got {res5['decision']}"
        assert res5["should_escalate"] is True, "Test 5 Failed: should_escalate must be True"
        print("[PASS] Test 5 (Decision = ESCALATE - Explicit Request) Passed!")

        # TEST CASE 6: Decision = REDIRECT (Off-Topic Query)
        print("\n--- TEST 6: Decision = REDIRECT (Off-Topic Query) ---")
        q6 = "How do I bake a chocolate cake at home?"
        interaction6 = student_interaction_agent.analyze(q6, "Thermodynamics")
        grounding6 = syllabus_grounding_agent.process(q6, interaction6, db)
        res6 = escalation_agent.process(q6, interaction6, grounding6, grounding6.get("contradiction_analysis"), question_id="q_seed_102", db=db)

        print(f"Question: '{q6}'")
        print(f"Result:\n{json.dumps(res6, indent=2)}")

        assert res6["decision"] == "REDIRECT", f"Test 6 Failed: Expected REDIRECT, got {res6['decision']}"
        assert res6["should_escalate"] is False, "Test 6 Failed: should_escalate must be False for REDIRECT"
        print("[PASS] Test 6 (Decision = REDIRECT) Passed!")

        print("\n==================================================")
        print("   ALL 6 PHASE 9 ESCALATION AGENT TESTS PASSED 100%")
        print("==================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_escalation_agent_tests()
