from datetime import datetime
from sqlalchemy.orm import Session
from app.db.models import (
    User, Course, Module, Document, DocumentChunk, Question, 
    AgentRun, RetrievalResult, Answer, Escalation, InstructorReview, AnalyticsEvent
)

def seed_database(db: Session):
    print("[DB Seed] Checking existing data...")
    
    # Check if already seeded
    existing_course = db.query(Course).filter(Course.code == "ME202").first()
    if existing_course:
        print("[DB Seed] Thermodynamics ME202 course already present in database.")
        return

    print("[DB Seed] Starting Phase 3 database seeding for Thermodynamics...")

    # 1. Seed Users
    instructor = User(
        id="usr_inst_1",
        name="Dr. Robert Vance",
        email="rvance@university.edu",
        role="instructor"
    )
    student1 = User(
        id="usr_stu_1",
        name="Alex Rivera",
        email="arivera@student.edu",
        role="student"
    )
    student2 = User(
        id="usr_stu_2",
        name="Elena Rostova",
        email="erostova@student.edu",
        role="student"
    )
    student3 = User(
        id="usr_stu_3",
        name="Marcus Vance",
        email="mvance@student.edu",
        role="student"
    )
    db.add_all([instructor, student1, student2, student3])
    db.commit()

    # 2. Seed Thermodynamics Course
    course = Course(
        id="course_thermo",
        title="Thermodynamics",
        code="ME202",
        description="Fundamental principles of energy transfer, the First and Second Laws of Thermodynamics, entropy, reversibility, and heat engines.",
        instructor_name="Dr. Robert Vance"
    )
    db.add(course)
    db.commit()

    # 3. Seed 6 Specific Thermodynamics Modules
    m1 = Module(id="mod_w1", course_id=course.id, title="Week 1 - Fundamentals", week_number=1, description="Thermodynamic state variables, system boundaries, and temperature equilibrium.")
    m2 = Module(id="mod_w2", course_id=course.id, title="Week 2 - First Law", week_number=2, description="Internal energy, work transfer, heat transfer, and conservation of energy.")
    m3 = Module(id="mod_w3", course_id=course.id, title="Week 3 - Heat Engines", week_number=3, description="Thermal efficiency, thermal reservoirs, and heat engine cycles.")
    m4 = Module(id="mod_w4", course_id=course.id, title="Week 4 - Second Law", week_number=4, description="Clausius and Kelvin-Planck statements of the Second Law.")
    m5 = Module(id="mod_w5", course_id=course.id, title="Week 5 - Reversibility", week_number=5, description="Quasi-static processes, Carnot cycle, and reversibility conditions.")
    m6 = Module(id="mod_w6", course_id=course.id, title="Week 6 - Entropy", week_number=6, description="Definition of entropy, Boltzmann microstates, and local vs isolated entropy changes.")
    
    db.add_all([m1, m2, m3, m4, m5, m6])
    db.commit()

    # 4. Seed Documents & Chunks
    doc1 = Document(
        id="doc_textbook",
        course_id=course.id,
        module_id=m6.id,
        title="Thermodynamics Core Textbook (8th Edition)",
        file_type="pdf",
        content_text="The Second Law dictates dS >= 0 for isolated systems. Equilibrium corresponds to maximum statistical multiplicity W. Reversible processes leave zero net entropy change."
    )
    doc2 = Document(
        id="doc_slides_w6",
        course_id=course.id,
        module_id=m6.id,
        title="Week 6 Lecture Slides: Entropy & Microstates",
        file_type="pdf",
        content_text="Microstate counting demonstrates that non-equilibrium states naturally decay into equilibrium maximum entropy configurations. Boltzmann relation: S = k_B ln W."
    )
    doc3 = Document(
        id="doc_lab3",
        course_id=course.id,
        module_id=m2.id,
        title="Lab 3 Manual: Heat Capacity & Calorimetry",
        file_type="pdf",
        content_text="Lab Specification: Assume constant specific heat capacity Cp = 4.184 J/g K for range 298K to 350K."
    )
    db.add_all([doc1, doc2, doc3])
    db.commit()

    chunk1 = DocumentChunk(
        id="chunk_101",
        document_id=doc1.id,
        chunk_index=0,
        page_number=184,
        content="The Second Law of Thermodynamics dictates dS >= 0 for isolated systems. Equilibrium corresponds to maximum statistical multiplicity W."
    )
    chunk2 = DocumentChunk(
        id="chunk_102",
        document_id=doc2.id,
        chunk_index=0,
        page_number=12,
        content="Microstate counting demonstrates that non-equilibrium states naturally decay into equilibrium maximum entropy configurations. Boltzmann S = k_B ln W."
    )
    chunk3 = DocumentChunk(
        id="chunk_103",
        document_id=doc1.id,
        chunk_index=1,
        page_number=160,
        content="The Carnot Engine efficiency is strictly limited by reservoir temperatures T_C and T_H: eta = 1 - (T_C / T_H)."
    )
    db.add_all([chunk1, chunk2, chunk3])
    db.commit()

    # 5. Seed Realistic Questions (Matching required schema fields)
    q1 = Question(
        id="q_seed_101",
        student_id=student1.id,
        course_id=course.id,
        question_text="Why does entropy increase in an isolated system?",
        subject="Thermodynamics",
        topic="Entropy",
        module="Week 6 - Entropy",
        intent="concept_explanation",
        status="answered",
        confidence=0.96
    )
    q2 = Question(
        id="q_seed_102",
        student_id=student2.id,
        course_id=course.id,
        question_text="What is a reversible process?",
        subject="Thermodynamics",
        topic="Second Law",
        module="Week 5 - Reversibility",
        intent="definition_request",
        status="answered",
        confidence=0.92
    )
    q3 = Question(
        id="q_seed_103",
        student_id=student3.id,
        course_id=course.id,
        question_text="Can entropy decrease locally in an open system?",
        subject="Thermodynamics",
        topic="Entropy",
        module="Week 6 - Entropy",
        intent="policy_ambiguity",
        status="instructor_review",
        confidence=0.48
    )
    q4 = Question(
        id="q_seed_104",
        student_id=student1.id,
        course_id=course.id,
        question_text="What limits the efficiency of a Carnot Engine?",
        subject="Thermodynamics",
        topic="Carnot Engine",
        module="Week 3 - Heat Engines",
        intent="formula_derivation",
        status="answered",
        confidence=0.95
    )
    db.add_all([q1, q2, q3, q4])
    db.commit()

    # 6. Seed Agent Runs
    ar1 = AgentRun(
        question_id=q1.id,
        agent_name="Student Interaction Agent",
        step_index=1,
        action="Topic Classification",
        details="Mapped query to Topic 'Entropy' under Module 'Week 6 - Entropy'.",
        status="success",
        execution_time_ms=120
    )
    ar2 = AgentRun(
        question_id=q1.id,
        agent_name="Syllabus Grounding Agent (RAG)",
        step_index=2,
        action="Vector Search",
        details="Retrieved Chunk 101 & Chunk 102 with 96% vector similarity score.",
        status="success",
        execution_time_ms=210
    )
    ar3 = AgentRun(
        question_id=q1.id,
        agent_name="Answer Composition Agent",
        step_index=3,
        action="Grounded Response Synthesis",
        details="Synthesized response using Boltzmann microstate relation and 2 textbook citations.",
        status="success",
        execution_time_ms=340
    )
    db.add_all([ar1, ar2, ar3])

    # 7. Seed Retrieval Results
    rr1 = RetrievalResult(
        question_id=q1.id,
        document_chunk_id=chunk1.id,
        similarity_score=0.96,
        rank=1,
        snippet="The Second Law dictates dS >= 0 for isolated systems..."
    )
    db.add(rr1)

    # 8. Seed Answers
    ans1 = Answer(
        question_id=q1.id,
        answer_text="According to the Second Law of Thermodynamics, the total entropy of an isolated system can never decrease over time (dS >= 0). An isolated system spontaneously evolves towards thermodynamic equilibrium — the state with the maximum microstates W, defined by S = k_B ln W.",
        key_takeaway="Entropy increases because isolated systems naturally progress towards microstate configurations of maximum statistical probability.",
        citations=[
          {"title": "Thermodynamics Textbook (8th Ed)", "page": 184, "snippet": "The Second Law dictates dS >= 0 for isolated systems."},
          {"title": "Week 6 Lecture Slides", "page": 12, "snippet": "Microstate counting demonstrates natural decay into maximum entropy states."}
        ]
    )
    db.add(ans1)

    # 9. Seed Escalations (Matching required schema fields)
    esc1 = Escalation(
        id="esc_seed_103",
        question_id=q3.id,
        reason="Low AI confidence score (48%) and potential ambiguity in Homework 4 phrasing vs Week 6 lecture notes regarding open system entropy reduction.",
        decision=None,
        confidence=0.48,
        status="pending",
        created_at=datetime.utcnow(),
        resolved_at=None
    )
    db.add(esc1)
    db.commit()

    # 10. Seed Analytics Events
    evt1 = AnalyticsEvent(
        course_id=course.id,
        event_type="doubt_asked",
        topic="Entropy",
        question_id=q1.id,
        metadata_json={"confidence": 0.96, "module": "Week 6 - Entropy"}
    )
    evt2 = AnalyticsEvent(
        course_id=course.id,
        event_type="escalation_triggered",
        topic="Entropy",
        question_id=q3.id,
        metadata_json={"confidence": 0.48, "reason": "Ambiguity in Homework 4"}
    )
    db.add_all([evt1, evt2])
    db.commit()

    print("[DB Seed] Successfully seeded Phase 3 database for Thermodynamics ME202!")
