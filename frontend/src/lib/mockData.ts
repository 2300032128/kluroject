export interface DemoQuestion {
  id: string;
  course: string;
  question: string;
  topic: string;
  module: string;
  confidence: number;
  status: 'Answered' | 'Instructor Review' | 'Escalated';
  askedAt: string;
  studentName?: string;
  studentId?: string;
  answer?: string;
  keyTakeaway?: string;
  sources?: { title: string; page: number; snippet: string }[];
  contradictionAnalysis?: {
    contradiction_detected: boolean;
    severity: 'low' | 'medium' | 'high' | 'none';
    explanation: string;
    resolvable_from_context: boolean;
    confidence: number;
    recommend_escalation: boolean;
  };
  agentTrace?: {
    step: number;
    agent: string;
    action: string;
    details: string;
    status: 'success' | 'warning' | 'info';
    executionTimeMs: number;
  }[];
}

export interface CourseMaterialItem {
  id: string;
  title: string;
  type: string;
  module: string;
  chunksCount: number;
  uploadedAt: string;
  hasContradiction: boolean;
  contradictionText?: string;
}

export const THERMODYNAMICS_COURSE = {
  name: "Thermodynamics",
  code: "ME202",
  instructor: "Dr. Robert Vance",
  term: "Fall 2026",
  totalStudents: 120,
  questionsToday: 87,
  aiResolved: 74,
  escalations: 8,
  pendingReview: 5,
  topics: [
    { name: "Entropy", count: 34, percentage: 39 },
    { name: "Second Law", count: 26, percentage: 30 },
    { name: "Carnot Engine", count: 18, percentage: 21 },
    { name: "Heat Transfer", count: 9, percentage: 10 },
  ]
};

export const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: "q-101",
    course: "Thermodynamics",
    question: "Why does entropy increase in an isolated system?",
    topic: "Entropy",
    module: "Module 3: Second Law & Entropy",
    confidence: 0.96,
    status: "Answered",
    askedAt: "10 mins ago",
    studentName: "Alex Rivera",
    studentId: "STU-8821",
    answer: "According to the **Second Law of Thermodynamics**, the total entropy ($S$) of an isolated system can never decrease over time ($dS \\ge 0$). An isolated system spontaneously evolves towards thermodynamic equilibrium — the state with the maximum microstates ($W$), defined by Boltzmann's equation $S = k_B \\ln W$.\n\nBecause microscopic states are vastly more likely to be disordered than ordered, natural processes move towards higher probability configuration states, causing a net increase in entropy.",
    keyTakeaway: "Entropy increases because isolated systems naturally progress towards microstate configurations of maximum statistical probability (thermodynamic equilibrium).",
    sources: [
      { title: "Thermodynamics Textbook (8th Ed)", page: 184, snippet: "The Second Law dictates dS >= 0 for isolated systems. Equilibrium corresponds to maximum statistical multiplicity W." },
      { title: "Lecture 7 Slides: Entropy Mechanics", page: 12, snippet: "Microstate counting demonstrates that non-equilibrium states naturally decay into equilibrium maximum entropy configurations." }
    ],
    agentTrace: [
      { step: 1, agent: "Student Interaction Agent", action: "Intent & Scope Classification", details: "Identified core topic 'Entropy' in Module 3 of Thermodynamics syllabus.", status: "success", executionTimeMs: 120 },
      { step: 2, agent: "Syllabus Grounding Agent (RAG)", action: "Vector Document Retrieval", details: "Retrieved 4 chunks from Textbook Ch. 7 & Lecture 7 slides with 96% vector similarity score.", status: "success", executionTimeMs: 210 },
      { step: 3, agent: "Syllabus Grounding Agent (RAG)", action: "Material Contradiction Scan", details: "Scanned retrieved chunks. No conflicting definitions or formulas found.", status: "success", executionTimeMs: 95 },
      { step: 4, agent: "Answer Composition Agent", action: "Grounded Synthesis", details: "Synthesized direct answer with Boltzmann equation reference and 2 textbook citations.", status: "success", executionTimeMs: 340 },
      { step: 5, agent: "Doubt Analytics Agent", action: "Cluster Aggregation", details: "Logged query into 'Entropy & Microstates' misconception cluster (#34 in class).", status: "success", executionTimeMs: 45 }
    ]
  },
  {
    id: "q-102",
    course: "Thermodynamics",
    question: "What is a reversible process?",
    topic: "Second Law",
    module: "Module 2: Reversibility & Carnot Cycles",
    confidence: 0.92,
    status: "Answered",
    askedAt: "25 mins ago",
    studentName: "Elena Rostova",
    studentId: "STU-9042",
    answer: "A **reversible process** is an idealized thermodynamic process that can be reversed by making infinitely small (quasi-static) changes to the system's environment without leaving any net change in either the system or its surroundings.\n\nKey conditions for reversibility:\n1. **Quasi-static equilibrium**: System moves infinitely slowly through equilibrium states.\n2. **Zero dissipation**: No friction, electrical resistance, or uncontrolled viscous expansion.",
    keyTakeaway: "A reversible process leaves zero entropy footprint in both the system and surroundings when reversed.",
    sources: [
      { title: "Thermodynamics Textbook (8th Ed)", page: 142, snippet: "A process is reversible if both system and surroundings can be restored to initial states." }
    ],
    agentTrace: [
      { step: 1, agent: "Student Interaction Agent", action: "Topic Identification", details: "Mapped question to Module 2: Reversibility.", status: "success", executionTimeMs: 110 },
      { step: 2, agent: "Syllabus Grounding Agent (RAG)", action: "Retrieval & Confidence Check", details: "High relevance score (92%). Textbook Page 142 retrieved.", status: "success", executionTimeMs: 180 },
      { step: 3, agent: "Answer Composition Agent", action: "Response Generation", details: "Grounded response generated.", status: "success", executionTimeMs: 290 }
    ]
  },
  {
    id: "q-103",
    course: "Thermodynamics",
    question: "Can entropy decrease locally in a open system?",
    topic: "Entropy",
    module: "Module 3: Second Law & Entropy",
    confidence: 0.48,
    status: "Instructor Review",
    askedAt: "45 mins ago",
    studentName: "Marcus Vance",
    studentId: "STU-7719",
    answer: "⚠️ **Under Human Instructor Review**\n\nWhile entropy can decrease locally in an open or non-isolated system (e.g. freezing water inside a refrigerator), entropy of the surrounding universe must increase by a greater amount ($\Delta S_{total} = \Delta S_{sys} + \Delta S_{surr} \ge 0$).\n\n*Note: This query was flagged for instructor review due to conflicting phrasing in Homework 4 Problem 2.*",
    keyTakeaway: "Local entropy decrease is allowed in open systems, provided surroundings gain greater entropy.",
    sources: [
      { title: "Homework 4 Problem Sheet", page: 2, snippet: "Problem 2 asks whether local entropy reduction violates Second Law." },
      { title: "Lecture 8 Notes", page: 5, snippet: "Refrigeration cycles transfer heat Q_out, reducing local system entropy." }
    ],
    contradictionAnalysis: {
      contradiction_detected: true,
      severity: "medium",
      explanation: "Apparent contradiction detected: Document A states entropy cannot decrease (referring to isolated systems), while Document B notes local entropy can decrease in open systems provided surroundings gain greater entropy.",
      resolvable_from_context: true,
      confidence: 0.76,
      recommend_escalation: false
    },
    agentTrace: [
      { step: 1, agent: "Student Interaction Agent", action: "Topic Parsing", details: "Identified 'Local Entropy Decrease'.", status: "success", executionTimeMs: 105 },
      { step: 2, agent: "Syllabus Grounding Agent (RAG)", action: "Contradiction Check", details: "Flagged potential ambiguity in Homework 4 phrasing vs Lecture 8 formulation. Confidence score 76%.", status: "warning", executionTimeMs: 230 },
      { step: 3, agent: "Escalation Agent", action: "Escalation Flagged", details: "Automatically routed ticket to Dr. Vance's Instructor Queue.", status: "warning", executionTimeMs: 60 }
    ]
  },
  {
    id: "q-104",
    course: "Thermodynamics",
    question: "What limits the efficiency of a Carnot Engine?",
    topic: "Carnot Engine",
    module: "Module 2: Reversibility & Carnot Cycles",
    confidence: 0.95,
    status: "Answered",
    askedAt: "1 hour ago",
    studentName: "Sophia Chen",
    studentId: "STU-6520",
    answer: "The efficiency of a Carnot engine is strictly limited by the absolute temperatures of its hot ($T_H$) and cold ($T_C$) reservoirs:\n$$\\eta_{Carnot} = 1 - \\frac{T_C}{T_H}$$\nNo engine operating between two thermal reservoirs can be more efficient than a Carnot engine operating between those same reservoirs.",
    keyTakeaway: "Carnot efficiency depends solely on absolute temperatures T_C and T_H, not working fluid.",
    sources: [
      { title: "Thermodynamics Textbook (8th Ed)", page: 160, snippet: "Carnot Efficiency formula eta = 1 - (T_C / T_H)." }
    ],
    agentTrace: [
      { step: 1, agent: "Student Interaction Agent", action: "Topic Mapping", details: "Module 2: Carnot Engine Efficiency.", status: "success", executionTimeMs: 115 },
      { step: 2, agent: "Syllabus Grounding Agent (RAG)", action: "RAG Retrieval", details: "Retrieved Page 160. Score 95%.", status: "success", executionTimeMs: 175 }
    ]
  },
  {
    id: "q-105",
    course: "Thermodynamics",
    question: "In Lab 3, do we use constant specific heat or temperature-dependent heat capacity?",
    topic: "Heat Transfer",
    module: "Module 4: Heat Exchangers & Calorimetry",
    confidence: 0.64,
    status: "Escalated",
    askedAt: "2 hours ago",
    studentName: "David Kim",
    studentId: "STU-4310",
    answer: "⚠️ **Conflicting Course Documents Flagged**\n\n- **Lab 3 Manual (Page 4)** states: Assume constant heat capacity $C_p = 4.184 \\text{ J/g K}$.\n- **Lecture 11 Slides (Page 9)** states: Use temperature-dependent polynomial equation for range above 350K.\n\n*This contradiction has been escalated to Dr. Vance for clarification.*",
    keyTakeaway: "Awaiting instructor decision on whether constant or polynomial heat capacity is required for Lab 3 evaluation.",
    sources: [
      { title: "Lab 3 Manual", page: 4, snippet: "Assume constant heat capacity C_p = 4.184 J/g K." },
      { title: "Lecture 11 Slides", page: 9, snippet: "Use polynomial temperature dependent heat capacity C_p(T)." }
    ],
    contradictionAnalysis: {
      contradiction_detected: true,
      severity: "high",
      explanation: "Direct material conflict detected: Lab 3 Manual specifies constant Cp = 4.184 J/g K whereas Lecture 11 Slides specify temperature-dependent polynomial Cp(T). Unresolvable from context alone.",
      resolvable_from_context: false,
      confidence: 0.64,
      recommend_escalation: true
    },
    agentTrace: [
      { step: 1, agent: "Student Interaction Agent", action: "Lab Query Identified", details: "Module 4: Lab 3 Calorimetry.", status: "success", executionTimeMs: 100 },
      { step: 2, agent: "Syllabus Grounding Agent (RAG)", action: "Contradiction Detection", details: "Detected contradiction between Lab 3 Manual (constant C_p) vs Lecture 11 (polynomial C_p).", status: "warning", executionTimeMs: 240 },
      { step: 3, agent: "Escalation Agent", action: "Ticket Created", details: "Escalated ticket #ESC-105 to Instructor Queue.", status: "warning", executionTimeMs: 70 }
    ]
  }
];

export const DEMO_MATERIALS: CourseMaterialItem[] = [
  {
    id: "mat-1",
    title: "Thermodynamics Core Textbook (8th Edition)",
    type: "PDF Textbook",
    module: "All Modules",
    chunksCount: 142,
    uploadedAt: "Sep 01, 2026",
    hasContradiction: false
  },
  {
    id: "mat-2",
    title: "Module 3 Lecture Slides: Second Law & Entropy",
    type: "PDF Slides",
    module: "Module 3: Entropy",
    chunksCount: 38,
    uploadedAt: "Sep 02, 2026",
    hasContradiction: false
  },
  {
    id: "mat-3",
    title: "Lab 3 Manual: Calorimetry & Heat Capacity",
    type: "PDF Lab Guide",
    module: "Module 4: Heat Exchangers",
    chunksCount: 14,
    uploadedAt: "Sep 03, 2026",
    hasContradiction: true,
    contradictionText: "Conflicts with Lecture 11 regarding constant vs polynomial heat capacity specifications."
  },
  {
    id: "mat-4",
    title: "Homework 4 Specification & Problem Set",
    type: "PDF Assignment",
    module: "Module 3: Entropy",
    chunksCount: 12,
    uploadedAt: "Sep 04, 2026",
    hasContradiction: true,
    contradictionText: "Problem 2 local entropy formulation ambiguous relative to Lecture 8 open system notes."
  }
];
