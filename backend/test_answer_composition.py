import os
import sys
import json

# Add backend root directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import Base, engine, SessionLocal
from app.db.seed import seed_database
from app.agents.student_interaction import student_interaction_agent
from app.agents.syllabus_grounding import syllabus_grounding_agent
from app.agents.answer_composition import answer_composition_agent

def run_answer_composition_agent_tests():
    print("==================================================")
    print("   PHASE 8: ANSWER COMPOSITION AGENT TEST SUITE")
    print("==================================================")

    # Initialize DB & Seed Data
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        seed_database(db)

        # TEST CASE 1: High Confidence Concept Answer
        print("\n--- TEST 1: High Confidence Concept Answer ---")
        q1 = "Why does entropy increase in an isolated system?"
        interaction1 = student_interaction_agent.analyze(q1, "Thermodynamics")
        grounding1 = syllabus_grounding_agent.process(q1, interaction1, db)
        res1 = answer_composition_agent.compose(q1, interaction1, grounding1)

        print(f"Question: '{q1}'")
        print(f"Result:\n{json.dumps(res1, indent=2)}")

        assert "Direct Answer" in res1["answer"], "Test 1 Failed: Must contain Direct Answer section"
        assert "Explanation" in res1["answer"], "Test 1 Failed: Must contain Explanation section"
        assert "Key Takeaway" in res1["answer"] or len(res1["key_takeaway"]) > 0, "Test 1 Failed: Must contain Key Takeaway"
        assert res1["confidence"] >= 0.70, f"Test 1 Failed: Expected high confidence, got {res1['confidence']}"
        assert len(res1["sources"]) > 0, "Test 1 Failed: Sources array must not be empty"
        assert "k_B" in res1["answer"] or "S =" in res1["answer"] or "Second Law" in res1["answer"], "Test 1 Failed: Should include relevant thermodynamic equation/laws"
        print("[PASS] Test 1 (High Confidence Concept Answer) Passed!")

        # TEST CASE 2: Contradictory Query Answer (Uncertainty Communication)
        print("\n--- TEST 2: Contradictory Query Answer ---")
        q2 = "In Lab 3, do we use constant heat capacity or polynomial heat capacity?"
        interaction2 = student_interaction_agent.analyze(q2, "Thermodynamics")
        grounding2 = syllabus_grounding_agent.process(q2, interaction2, db)
        res2 = answer_composition_agent.compose(q2, interaction2, grounding2)

        print(f"Question: '{q2}'")
        print(f"Result:\n{json.dumps(res2, indent=2)}")

        assert "Conflicting Course Material Detected" in res2["answer"] or "Instructor Review" in res2["answer"], "Test 2 Failed: Must communicate conflict/uncertainty"
        assert res2["confidence"] <= 0.65, f"Test 2 Failed: Low confidence score expected, got {res2['confidence']}"
        assert len(res2["sources"]) > 0, "Test 2 Failed: Sources should show conflicting documents"
        print("[PASS] Test 2 (Contradictory Query Answer) Passed!")

        # TEST CASE 3: Calculation / Formula Query
        print("\n--- TEST 3: Calculation / Formula Query ---")
        q3 = "What limits the efficiency of a Carnot Engine?"
        interaction3 = student_interaction_agent.analyze(q3, "Thermodynamics")
        grounding3 = syllabus_grounding_agent.process(q3, interaction3, db)
        res3 = answer_composition_agent.compose(q3, interaction3, grounding3)

        print(f"Question: '{q3}'")
        print(f"Result:\n{json.dumps(res3, indent=2)}")

        assert "Carnot" in res3["answer"], "Test 3 Failed: Must mention Carnot engine"
        assert "T_C" in res3["answer"] or "T_H" in res3["answer"] or "1 -" in res3["answer"], "Test 3 Failed: Must include Carnot equation"
        assert len(res3["key_takeaway"]) > 0, "Test 3 Failed: Key takeaway must be present"
        print("[PASS] Test 3 (Calculation / Formula Query) Passed!")

        # TEST CASE 4: Out of Syllabus / Ungrounded Refusal
        print("\n--- TEST 4: Out of Syllabus / Ungrounded Refusal ---")
        q4 = "How do I bake a chocolate cake at home?"
        interaction4 = student_interaction_agent.analyze(q4, "Thermodynamics")
        grounding4 = syllabus_grounding_agent.process(q4, interaction4, db)
        res4 = answer_composition_agent.compose(q4, interaction4, grounding4)

        print(f"Question: '{q4}'")
        print(f"Result:\n{json.dumps(res4, indent=2)}")

        assert res4["confidence"] == 0.20, f"Test 4 Failed: Expected confidence 0.20, got {res4['confidence']}"
        assert len(res4["sources"]) == 0, "Test 4 Failed: Sources must be empty for ungrounded query"
        assert "cannot be answered" in res4["answer"].lower() or "uploaded materials" in res4["answer"].lower(), "Test 4 Failed: Should refuse ungrounded query"
        print("[PASS] Test 4 (Out of Syllabus / Ungrounded Refusal) Passed!")

        print("\n==================================================")
        print("   ALL 4 PHASE 8 COMPOSITION AGENT TESTS PASSED 100%")
        print("==================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_answer_composition_agent_tests()
