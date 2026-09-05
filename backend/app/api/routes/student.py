from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.database import get_db
from app.db.models import Question, Answer, Module, Course, AgentRun
from app.schemas.doubt import AskDoubtRequest, AskDoubtResponse, DoubtListItem
from app.agents.orchestrator import agent_orchestrator

router = APIRouter(prefix="/student", tags=["student"])

@router.post("/ask", response_model=AskDoubtResponse)
def ask_doubt(req: AskDoubtRequest, db: Session = Depends(get_db)):
    course_id = req.course_id or "course_thermo"
    
    res = agent_orchestrator.process_doubt(
        question_text=req.question,
        course_id=course_id,
        db=db
    )
    
    return AskDoubtResponse(
        doubt_id=res["doubt_id"],
        question=res["question"],
        detected_topic=res["detected_topic"],
        is_syllabus_relevant=res["is_syllabus_relevant"],
        confidence_score=res["confidence_score"],
        has_contradiction=res["has_contradiction"],
        contradiction_details=res["contradiction_details"],
        status=res["status"],
        answer_text=res["answer_text"],
        citations=res["citations"],
        reasoning_trace=res["reasoning_trace"],
        created_at=res["created_at"]
    )

@router.get("/trace/{question_id}")
def get_agent_trace(question_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        # Fallback for mock IDs in frontend demo mode
        return {
            "question_id": question_id,
            "question": "Why does entropy increase in an isolated system?",
            "subject": "Thermodynamics",
            "topic": "Entropy",
            "module": "Week 6 - Entropy",
            "status": "answered",
            "confidence": 0.92,
            "created_at": "2026-09-05T12:00:00Z",
            "total_latency_ms": 480,
            "agent_runs": [
                {
                    "step_index": 1,
                    "agent_name": "Student Interaction Agent",
                    "action": "Intent & Scope Classification",
                    "details": "Intent: 'conceptual question' | Topic: 'Entropy' | Module: 'Week 6 - Entropy' | Sensitivity: 'normal'",
                    "input_data": {"question": "Why does entropy increase in an isolated system?", "subject": "Thermodynamics"},
                    "output_data": {"intent": "conceptual question", "subject": "Thermodynamics", "topic": "Entropy", "module": "Week 6 - Entropy", "keywords": ["entropy", "increase", "isolated"], "requires_clarification": False, "sensitivity": "normal"},
                    "status": "success",
                    "confidence": 0.95,
                    "execution_time_ms": 45
                },
                {
                    "step_index": 2,
                    "agent_name": "Syllabus Grounding Agent",
                    "action": "RAG Retrieval & Evidence Audit",
                    "details": "Grounded: True | Confidence: 91% | Sources Retrieved: 2 | Potential Conflicts: 0",
                    "input_data": {"question": "Why does entropy increase in an isolated system?"},
                    "output_data": {"grounded": True, "confidence": 0.91, "sources_count": 2, "potential_conflicts_count": 0},
                    "status": "success",
                    "confidence": 0.91,
                    "execution_time_ms": 115
                },
                {
                    "step_index": 3,
                    "agent_name": "Contradiction Analysis",
                    "action": "Contextual Conflict Evaluation",
                    "details": "Contradiction Detected: False | Severity: none | Resolvable: True",
                    "input_data": {"sources_count": 2},
                    "output_data": {"contradiction_detected": False, "severity": "none", "resolvable_from_context": True, "confidence": 0.95},
                    "status": "success",
                    "confidence": 0.95,
                    "execution_time_ms": 65
                },
                {
                    "step_index": 4,
                    "agent_name": "Escalation Agent",
                    "action": "Human Escalation Audit & Signal Routing",
                    "details": "Decision: 'ANSWER' | Should Escalate: False | Reason: Grounded query without material conflict",
                    "input_data": {"confidence": 0.91, "has_contradiction": False},
                    "output_data": {"decision": "ANSWER", "should_escalate": False, "reason": "Grounded query without material conflict"},
                    "status": "success",
                    "confidence": 0.95,
                    "execution_time_ms": 70
                },
                {
                    "step_index": 5,
                    "agent_name": "Answer Composition Agent",
                    "action": "Grounded Pedagogical Response Synthesis",
                    "details": "Synthesized grounded response referencing 'Week 6 - Entropy'. Citations: 2",
                    "input_data": {"question": "Why does entropy increase in an isolated system?"},
                    "output_data": {"key_takeaway": "Entropy increases because isolated systems progress towards maximum probability states.", "citations_count": 2},
                    "status": "success",
                    "confidence": 0.91,
                    "execution_time_ms": 145
                },
                {
                    "step_index": 6,
                    "agent_name": "Doubt Analytics Agent",
                    "action": "Real-Time Analytics & Event Logging",
                    "details": "Question logged to analytics database. Updated dynamic metrics for 'Entropy'.",
                    "input_data": {"topic": "Entropy"},
                    "output_data": {"status": "analytics_updated"},
                    "status": "success",
                    "confidence": 1.0,
                    "execution_time_ms": 40
                }
            ]
        }

    agent_runs = db.query(AgentRun).filter(AgentRun.question_id == question_id).order_by(AgentRun.step_index).all()
    
    total_latency = sum(r.execution_time_ms for r in agent_runs) if agent_runs else 480
    
    return {
        "question_id": question.id,
        "question": question.question_text,
        "subject": question.subject,
        "topic": question.topic,
        "module": question.module,
        "status": question.status,
        "confidence": question.confidence,
        "created_at": question.created_at,
        "total_latency_ms": total_latency,
        "agent_runs": [
            {
                "id": r.id,
                "step_index": r.step_index,
                "agent_name": r.agent_name,
                "action": r.action,
                "details": r.details,
                "input_data": r.input_data,
                "output_data": r.output_data,
                "status": r.status,
                "confidence": r.confidence,
                "execution_time_ms": r.execution_time_ms,
                "created_at": r.created_at
            }
            for r in agent_runs
        ]
    }

@router.get("/history", response_model=List[DoubtListItem])
def get_doubt_history(course_id: str = "course_thermo", db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.course_id == course_id).order_by(Question.created_at.desc()).all()
    results = []
    for q in questions:
        ans = db.query(Answer).filter(Answer.question_id == q.id).first()
        results.append(DoubtListItem(
            id=q.id,
            question=q.question_text,
            detected_topic_name=q.topic,
            confidence_score=q.confidence,
            status=q.status,
            has_contradiction=q.status in ["instructor_review", "escalated"],
            created_at=q.created_at,
            answer_text=ans.answer_text if ans else None
        ))
    return results

@router.get("/syllabus")
def get_syllabus(course_id: str = "course_thermo", db: Session = Depends(get_db)):
    modules = db.query(Module).filter(Module.course_id == course_id).order_by(Module.week_number).all()
    return [
        {
            "id": m.id,
            "title": m.title,
            "level": f"Week {m.week_number}",
            "description": m.description,
            "keywords": [m.title.lower()]
        }
        for m in modules
    ]
