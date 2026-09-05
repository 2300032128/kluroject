# EduAgent AI — "Your AI Teaching Assistant, Grounded in Your Syllabus" 🚀

> **Hackathon Edition**: 5 Autonomous AI Agents Working Together to Deliver Hallucination-Free Academic Support with Automated Contradiction Scanner, Intelligent Escalation Triage, and Class Misconception Analytics.

---

## 🌟 Overview & Value Proposition

**EduAgent AI** solves the core problem of AI hallucinations in education. Generic LLMs fabricate answers, confuse course policies, and cannot detect when course materials contradict each other.

EduAgent AI introduces a **5-Agent Autonomous Pipeline** that:
1. **Understands Intent**: Classifies conceptual, calculation, comparison, definition, off-topic, or sensitive queries.
2. **Grounds in Syllabus**: Searches course material via RAG vector similarity and computes strict confidence metrics.
3. **Scans for Contradictions**: Analyzes retrieved course material for apparent or direct contradictions (e.g. constant vs polynomial heat capacity) before answering.
4. **Escalates Intelligently**: Automatically flags low-confidence, conflicting, or sensitive questions into an Instructor Triage Queue.
5. **Composes Pedagogical Answers**: Synthesizes structured, student-friendly answers with LaTeX formulas ($S = k_B \ln W$), key takeaways, and verified source citations.

---

## 🤖 The 5-Agent Architecture

```
Student Question
       │
       ▼
1. Student Interaction Agent  ─────► [Intent & Topic Classification]
       │
       ▼
2. Syllabus Grounding Agent   ─────► [RAG Vector Search & Evidence Ranking]
       │
       ▼
3. Contradiction Analysis      ─────► [Contextual Conflict Analysis]
       │
       ▼
4. Escalation Agent            ─────► [ANSWER | CLARIFY | ESCALATE | REDIRECT]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
5. Answer Composition Agent      Instructor Escalation Queue
       │ (Grounded Response)             (Triage & Draft Review)
       ▼                                 ▼
   Store Question ───────────────► Doubt Analytics Agent ──► Instructor Dashboard
```

---

## ✨ Key Features

- **100% Offline Hackathon Demo Mode**: Runs zero-config out of the box without requiring external API keys.
- **Visual Agent Execution Trace**: Step-by-step interactive timeline with per-agent latency indicators (ms) and raw JSON payload inspection.
- **LaTeX Math Support**: Seamless rendering of thermodynamic equations, formulas, and matrices.
- **Contradiction Alert Banners**: Standout amber alerts (`⚠️ Potential Contradiction Detected`) highlighting conflicting syllabus sources.
- **EdTech SaaS Instructor Command Center**:
  - **Overview**: Real-time KPIs, auto-resolution rates, and active escalation counters.
  - **Doubt Analytics**: Class misconception heatmaps, top confusing topics, and daily doubt trends.
  - **Escalation Queue**: Slide-over triage drawer supporting 1-click instructor response actions (**Approve**, **Edit**, **Send**, **Resolve**).
  - **Knowledge Base**: Document ingestion engine supporting PDF/PPTX/DOCX/TXT/MD indexing.

---

## 🏗️ Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Vanilla CSS Design System, Lucide Icons, KaTeX Math
- **Backend**: Python 3.14+, FastAPI, SQLAlchemy (PostgreSQL / SQLite), Pydantic v2
- **RAG & Search**: Scikit-Learn TF-IDF vector similarity matcher & contextual contradiction scanner
- **LLM Integration**: Google Gemini API (`google-genai` SDK) with deterministic fallback for offline hackathon judging
- **Testing**: Python `unittest` test suites covering all 5 agents and end-to-end API workflows

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+

### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment (Windows PowerShell)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Next.js development server
npm run dev
```
- **Student & Instructor App**: [http://localhost:3000](http://localhost:3000)

---

## 🔒 Environment Configuration

### Backend (`backend/.env`)
Create `backend/.env` from `backend/.env.example`:
```env
PROJECT_NAME="EduAgent AI"
API_V1_STR="/api"
PORT=8000
DEMO_MODE=true
DATABASE_URL="sqlite:///./eduagent.db"
GEMINI_API_KEY="" # Optional: Add key to use live Gemini API
```

### Frontend (`frontend/.env.local`)
Create `frontend/.env.local` from `frontend/.env.example`:
```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

---

## 🧪 Running Automated Unit & End-to-End Tests

Execute all test suites from the `backend/` directory:

```bash
cd backend

# Run individual agent & system test suites
python test_student_interaction_agent.py
python test_syllabus_grounding_agent.py
python test_contradiction_analysis.py
python test_answer_composition.py
python test_escalation_agent.py
python test_doubt_analytics_agent.py
python test_phase11_end_to_end.py
python test_hackathon_demo_mode.py
python test_instructor_command_center.py
```

---

## 📂 Repository Layout

```
.
├── backend/
│   ├── app/
│   │   ├── agents/          # The 5 Autonomous AI Agents
│   │   │   ├── student_interaction.py
│   │   │   ├── syllabus_grounding.py
│   │   │   ├── contradiction_analysis.py
│   │   │   ├── answer_composition.py
│   │   │   ├── escalation.py
│   │   │   └── doubt_analytics.py
│   │   ├── api/             # FastAPI Endpoint Routes
│   │   ├── core/            # Config, Exception Handling & Gemini SDK wrapper
│   │   └── db/              # Database Models & SQLAlchemy sessions
│   ├── main.py              # Application Entrypoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js Pages & Routes
│   │   │   ├── student/     # Student Ask, Dashboard & Agent Trace
│   │   │   └── instructor/  # Instructor SaaS Command Center
│   │   ├── components/      # UI Design Components & Diagrams
│   │   └── lib/             # API Client Interface
│   ├── package.json
│   └── tailwind.config.ts
├── .gitignore
└── README.md
```

---

## 🏆 Hackathon Scenarios to Test Live

1. **Scenario 1 (Grounded Question)**: *"Why does entropy increase in an isolated system even though energy is conserved?"* $\rightarrow$ Generates grounded response with LaTeX math & source citations.
2. **Scenario 2 (Contradiction)**: *"Can entropy decrease?"* $\rightarrow$ Flags potential contradiction alert banner & escalates to instructor.
3. **Scenario 3 (Off-Topic)**: *"Who will win the World Cup?"* $\rightarrow$ Politely redirects student back to course syllabus topics.
4. **Scenario 4 (Exam Request)**: *"Give me answers to tomorrow's exam."* $\rightarrow$ Refuses solution keys under academic integrity policy.
5. **Scenario 5 (Instructor Triage & Analytics)**: Open `/instructor` to view live escalation tickets, approve/edit answers, and analyze class doubt heatmaps.

---

## 📜 License

MIT License. Designed & Built for Hackathon KLU.
