from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class ReasoningStep(BaseModel):
    step: int
    agent: str
    title: str
    details: str
    status: str # 'success', 'warning', 'info', 'escalated'
    metadata: Optional[Dict[str, Any]] = None

class Citation(BaseModel):
    chunk_id: str
    material_title: str
    page_number: int
    snippet: str

class AskDoubtRequest(BaseModel):
    course_id: Optional[str] = "cs101_demo"
    question: str

class AskDoubtResponse(BaseModel):
    doubt_id: str
    question: str
    detected_topic: str
    is_syllabus_relevant: bool
    confidence_score: float
    has_contradiction: bool
    contradiction_details: Optional[str] = None
    status: str
    answer_text: str
    citations: List[Citation] = []
    reasoning_trace: List[ReasoningStep] = []
    created_at: datetime

class DoubtListItem(BaseModel):
    id: str
    question: str
    detected_topic_name: Optional[str]
    confidence_score: float
    status: str
    has_contradiction: bool
    created_at: datetime
    answer_text: Optional[str] = None

class ResolveEscalationRequest(BaseModel):
    instructor_answer: str

class InstructorTicketActionRequest(BaseModel):
    action: str  # 'approve_answer' | 'edit_answer' | 'send_to_student' | 'mark_resolved'
    edited_answer: Optional[str] = None

