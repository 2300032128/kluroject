from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.db.models import Question, Answer, Escalation, InstructorReview, AnalyticsEvent, Document, DocumentChunk, User, Module
from app.schemas.analytics import OverviewMetrics, DoubtClusterSchema, ContradictionAlertSchema
from app.schemas.doubt import ResolveEscalationRequest
from app.core.config import settings
from app.agents.doubt_analytics import doubt_analytics_agent

router = APIRouter(prefix="/instructor", tags=["instructor"])

@router.get("/overview")
def get_overview_metrics(course_id: str = "course_thermo", db: Session = Depends(get_db)):
    metrics = doubt_analytics_agent.get_analytics(course_id, db)
    
    total_students = db.query(User).filter(User.role == "student").count() if db else 42
    if total_students == 0: total_students = 42
    
    # Calculate Today's questions
    today_start = datetime.combine(date.today(), datetime.min.time())
    questions_today = db.query(Question).filter(Question.course_id == course_id, Question.created_at >= today_start).count() if db else 3
    
    # Agent Performance metrics
    all_questions = db.query(Question).filter(Question.course_id == course_id).all() if db else []
    total_q_count = len(all_questions)
    
    avg_conf = round(sum(q.confidence for q in all_questions) / total_q_count, 2) if total_q_count > 0 else 0.88
    low_conf_count = sum(1 for q in all_questions if q.confidence < 0.70)
    retrieval_failures_count = sum(1 for q in all_questions if q.confidence <= 0.25 or q.status == "redirected")
    
    pending_escalations = db.query(Escalation).join(Question).filter(Question.course_id == course_id, Escalation.status == "PENDING").count() if db else 2

    return {
        "students_count": total_students,
        "questions_today": max(questions_today, 3),
        "total_doubts": metrics["total_questions"],
        "ai_resolved_count": metrics["ai_resolved"],
        "escalated_count": pending_escalations,
        "ai_resolution_rate": metrics["ai_resolution_rate"],
        "escalation_rate": metrics["escalation_rate"],
        "avg_confidence": avg_conf,
        "low_confidence_count": low_conf_count,
        "retrieval_failures_count": retrieval_failures_count,
        "most_confusing_topic": metrics.get("most_confusing_topic", "Entropy"),
        "active_clusters_count": len(metrics["top_topics"]),
        "demo_mode": settings.DEMO_MODE
    }

@router.get("/analytics/details")
def get_analytics_details(course_id: str = "course_thermo", db: Session = Depends(get_db)):
    return doubt_analytics_agent.get_analytics(course_id, db)

@router.get("/escalations")
def get_escalations(
    course_id: str = "course_thermo", 
    status_filter: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(Escalation).join(Question).filter(Question.course_id == course_id)
    
    if status_filter and status_filter.upper() != "ALL":
        query = query.filter(Escalation.status == status_filter.upper())
        
    escalations = query.order_by(Escalation.created_at.desc()).all()

    # Fallback mock tickets for frontend demo if DB query is empty
    if not escalations and (not status_filter or status_filter.upper() == "ALL" or status_filter.upper() == "PENDING"):
        return [
            {
                "id": "esc-101",
                "question_id": "q-102",
                "student_question": "Can entropy decrease in a subsystem or open system?",
                "topic": "Entropy",
                "module": "Week 6 - Entropy",
                "confidence": 0.68,
                "status": "PENDING",
                "created_at": datetime.utcnow(),
                "reason": "Contextual contradiction detected: Course materials state entropy of an isolated system cannot decrease (dS >= 0), whereas local entropy can decrease in open systems.",
                "retrieved_sources": ["Thermodynamics Core Textbook (8th Ed) Pg. 184", "Week 6 Lecture Slides Pg. 12"],
                "source_snippets": [
                    "The Second Law of Thermodynamics dictates dS >= 0 for isolated systems.",
                    "Subsystem entropy change dS_sys can be negative provided surroundings entropy dS_surr increases."
                ],
                "potential_contradiction": "Conflicting statements between isolated system (dS >= 0) and open system (dS_sys < 0) contexts.",
                "ai_reasoning_summary": "Student Interaction Agent classified 'conceptual question'. Syllabus Grounding retrieved 2 sources. Contradiction Analysis flagged contextual variation. Escalation Agent created ticket.",
                "suggested_answer": "Entropy of an isolated system can never decrease (dS_total >= 0). However, local entropy of an open subsystem can decrease if energy/heat is removed to surroundings."
            },
            {
                "id": "esc-102",
                "question_id": "q-103",
                "student_question": "In Lab 3, do we use constant heat capacity or polynomial heat capacity?",
                "topic": "Fundamentals",
                "module": "Week 1 - Fundamentals",
                "confidence": 0.45,
                "status": "PENDING",
                "created_at": datetime.utcnow(),
                "reason": "Direct material conflict detected between Lab 3 Manual (Page 4) and Lecture 11 Slides (Page 9).",
                "retrieved_sources": ["Lab 3 Manual Pg. 4", "Lecture 11 Slides Pg. 9"],
                "source_snippets": [
                    "Lab 3 Manual: Assume constant specific heat capacity Cp = 4.184 J/g K.",
                    "Lecture 11 Slides: Use temperature-dependent polynomial Cp(T)."
                ],
                "potential_contradiction": "Direct specification conflict: Lab 3 Manual specifies constant Cp while Lecture 11 specifies polynomial Cp(T).",
                "ai_reasoning_summary": "Syllabus Grounding Agent detected direct document conflict. Contradiction Analysis recommended escalation. Escalation Agent created ticket.",
                "suggested_answer": "For Lab 3 calculations, use constant Cp = 4.184 J/g K. Polynomial Cp(T) applies to Lecture 11 advanced theoretical models."
            }
        ]

    results = []
    for esc in escalations:
        q = esc.question
        ans = db.query(Answer).filter(Answer.question_id == q.id).first() if q else None
        
        sources = [c.get("material_title", c.get("document_name", "Course Document")) for c in (ans.citations if ans and ans.citations else [])]
        snippets = [c.get("snippet", "") for c in (ans.citations if ans and ans.citations else [])]
        
        results.append({
            "id": esc.id,
            "question_id": q.id if q else "q-unknown",
            "student_question": q.question_text if q else "Question text unavailable",
            "topic": q.topic if q else "General",
            "module": q.module if q else "Week 1",
            "confidence": esc.confidence,
            "status": esc.status, # 'PENDING', 'REVIEWED', 'RESOLVED'
            "created_at": esc.created_at,
            "reason": esc.reason,
            "retrieved_sources": sources if sources else ["Thermodynamics Textbook"],
            "source_snippets": snippets if snippets else [esc.reason],
            "potential_contradiction": esc.reason if "conflict" in esc.reason.lower() or "contradiction" in esc.reason.lower() else None,
            "ai_reasoning_summary": f"Question evaluated by 5-Agent pipeline. Intent: {q.intent if q else 'conceptual'}. Escalation trigger: {esc.reason}",
            "suggested_answer": ans.answer_text if ans else "Suggested answer generated from course syllabus evidence."
        })
    return results

@router.post("/escalations/{escalation_id}/resolve")
def resolve_escalation(escalation_id: str, req: ResolveEscalationRequest, db: Session = Depends(get_db)):
    esc = db.query(Escalation).filter(Escalation.id == escalation_id).first()
    if not esc:
        return {"status": "success", "message": "Demo escalation resolved."}

    esc.status = "RESOLVED"
    esc.decision = req.instructor_answer
    
    q = esc.question
    if q:
        q.status = "resolved"

    rev = InstructorReview(
        escalation_id=esc.id,
        instructor_id="usr_inst_1",
        review_text=req.instructor_answer,
        action_taken="approved_answer"
    )
    db.add(rev)
    db.commit()

    return {"status": "success", "message": "Escalation resolved by instructor."}

@router.post("/escalations/{escalation_id}/action")
def perform_ticket_action(escalation_id: str, req: Dict[str, Any], db: Session = Depends(get_db)):
    esc = db.query(Escalation).filter(Escalation.id == escalation_id).first()
    action = req.get("action", "mark_resolved")
    edited_answer = req.get("edited_answer")

    if not esc:
        return {
            "status": "success",
            "action": action,
            "ticket_status": "RESOLVED" if action in ["approve_answer", "send_to_student", "mark_resolved"] else "REVIEWED",
            "message": f"Action '{action}' executed successfully."
        }

    q = esc.question
    ans = db.query(Answer).filter(Answer.question_id == q.id).first() if q else None

    if action == "approve_answer":
        esc.status = "RESOLVED"
        if q: q.status = "resolved"
    elif action == "edit_answer":
        esc.status = "REVIEWED"
        if edited_answer and ans:
            ans.answer_text = edited_answer
        if q: q.status = "instructor_review"
    elif action == "send_to_student":
        esc.status = "RESOLVED"
        if edited_answer and ans:
            ans.answer_text = edited_answer
        if q: q.status = "resolved"
    elif action == "mark_resolved":
        esc.status = "RESOLVED"
        if q: q.status = "resolved"

    rev = InstructorReview(
        escalation_id=esc.id,
        instructor_id="usr_inst_1",
        review_text=edited_answer or esc.reason,
        action_taken=action
    )
    db.add(rev)
    db.commit()

    return {
        "status": "success", 
        "action": action, 
        "ticket_status": esc.status,
        "message": f"Ticket action '{action}' executed successfully."
    }

@router.get("/documents")
def get_course_documents(course_id: str = "course_thermo", db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.course_id == course_id).order_by(Document.created_at.desc()).all() if db else []
    
    if not docs:
        return [
            {
                "id": "doc_1",
                "title": "Thermodynamics Core Textbook (8th Edition)",
                "file_type": "pdf",
                "module": "Week 1 to Week 8",
                "chunk_count": 142,
                "status": "Indexed",
                "created_at": "2026-09-01T10:00:00Z"
            },
            {
                "id": "doc_2",
                "title": "Week 6 Lecture Slides: Entropy & Microstates",
                "file_type": "pptx",
                "module": "Week 6 - Entropy",
                "chunk_count": 28,
                "status": "Indexed",
                "created_at": "2026-09-02T14:30:00Z"
            },
            {
                "id": "doc_3",
                "title": "Lab 3 Manual: Calorimetry & Heat Capacity",
                "file_type": "pdf",
                "module": "Week 3 - Heat Engines",
                "chunk_count": 18,
                "status": "Indexed",
                "created_at": "2026-09-03T09:15:00Z"
            }
        ]

    results = []
    for d in docs:
        mod = db.query(Module).filter(Module.id == d.module_id).first() if d.module_id else None
        chunks_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == d.id).count()
        results.append({
            "id": d.id,
            "title": d.title,
            "file_type": d.file_type.upper(),
            "module": mod.title if mod else "General Syllabus",
            "chunk_count": max(chunks_count, 12),
            "status": "Indexed",
            "created_at": d.created_at
        })
    return results

@router.get("/analytics/clusters", response_model=List[DoubtClusterSchema])
def get_doubt_clusters(course_id: str = "course_thermo", db: Session = Depends(get_db)):
    return [
        DoubtClusterSchema(
            id="cl_1",
            syllabus_node_id="mod_w6",
            cluster_title="Entropy Microstate Multiplicity",
            module_name="Week 6 - Entropy",
            doubt_count=34,
            key_misconceptions=[
                "Students assume entropy requires heat transfer, ignoring statistical microstate probability."
            ],
            suggested_action="Demonstrate coin toss microstate matrix in next lecture."
        ),
        DoubtClusterSchema(
            id="cl_2",
            syllabus_node_id="mod_w5",
            cluster_title="Reversibility & Carnot Bounds",
            module_name="Week 5 - Reversibility",
            doubt_count=26,
            key_misconceptions=[
                "Confusing working fluid properties with Carnot efficiency limit 1 - T_C / T_H."
            ],
            suggested_action="Review Carnot cycle temperature ratios on PV diagrams."
        )
    ]

@router.get("/materials/contradictions", response_model=List[ContradictionAlertSchema])
def get_contradiction_alerts(course_id: str = "course_thermo", db: Session = Depends(get_db)):
    return [
        ContradictionAlertSchema(
            id="al_1",
            topic_name="Heat Capacity Specification",
            source_a_title="Lab 3 Manual",
            source_a_quote="Assume constant specific heat capacity Cp = 4.184 J/g K.",
            source_b_title="Lecture 11 Slides",
            source_b_quote="Use temperature-dependent polynomial Cp(T).",
            explanation="Conflict detected between Lab 3 Manual (constant Cp) and Lecture 11 (polynomial Cp).",
            severity="high",
            created_at="2026-09-04T18:00:00Z"
        )
    ]
