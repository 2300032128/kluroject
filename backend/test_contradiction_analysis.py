import os
import sys
import json

# Add backend root directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.agents.contradiction_analysis import contradiction_analyzer

def run_contradiction_analysis_tests():
    print("==================================================")
    print("   PHASE 7: CONTRADICTION ANALYSIS TEST SUITE")
    print("==================================================")

    # TEST CASE 1: Contextual Apparent Contradiction (Entropy Decrease)
    print("\n--- TEST 1: Apparent Contradiction (Contextually Resolvable) ---")
    q1 = "Can entropy decrease in a subsystem or open system?"
    chunks1 = [
        {"snippet": "Document A: Entropy of an isolated system cannot decrease. (dS >= 0)"},
        {"snippet": "Document B: Entropy can decrease locally in an open system or subsystem during refrigeration."}
    ]
    res1 = contradiction_analyzer.analyze(q1, chunks1)
    print(f"Question: '{q1}'")
    print(f"Result:\n{json.dumps(res1, indent=2)}")

    assert res1["contradiction_detected"] is True, "Test 1 Failed: Should detect apparent contradiction"
    assert res1["resolvable_from_context"] is True, "Test 1 Failed: Should be contextually resolvable"
    assert res1["confidence"] >= 0.70, f"Test 1 Failed: High confidence expected, got {res1['confidence']}"
    assert res1["recommend_escalation"] is False, "Test 1 Failed: No escalation needed when contextually resolvable"
    print("[PASS] Test 1 (Apparent Contradiction - Contextually Resolvable) Passed!")

    # TEST CASE 2: Direct Material Contradiction (Unresolvable / Recommend Escalation)
    print("\n--- TEST 2: Unresolvable Direct Material Contradiction ---")
    q2 = "In Lab 3, do we use constant heat capacity or polynomial heat capacity?"
    chunks2 = [
        {"snippet": "Lab 3 Manual: Assume constant specific heat capacity Cp = 4.184 J/g K."},
        {"snippet": "Lecture 11 Slides: Use temperature-dependent polynomial Cp(T)."}
    ]
    res2 = contradiction_analyzer.analyze(q2, chunks2)
    print(f"Question: '{q2}'")
    print(f"Result:\n{json.dumps(res2, indent=2)}")

    assert res2["contradiction_detected"] is True, "Test 2 Failed: Should detect direct material contradiction"
    assert res2["resolvable_from_context"] is False, "Test 2 Failed: Should NOT be resolvable from context"
    assert res2["confidence"] <= 0.65, f"Test 2 Failed: Low confidence expected (<=0.65), got {res2['confidence']}"
    assert res2["recommend_escalation"] is True, "Test 2 Failed: Escalation recommended flag MUST be True"
    print("[PASS] Test 2 (Unresolvable Direct Material Contradiction) Passed!")

    # TEST CASE 3: No Contradiction Detected
    print("\n--- TEST 3: No Contradiction ---")
    q3 = "What is the First Law of Thermodynamics?"
    chunks3 = [
        {"snippet": "Energy cannot be created or destroyed, only transformed. dU = dQ - dW."}
    ]
    res3 = contradiction_analyzer.analyze(q3, chunks3)
    print(f"Question: '{q3}'")
    print(f"Result:\n{json.dumps(res3, indent=2)}")

    assert res3["contradiction_detected"] is False, "Test 3 Failed: Contradiction should be False"
    assert res3["resolvable_from_context"] is True, "Test 3 Failed: Should be resolvable"
    assert res3["confidence"] >= 0.90, f"Test 3 Failed: High confidence expected, got {res3['confidence']}"
    assert res3["recommend_escalation"] is False, "Test 3 Failed: Escalation should be False"
    print("[PASS] Test 3 (No Contradiction) Passed!")

    # TEST CASE 4: Reversible vs Irreversible Process Context
    print("\n--- TEST 4: Reversible vs Irreversible Context ---")
    q4 = "How does entropy change differ between reversible and irreversible processes?"
    chunks4 = [
        {"snippet": "For a reversible process, dS_gen = 0 and dS = dQ/T."},
        {"snippet": "For an irreversible process, dS_gen > 0 and entropy generation increases total disorder."}
    ]
    res4 = contradiction_analyzer.analyze(q4, chunks4)
    print(f"Question: '{q4}'")
    print(f"Result:\n{json.dumps(res4, indent=2)}")

    assert res4["contradiction_detected"] is True, "Test 4 Failed: Should detect context variation"
    assert res4["resolvable_from_context"] is True, "Test 4 Failed: Contextually resolvable"
    assert res4["confidence"] >= 0.75, f"Test 4 Failed: Confidence expected >=0.75, got {res4['confidence']}"
    assert res4["recommend_escalation"] is False, "Test 4 Failed: Escalation False"
    print("[PASS] Test 4 (Reversible vs Irreversible Context) Passed!")

    print("\n==================================================")
    print("   ALL 4 PHASE 7 CONTRADICTION TESTS PASSED 100%")
    print("==================================================")

if __name__ == "__main__":
    run_contradiction_analysis_tests()
