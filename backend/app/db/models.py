import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(50), default="student") # 'student', 'instructor'
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("Question", back_populates="student", cascade="all, delete-orphan")
    reviews = relationship("InstructorReview", back_populates="instructor")

class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    code = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    instructor_name = Column(String(255), default="Dr. Robert Vance")
    created_at = Column(DateTime, default=datetime.utcnow)

    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="course", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="course", cascade="all, delete-orphan")
    analytics_events = relationship("AnalyticsEvent", back_populates="course", cascade="all, delete-orphan")

class Module(Base):
    __tablename__ = "modules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    week_number = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="modules")
    documents = relationship("Document", back_populates="module", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    module_id = Column(String(36), ForeignKey("modules.id"), nullable=True)
    title = Column(String(255), nullable=False)
    file_type = Column(String(50), default="pdf")
    file_url = Column(Text, nullable=True)
    content_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="documents")
    module = relationship("Module", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    embedding = Column(JSON, nullable=True) # Serialized vector array
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="chunks")
    retrievals = relationship("RetrievalResult", back_populates="document_chunk", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    subject = Column(String(255), default="Thermodynamics")
    topic = Column(String(255), nullable=True)
    module = Column(String(255), nullable=True)
    intent = Column(String(255), default="concept_clarification")
    status = Column(String(50), default="answered") # 'answered', 'instructor_review', 'escalated'
    confidence = Column(Float, default=0.95)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="questions")
    course = relationship("Course", back_populates="questions")
    agent_runs = relationship("AgentRun", back_populates="question", cascade="all, delete-orphan")
    retrieval_results = relationship("RetrievalResult", back_populates="question", cascade="all, delete-orphan")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
    escalations = relationship("Escalation", back_populates="question", cascade="all, delete-orphan")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=False)
    agent_name = Column(String(255), nullable=False)
    step_index = Column(Integer, nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    confidence = Column(Float, default=1.0)
    status = Column(String(50), default="success") # 'success', 'warning', 'info', 'escalated'
    execution_time_ms = Column(Integer, default=120)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="agent_runs")

class RetrievalResult(Base):
    __tablename__ = "retrieval_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=False)
    document_chunk_id = Column(String(36), ForeignKey("document_chunks.id"), nullable=False)
    similarity_score = Column(Float, nullable=False)
    rank = Column(Integer, default=1)
    snippet = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="retrieval_results")
    document_chunk = relationship("DocumentChunk", back_populates="retrievals")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=False)
    answer_text = Column(Text, nullable=False)
    key_takeaway = Column(Text, nullable=True)
    citations = Column(JSON, nullable=True) # list of dicts {title, page, snippet}
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="answers")

class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=False)
    reason = Column(Text, nullable=False)
    decision = Column(Text, nullable=True)
    confidence = Column(Float, default=0.45)
    status = Column(String(50), default="pending") # 'pending', 'resolved', 'dismissed'
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    question = relationship("Question", back_populates="escalations")
    reviews = relationship("InstructorReview", back_populates="escalation", cascade="all, delete-orphan")

class InstructorReview(Base):
    __tablename__ = "instructor_reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    escalation_id = Column(String(36), ForeignKey("escalations.id"), nullable=False)
    instructor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    review_text = Column(Text, nullable=False)
    action_taken = Column(String(100), default="approved_answer")
    created_at = Column(DateTime, default=datetime.utcnow)

    escalation = relationship("Escalation", back_populates="reviews")
    instructor = relationship("User", back_populates="reviews")

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    event_type = Column(String(100), nullable=False) # 'doubt_asked', 'escalation_triggered', 'misconception_flagged'
    topic = Column(String(255), nullable=True)
    question_id = Column(String(36), ForeignKey("questions.id"), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="analytics_events")
