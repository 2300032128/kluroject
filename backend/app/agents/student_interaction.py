import json
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

INTENT_TYPES = [
    "conceptual question",
    "definition",
    "calculation",
    "comparison",
    "application",
    "clarification",
    "off-topic",
    "assessment request",
    "sensitive question"
]

class StudentInteractionAgent:
    """
    Agent 1: Student Interaction Agent
    - Strictly responsible for Understanding & Classification ONLY.
    - Does NOT generate final grounded answers.
    - Outputs exact structured JSON contract.
    """

    def __init__(self, gemini_client: Optional[Any] = None):
        self.client = gemini_client
        if not self.client and settings.GEMINI_API_KEY and not settings.DEMO_MODE:
            try:
                from google import genai
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                print(f"[StudentInteractionAgent] Could not init Gemini client: {e}")

    def analyze(self, question: str, subject_context: str = "Thermodynamics") -> Dict[str, Any]:
        """
        Parses student question and returns exact JSON schema:
        {
          "intent": "conceptual question",
          "subject": "Thermodynamics",
          "topic": "Entropy",
          "module": "Week 6 - Entropy",
          "keywords": ["entropy", "isolated system"],
          "requires_clarification": false,
          "sensitivity": "normal"
        }
        """
        if self.client:
            try:
                prompt = f"""You are a syllabus classification agent for a university course on {subject_context}.
Analyze the following student question and output ONLY a valid JSON object.

Student Question: "{question}"

Possible Intent categories (choose EXACTLY ONE):
- conceptual question
- definition
- calculation
- comparison
- application
- clarification
- off-topic
- assessment request
- sensitive question

Output JSON format strictly matching keys:
{{
  "intent": "<ONE_OF_THE_INTENTS>",
  "subject": "{subject_context}",
  "topic": "<TOPIC_NAME>",
  "module": "<MODULE_NAME>",
  "keywords": ["keyword1", "keyword2"],
  "requires_clarification": false,
  "sensitivity": "normal"
}}
"""
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                if response and response.text:
                    cleaned_json = response.text.strip().replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(cleaned_json)
                    return self._validate_and_normalize(parsed, question, subject_context)
            except Exception as e:
                print(f"[StudentInteractionAgent] Gemini LLM parse fallback: {e}")

        # Deterministic Fallback Logic (for DEMO_MODE or offline execution)
        return self._deterministic_analyze(question, subject_context)

    def _deterministic_analyze(self, question: str, subject_context: str) -> Dict[str, Any]:
        q_lower = question.lower()

        # 1. Sensitivity & Safety Check
        if any(w in q_lower for w in ["hack", "cheat", "leak test", "stolen exam", "bypass"]):
            return {
                "intent": "sensitive question",
                "subject": subject_context,
                "topic": "Academic Integrity Policy",
                "module": "Course Administration",
                "keywords": ["cheating", "exam policy", "academic integrity"],
                "requires_clarification": True,
                "sensitivity": "flagged_academic_integrity"
            }

        # 2. Assessment Request Check (e.g. Scenario 4)
        if any(w in q_lower for w in ["exam", "answers to", "answers for", "tomorrow's exam", "assignment score", "my grade", "quiz answer key", "solution manual", "homework solution"]):
            return {
                "intent": "assessment request",
                "subject": subject_context,
                "topic": "Course Grading & Assignments",
                "module": "Course Administration",
                "keywords": ["exam", "answers", "assessment"],
                "requires_clarification": False,
                "sensitivity": "flagged_academic_integrity"
            }

        # 3. Off-Topic Check (e.g. Scenario 3)
        if any(w in q_lower for w in ["world cup", "who will win", "football", "chocolate cake", "baking", "recipe", "pizza", "movie", "weather"]):
            return {
                "intent": "off-topic",
                "subject": "General",
                "topic": "Non-Academic",
                "module": "Out of Syllabus",
                "keywords": ["off-topic"],
                "requires_clarification": True,
                "sensitivity": "normal"
            }

        # 4. Calculation Intent
        if any(w in q_lower for w in ["calculate", "compute", "find the efficiency for", "numerical", "=", "t_h=", "t_c="]) or re.search(r'\d+\s*(k|j|c|w|pa)', q_lower):
            topic = "Carnot Engine" if "carnot" in q_lower or "efficiency" in q_lower else ("Heat Transfer" if "heat" in q_lower else "First Law")
            module = "Week 3 - Heat Engines" if topic == "Carnot Engine" else "Week 2 - First Law"
            return {
                "intent": "calculation",
                "subject": subject_context,
                "topic": topic,
                "module": module,
                "keywords": self._extract_keywords(question),
                "requires_clarification": False,
                "sensitivity": "normal"
            }

        # 5. Comparison Intent
        if any(w in q_lower for w in ["difference between", "compare", "versus", "vs", "distinguish"]):
            return {
                "intent": "comparison",
                "subject": subject_context,
                "topic": "Reversibility",
                "module": "Week 5 - Reversibility",
                "keywords": self._extract_keywords(question),
                "requires_clarification": False,
                "sensitivity": "normal"
            }

        # 6. Definition Intent
        if any(w in q_lower for w in ["what is a", "what is the definition", "define", "meaning of"]):
            topic = "Reversibility" if "reversible" in q_lower else ("Entropy" if "entropy" in q_lower else "Second Law")
            module = "Week 5 - Reversibility" if topic == "Reversibility" else ("Week 6 - Entropy" if topic == "Entropy" else "Week 4 - Second Law")
            return {
                "intent": "definition",
                "subject": subject_context,
                "topic": topic,
                "module": module,
                "keywords": self._extract_keywords(question),
                "requires_clarification": False,
                "sensitivity": "normal"
            }

        # 7. Application Intent
        if any(w in q_lower for w in ["how is", "where is", "used in", "application of", "practical", "refrigerator"]):
            return {
                "intent": "application",
                "subject": subject_context,
                "topic": "Heat Engines",
                "module": "Week 3 - Heat Engines",
                "keywords": self._extract_keywords(question),
                "requires_clarification": False,
                "sensitivity": "normal"
            }

        # 8. Clarification Intent
        if len(q_lower.split()) < 3 or q_lower in ["help", "entropy?", "formula"]:
            return {
                "intent": "clarification",
                "subject": subject_context,
                "topic": "General Thermodynamics",
                "module": "Week 1 - Fundamentals",
                "keywords": self._extract_keywords(question),
                "requires_clarification": True,
                "sensitivity": "normal"
            }

        # 9. Default Conceptual Question Intent
        topic = "Entropy" if "entropy" in q_lower else ("Carnot Engine" if "carnot" in q_lower else ("Second Law" if "second law" in q_lower else "Fundamentals"))
        module = "Week 6 - Entropy" if topic == "Entropy" else ("Week 3 - Heat Engines" if topic == "Carnot Engine" else ("Week 4 - Second Law" if topic == "Second Law" else "Week 1 - Fundamentals"))

        return {
            "intent": "conceptual question",
            "subject": subject_context,
            "topic": topic,
            "module": module,
            "keywords": self._extract_keywords(question),
            "requires_clarification": False,
            "sensitivity": "normal"
        }

    def _extract_keywords(self, question: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z]{3,}\b', question.lower())
        stopwords = {"what", "why", "how", "does", "the", "and", "for", "can", "is", "a", "an", "in", "of", "to", "with", "between", "this", "that"}
        keywords = [w for w in words if w not in stopwords]
        return list(dict.fromkeys(keywords))[:5]

    def _validate_and_normalize(self, data: Dict[str, Any], question: str, subject_context: str) -> Dict[str, Any]:
        intent = data.get("intent", "conceptual question")
        if intent not in INTENT_TYPES:
            intent = "conceptual question"

        return {
            "intent": intent,
            "subject": data.get("subject", subject_context),
            "topic": data.get("topic", "Entropy"),
            "module": data.get("module", "Week 6 - Entropy"),
            "keywords": data.get("keywords", self._extract_keywords(question)),
            "requires_clarification": bool(data.get("requires_clarification", False)),
            "sensitivity": data.get("sensitivity", "normal")
        }

student_interaction_agent = StudentInteractionAgent()
