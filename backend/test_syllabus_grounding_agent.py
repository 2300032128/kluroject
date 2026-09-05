import os
import sys
import json

# Add backend root directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import Base, engine, SessionLocal
from app.db.seed import seed_database
from app.agents.student_interaction import student_interaction_agent
from app.agents.syllabus_grounding import syllabus_grounding_agent

def run_syllabus_grounding_agent_tests():
    print("==================================================")
    print("   PHASE 6: SYLLABUS GROUNDING AGENT TEST SUITE")
    print("==================================================")

    # Initialize DB & Seed Data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        seed_database(db)

        # TEST CASE 1: High Confidence Retrieval
        print("\n--- TEST 1: High Confidence Retrieval ---")
        q1 = "Why does entropy increase in an isolated system?"
        analysis1 = student_interaction_agent.analyze(q1, "Thermodynamics")
        res1 = syllabus_grounding_agent.process(q1, analysis1, db)
        
        print(f"Question: '{q1}'")
        print(f"Result:\n{json.dumps(res1, indent=2)}")

        assert res1["grounded"] is True, "Test 1 Failed: Should be grounded"
        assert res1["confidence"] >= 0.70, f"Test 1 Failed: Expected high confidence, got {res1['confidence']}"
        assert len(res1["sources"]) > 0, "Test 1 Failed: Sources array should not be empty"
        assert len(res1["retrieved_chunks"]) > 0, "Test 1 Failed: Retrieved chunks should not be empty"
        print("[PASS] Test 1 (High Confidence Retrieval) Passed!")

        # TEST CASE 2: Low Confidence Retrieval
        print("\n--- TEST 2: Low Confidence Retrieval ---")
        q2 = "Is energy transfer affected by atmospheric humidity?"
        analysis2 = student_interaction_agent.analyze(q2, "Thermodynamics")
        res2 = syllabus_grounding_agent.process(q2, analysis2, db)
        
        print(f"Question: '{q2}'")
        print(f"Result:\n{json.dumps(res2, indent=2)}")

        if res2["grounded"]:
            assert res2["confidence"] < 0.75, "Test 2 Failed: Low confidence expected"
        else:
            assert res2["confidence"] <= 0.45, "Test 2 Failed: Expected low confidence score"
        print("[PASS] Test 2 (Low Confidence Retrieval) Passed!")

        # TEST CASE 3: No Results / Insufficient Evidence
        print("\n--- TEST 3: No Results (Insufficient Evidence) ---")
        q3 = "How do I bake a chocolate cake at home?"
        analysis3 = student_interaction_agent.analyze(q3, "Thermodynamics")
        res3 = syllabus_grounding_agent.process(q3, analysis3, db)
        
        print(f"Question: '{q3}'")
        print(f"Result:\n{json.dumps(res3, indent=2)}")

        assert res3["grounded"] is False, "Test 3 Failed: Grounded must be False for off-topic query"
        assert res3["confidence"] == 0.20, f"Test 3 Failed: Expected confidence 0.20, got {res3['confidence']}"
        assert len(res3["sources"]) == 0, "Test 3 Failed: Sources must be empty"
        assert len(res3["retrieved_chunks"]) == 0, "Test 3 Failed: Chunks must be empty"
        print("[PASS] Test 3 (No Results / Insufficient Evidence) Passed!")

        # TEST CASE 4: Conflicting Documents Detection
        print("\n--- TEST 4: Conflicting Documents ---")
        q4 = "In Lab 3, do we use constant heat capacity or polynomial heat capacity?"
        analysis4 = student_interaction_agent.analyze(q4, "Thermodynamics")
        res4 = syllabus_grounding_agent.process(q4, analysis4, db)
        
        print(f"Question: '{q4}'")
        print(f"Result:\n{json.dumps(res4, indent=2)}")

        assert len(res4["potential_conflicts"]) > 0, "Test 4 Failed: Should detect potential conflicts!"
        assert res4["confidence"] <= 0.50, f"Test 4 Failed: Confidence should drop on conflict, got {res4['confidence']}"
        print("[PASS] Test 4 (Conflicting Documents) Passed!")

        print("\n==================================================")
        print("   ALL 4 PHASE 6 GROUNDING AGENT TESTS PASSED 100%")
        print("==================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_syllabus_grounding_agent_tests()
