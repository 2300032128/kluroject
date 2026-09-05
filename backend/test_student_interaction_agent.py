import os
import sys
import json

# Add backend root directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.agents.student_interaction import student_interaction_agent

def run_student_interaction_agent_tests():
    print("==================================================")
    print("   PHASE 5: STUDENT INTERACTION AGENT TEST SUITE")
    print("==================================================")

    test_cases = [
        {
            "category": "Conceptual Question",
            "question": "Why does entropy increase in an isolated system?",
            "expected_intent": "conceptual question",
            "expected_topic": "Entropy"
        },
        {
            "category": "Definition",
            "question": "What is a reversible process?",
            "expected_intent": "definition",
            "expected_topic": "Reversibility"
        },
        {
            "category": "Calculation",
            "question": "Calculate Carnot efficiency for T_H=500K and T_C=300K",
            "expected_intent": "calculation",
            "expected_topic": "Carnot Engine"
        },
        {
            "category": "Comparison",
            "question": "What is the difference between reversible vs irreversible processes?",
            "expected_intent": "comparison",
            "expected_topic": "Reversibility"
        },
        {
            "category": "Application",
            "question": "How is heat transfer applied in refrigerators?",
            "expected_intent": "application",
            "expected_topic": "Heat Engines"
        },
        {
            "category": "Clarification Required",
            "question": "entropy?",
            "expected_intent": "clarification",
            "expected_requires_clarification": True
        },
        {
            "category": "Off-Topic",
            "question": "How do I bake a chocolate cake at home?",
            "expected_intent": "off-topic",
            "expected_subject": "General"
        },
        {
            "category": "Assessment Request",
            "question": "Where can I find the homework solution manual for Quiz 2?",
            "expected_intent": "assessment request"
        },
        {
            "category": "Sensitive Question",
            "question": "Can I hack the online thermodynamics exam to bypass questions?",
            "expected_intent": "sensitive question",
            "expected_sensitivity": "flagged_academic_integrity"
        }
    ]

    passed = 0
    total = len(test_cases)

    for i, tc in enumerate(test_cases, start=1):
        print(f"\n--- TEST {i}: {tc['category']} ---")
        q = tc["question"]
        res = student_interaction_agent.analyze(q, "Thermodynamics")
        print(f"Question: '{q}'")
        print(f"Agent Output:\n{json.dumps(res, indent=2)}")

        # Verify JSON Structure Contract
        assert "intent" in res, "JSON contract missing 'intent'"
        assert "subject" in res, "JSON contract missing 'subject'"
        assert "topic" in res, "JSON contract missing 'topic'"
        assert "module" in res, "JSON contract missing 'module'"
        assert "keywords" in res and isinstance(res["keywords"], list), "JSON contract missing 'keywords' array"
        assert "requires_clarification" in res and isinstance(res["requires_clarification"], bool), "JSON contract missing 'requires_clarification'"
        assert "sensitivity" in res, "JSON contract missing 'sensitivity'"

        # Verify Expected Intent
        assert res["intent"] == tc["expected_intent"], f"Expected intent '{tc['expected_intent']}', got '{res['intent']}'"

        if "expected_topic" in tc:
            assert res["topic"] == tc["expected_topic"], f"Expected topic '{tc['expected_topic']}', got '{res['topic']}'"

        if "expected_requires_clarification" in tc:
            assert res["requires_clarification"] == tc["expected_requires_clarification"], f"Expected requires_clarification {tc['expected_requires_clarification']}"

        if "expected_sensitivity" in tc:
            assert res["sensitivity"] == tc["expected_sensitivity"], f"Expected sensitivity '{tc['expected_sensitivity']}', got '{res['sensitivity']}'"

        print(f"[PASS] Test {i} ({tc['category']}) Passed!")
        passed += 1

    print("\n==================================================")
    print(f"   ALL {passed}/{total} STUDENT INTERACTION AGENT TESTS PASSED 100%")
    print("==================================================")

if __name__ == "__main__":
    run_student_interaction_agent_tests()
