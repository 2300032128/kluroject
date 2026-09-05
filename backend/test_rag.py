import os
import sys
import json

# Add backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import Base, engine, SessionLocal
from app.db.seed import seed_database
from app.services.retrieval import retrieval_service

def run_rag_tests():
    print("==================================================")
    print("   PHASE 4: SYLLABUS RAG AUTOMATED SUITE")
    print("==================================================")

    # Initialize DB & Seed Data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        seed_database(db)
        print("[Setup] Database initialized with Thermodynamics course materials.")

        # Test Case 1: Relevant Question
        print("\n--- TEST CASE 1: Relevant Question ---")
        q1 = "Why does entropy increase in an isolated system?"
        res1 = retrieval_service.retrieve(db, q1)
        print(f"Query: '{q1}'")
        print(f"Result: {json.dumps(res1, indent=2)}")

        assert res1["grounded"] is True, "Test 1 Failed: Should be grounded!"
        assert res1["confidence"] >= 0.70, f"Test 1 Failed: Low confidence {res1['confidence']}"
        assert len(res1["sources"]) > 0, "Test 1 Failed: Sources array should not be empty!"
        print("[PASS] Test Case 1 Passed!")

        # Test Case 2: Irrelevant Question
        print("\n--- TEST CASE 2: Irrelevant Question ---")
        q2 = "How do I bake a chocolate cake at home?"
        res2 = retrieval_service.retrieve(db, q2)
        print(f"Query: '{q2}'")
        print(f"Result: {json.dumps(res2, indent=2)}")

        assert res2["grounded"] is False, "Test 2 Failed: Should NOT be grounded!"
        assert res2["confidence"] == 0.20, f"Test 2 Failed: Expected confidence 0.20, got {res2['confidence']}"
        assert len(res2["sources"]) == 0, "Test 2 Failed: Sources array must be empty!"
        print("[PASS] Test Case 2 Passed!")

        # Test Case 3: No Matching Material
        print("\n--- TEST CASE 3: No Matching Material ---")
        q3 = "What is quantum entanglement spin density in semiconductors?"
        res3 = retrieval_service.retrieve(db, q3)
        print(f"Query: '{q3}'")
        print(f"Result: {json.dumps(res3, indent=2)}")

        assert res3["grounded"] is False, "Test 3 Failed: Should NOT be grounded!"
        assert res3["confidence"] == 0.20, f"Test 3 Failed: Expected confidence 0.20, got {res3['confidence']}"
        assert len(res3["sources"]) == 0, "Test 3 Failed: Sources array must be empty!"
        print("[PASS] Test Case 3 Passed!")

        # Test Case 4: Multiple Matching Documents
        print("\n--- TEST CASE 4: Multiple Matching Documents ---")
        q4 = "Explain Carnot engine efficiency limits and Second Law microstates"
        res4 = retrieval_service.retrieve(db, q4)
        print(f"Query: '{q4}'")
        print(f"Result: {json.dumps(res4, indent=2)}")

        assert res4["grounded"] is True, "Test 4 Failed: Should be grounded!"
        assert len(res4["sources"]) >= 1, "Test 4 Failed: Should retrieve matching sources!"
        print("[PASS] Test Case 4 Passed!")

        print("\n==================================================")
        print("   ALL 4 PHASE 4 RAG AUTOMATED TESTS PASSED 100%")
        print("==================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_rag_tests()
