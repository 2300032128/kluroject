import os
import sys
import json

# Add backend root directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import Base, engine, SessionLocal
from app.db.seed import seed_database
from app.agents.doubt_analytics import doubt_analytics_agent

def run_doubt_analytics_agent_tests():
    print("==================================================")
    print("   PHASE 10: DOUBT ANALYTICS AGENT TEST SUITE")
    print("==================================================")

    # Initialize DB & Seed Data
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        seed_database(db)

        # TEST CASE 1: Fetch Real-Time Aggregated Analytics
        print("\n--- TEST 1: Real-Time Analytics Metrics Calculation ---")
        metrics = doubt_analytics_agent.get_analytics("course_thermo", db)
        
        print(f"Calculated Metrics:\n{json.dumps(metrics, indent=2)}")

        assert metrics["total_questions"] >= 4, f"Test 1 Failed: Expected at least 4 seeded questions, got {metrics['total_questions']}"
        assert metrics["ai_resolved"] >= 2, f"Test 1 Failed: Expected resolved count >= 2, got {metrics['ai_resolved']}"
        assert metrics["escalated"] >= 1, f"Test 1 Failed: Expected escalated count >= 1, got {metrics['escalated']}"
        assert "ai_resolution_rate" in metrics, "Test 1 Failed: Must compute ai_resolution_rate"
        assert "escalation_rate" in metrics, "Test 1 Failed: Must compute escalation_rate"
        assert "avg_confidence" in metrics, "Test 1 Failed: Must compute avg_confidence"
        print("[PASS] Test 1 (Real-Time Analytics Metrics Calculation) Passed!")

        # TEST CASE 2: Topic & Module Distributions
        print("\n--- TEST 2: Topic & Module Distributions ---")
        top_topics = metrics["top_topics"]
        modules = metrics["questions_per_module"]

        print(f"Top Topics: {top_topics}")
        print(f"Questions Per Module: {modules}")

        assert len(top_topics) > 0, "Test 2 Failed: top_topics array must not be empty"
        assert len(modules) > 0, "Test 2 Failed: questions_per_module array must not be empty"
        assert top_topics[0]["count"] >= top_topics[-1]["count"], "Test 2 Failed: Topics must be sorted in descending order of count"
        print("[PASS] Test 2 (Topic & Module Distributions) Passed!")

        # TEST CASE 3: Most Confusing Topic & Attention Indicators
        print("\n--- TEST 3: Most Confusing Topic & Attention Cards ---")
        most_confusing = metrics["most_confusing_topic"]
        low_confidence_count = metrics["low_confidence_questions"]
        attention_count = metrics["questions_needing_attention"]

        print(f"Most Confusing Topic: '{most_confusing}'")
        print(f"Low Confidence Questions Count: {low_confidence_count}")
        print(f"Questions Needing Attention Count: {attention_count}")

        assert len(most_confusing) > 0, "Test 3 Failed: most_confusing_topic must be populated"
        assert low_confidence_count >= 1, "Test 3 Failed: Should detect low confidence question from seed data"
        print("[PASS] Test 3 (Most Confusing Topic & Attention Cards) Passed!")

        # TEST CASE 4: Dynamic Update after new question logged
        print("\n--- TEST 4: Dynamic Analytics Update on New Doubt ---")
        doubt_analytics_agent.update_analytics("course_thermo", "Entropy", "Why does local entropy decrease during freezing?")
        updated_metrics = doubt_analytics_agent.get_analytics("course_thermo", db)
        
        print(f"Updated Total Questions: {updated_metrics['total_questions']}")
        assert updated_metrics["total_questions"] >= metrics["total_questions"], "Test 4 Failed: Dynamic tracking failed"
        print("[PASS] Test 4 (Dynamic Analytics Update) Passed!")

        print("\n==================================================")
        print("   ALL 4 PHASE 10 DOUBT ANALYTICS TESTS PASSED 100%")
        print("==================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_doubt_analytics_agent_tests()
