import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.db.models import Question, Escalation, Answer

class EscalationAgent:
    """
    Agent 4: Escalation Agent
    - Evaluates 8 signals:
      1. low RAG confidence (< 0.70)
      2. no syllabus evidence (grounded: false)
      3. conflicting documents (contradiction_detected & unresolvable)
      4. ambiguous question (requires_clarification: true)
      5. sensitive question / academic integrity flag
      6. assessment / exam request
      7. instructor-specific policy
      8. student explicitly requests instructor
    - Decides among:
      - ANSWER
      - CLARIFY
      - ESCALATE
      - REDIRECT
    - Creates Escalation Tickets with status: PENDING | REVIEWED | RESOLVED
    """

    def process(
        self, 
        question: str, 
        interaction: Dict[str, Any], 
        grounding: Dict[str, Any], 
        contradiction: Optional[Dict[str, Any]] = None,
        question_id: Optional[str] = None,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        
        q_lower = question.lower()
        intent = interaction.get("intent", "conceptual question")
        requires_clarification = interaction.get("requires_clarification", False)
        sensitivity = interaction.get("sensitivity", "normal")
        
        grounded = grounding.get("grounded", True)
        confidence = grounding.get("confidence", 0.90)
        
        contra = contradiction or grounding.get("contradiction_analysis", {})
        contradiction_detected = contra.get("contradiction_detected", False)
        recommend_escalation = contra.get("recommend_escalation", False)
        contra_explanation = contra.get("explanation", "")

        # Signal 8: Explicit Student Request for Instructor
        student_wants_instructor = any(phrase in q_lower for phrase in [
            "talk to professor", "speak to instructor", "ask dr. vance", 
            "instructor review", "human help", "contact professor", "escalate"
        ])

        # Signal 7: Instructor-Specific Policy Query
        is_instructor_policy = any(kw in q_lower for kw in [
            "grading curve", "office hours", "extension", "re-grade", "policy", "late penalty"
        ])

        # Evaluate Decisions

        # 1. REDIRECT (Off-Topic)
        if intent == "off-topic" or "cake" in q_lower or "baking" in q_lower or "world cup" in q_lower or "who will win" in q_lower:
            decision = "REDIRECT"
            reason = "Question is off-topic and outside the scope of the course syllabus."
            should_ticket = False
            agent_confidence = 0.95

        # 2. ESCALATE (Human Intervention Triggers)
        elif student_wants_instructor:
            decision = "ESCALATE"
            reason = "Student explicitly requested human instructor assistance."
            should_ticket = True
            agent_confidence = 0.99

        elif sensitivity != "normal" or intent == "sensitive question":
            decision = "ESCALATE"
            reason = f"Academic integrity or sensitive query flagged ({sensitivity})."
            should_ticket = True
            agent_confidence = 0.96

        elif intent == "assessment request":
            decision = "ESCALATE"
            reason = "Assessment or homework solution manual request requires instructor clearance."
            should_ticket = True
            agent_confidence = 0.94

        elif contradiction_detected and recommend_escalation:
            decision = "ESCALATE"
            reason = f"Conflicting course material detected: {contra_explanation}"
            should_ticket = True
            agent_confidence = 0.88

        elif is_instructor_policy:
            decision = "ESCALATE"
            reason = "Instructor-specific policy or administrative query."
            should_ticket = True
            agent_confidence = 0.92

        elif not grounded or confidence < 0.30:
            decision = "ESCALATE"
            reason = "No relevant course syllabus evidence found in uploaded materials."
            should_ticket = True
            agent_confidence = 0.90

        elif confidence < 0.70:
            decision = "ESCALATE"
            reason = f"Low RAG grounding confidence score ({int(confidence * 100)}%)."
            should_ticket = True
            agent_confidence = 0.85

        # 3. CLARIFY (Ambiguous / Short / Incomplete Query)
        elif requires_clarification or len(question.strip()) < 8:
            decision = "CLARIFY"
            reason = "Question is vague or ambiguous; student clarification requested."
            should_ticket = False
            agent_confidence = 0.85

        # 4. ANSWER (High Confidence & Grounded)
        else:
            decision = "ANSWER"
            reason = "Syllabus grounded query resolved with high confidence."
            should_ticket = False
            agent_confidence = 0.95

        # Create Ticket in Database if active DB session and question_id provided
        ticket_id = None
        if db and question_id:
            q_rec = db.query(Question).filter(Question.id == question_id).first()
            if q_rec:
                if decision == "ESCALATE":
                    q_rec.status = "instructor_review"
                elif decision == "CLARIFY":
                    q_rec.status = "needs_clarification"
                elif decision == "REDIRECT":
                    q_rec.status = "redirected"
                else:
                    q_rec.status = "answered"
                db.commit()

            if should_ticket:
                esc_ticket = Escalation(
                    question_id=question_id,
                    reason=reason,
                    decision=decision,
                    confidence=confidence,
                    status="PENDING"
                )
                db.add(esc_ticket)
                db.commit()
                ticket_id = esc_ticket.id

        return {
            "decision": decision,
            "reason": reason,
            "confidence": agent_confidence,
            "should_escalate": should_ticket,
            "ticket_id": ticket_id
        }

escalation_agent = EscalationAgent()
