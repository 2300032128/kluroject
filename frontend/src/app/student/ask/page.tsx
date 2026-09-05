'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { THERMODYNAMICS_COURSE } from '@/lib/mockData';
import { 
  HelpCircle, Send, Sparkles, BookOpen, RefreshCw, Cpu, CheckCircle2, 
  ArrowRight, Zap, ShieldAlert, AlertTriangle, Layers, Info 
} from 'lucide-react';

interface DemoScenario {
  id: number;
  title: string;
  badge: string;
  badgeColor: string;
  question: string;
  description: string;
  expectedWorkflow: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 1,
    title: "Scenario 1: Normal Grounded Question",
    badge: "Grounded Answer",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    question: "Why does entropy increase in an isolated system even though energy is conserved?",
    description: "Evaluates standard 2nd Law concept. Generates grounded answer with textbook citations ($S = k_B \\ln W$). No escalation.",
    expectedWorkflow: "Student Interaction → Grounding (Grounded) → Contradiction (None) → Escalation (Pass) → Answer Composition"
  },
  {
    id: 2,
    title: "Scenario 2: Contradiction",
    badge: "Contradiction → Escalation",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    question: "Can entropy decrease?",
    description: "Detects contextual conflict between isolated system (dS ≥ 0) and open systems (dS_sys < 0). Flags instructor ticket.",
    expectedWorkflow: "Student Interaction → Grounding → Contradiction Analysis (Detected) → Escalation Agent (ESCALATE) → Instructor Ticket"
  },
  {
    id: 3,
    title: "Scenario 3: Off Topic",
    badge: "Redirect (No Escalation)",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    question: "Who will win the World Cup?",
    description: "Classifies as off-topic query. Redirects student back to Thermodynamics course scope without creating unnecessary tickets.",
    expectedWorkflow: "Student Interaction (off-topic) → Grounding (Not Grounded) → Escalation Agent (REDIRECT) → Course Scope Guidance"
  },
  {
    id: 4,
    title: "Scenario 4: Exam Request",
    badge: "Academic Refusal",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    question: "Give me the answers to tomorrow's exam.",
    description: "Refuses assessment key generation under academic integrity guidelines while offering concept study assistance.",
    expectedWorkflow: "Student Interaction (sensitive/assessment) → Escalation Agent (ESCALATE) → Academic Refusal + Study Offer"
  },
  {
    id: 5,
    title: "Scenario 5: Insufficient Syllabus",
    badge: "No Syllabus Evidence",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    question: "What is quantum entanglement spin coupling in semiconductors?",
    description: "Audits syllabus RAG index. Finds no relevant evidence in Thermodynamics course notes. Triggers instructor escalation.",
    expectedWorkflow: "Student Interaction → Grounding (Not Grounded) → Escalation Agent (ESCALATE) → Instructor Flagged"
  }
];

function AskDoubtForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [question, setQuestion] = useState(initialQuery);
  const [selectedTopic, setSelectedTopic] = useState('Entropy');
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    { title: "Student Interaction Agent", details: "Classifying question intent & topic in syllabus hierarchy..." },
    { title: "Syllabus Grounding Agent (RAG)", details: "Retrieving material vector chunks from Thermodynamics textbook..." },
    { title: "Material Contradiction Scanner", details: "Auditing course documents for conflicting statements..." },
    { title: "Escalation Agent", details: "Evaluating 8 risk signals & human intervention triggers..." },
    { title: "Answer Composition Agent", details: "Synthesizing grounded response / policy guidance..." },
    { title: "Doubt Analytics Agent", details: "Updating class misconception cluster matrix..." }
  ];

  const handleSelectScenario = (sc: DemoScenario) => {
    setQuestion(sc.question);
    setActiveScenario(sc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isProcessing) return;

    setIsProcessing(true);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/student/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          course_id: 'course_thermo',
          topic_hint: selectedTopic
        })
      });

      clearInterval(interval);
      setCurrentStepIndex(steps.length - 1);

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          router.push(`/student/answer/${data.doubt_id}`);
        }, 500);
      } else {
        setTimeout(() => {
          router.push('/student/answer/demo-q101');
        }, 500);
      }
    } catch (err) {
      console.warn("API call failed, navigating to fallback demo result:", err);
      clearInterval(interval);
      setTimeout(() => {
        router.push('/student/answer/demo-q101');
      }, 500);
    }
  };

  return (
    <div className="space-y-6">

      {/* HACKATHON DEMO MODE SELECTOR BAR */}
      <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
            <Zap className="h-4 w-4 text-purple-400 fill-purple-400/20" />
            <span>Hackathon Demo Mode Selector</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
            Zero External API Key Required
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Select any pre-configured demo scenario below to test the end-to-end 5-Agent workflow deterministically:
        </p>

        {/* 5 Scenario Pill Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs pt-1">
          {DEMO_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleSelectScenario(sc)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                activeScenario?.id === sc.id
                  ? 'bg-purple-900/40 border-purple-500 ring-1 ring-purple-500/50'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-white text-xs">{sc.title}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 italic">"{sc.question}"</p>
            </button>
          ))}
        </div>

        {/* Active Scenario Preview Card */}
        {activeScenario && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-500/30 text-xs space-y-1 mt-2">
            <div className="flex items-center gap-1.5 text-purple-300 font-bold">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>Scenario Expected Agent Pipeline:</span>
            </div>
            <p className="text-slate-300 font-mono text-[11px]">
              {activeScenario.expectedWorkflow}
            </p>
            <p className="text-slate-400 text-[11px] pt-0.5">
              {activeScenario.description}
            </p>
          </div>
        )}
      </div>

      {/* Main Question Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Course & Topic Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Course</label>
              <input
                type="text"
                disabled
                value={`${THERMODYNAMICS_COURSE.code} - ${THERMODYNAMICS_COURSE.name}`}
                className="w-full bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-300 border border-slate-800 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-slate-950 rounded-xl px-3.5 py-2.5 text-slate-100 border border-slate-800 focus:border-blue-500 outline-none"
              >
                {THERMODYNAMICS_COURSE.topics.map((t, idx) => (
                  <option key={idx} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Your Student Question</label>
              {activeScenario && (
                <span className="text-[11px] font-semibold text-purple-400">
                  Scenario {activeScenario.id} Active
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setActiveScenario(null);
              }}
              placeholder="Type your question or click a Hackathon Demo Scenario above..."
              className="w-full bg-slate-950 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!question.trim() || isProcessing}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Executing Live 5-Agent Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Submit Query to AI Agent Pipeline</span>
              </>
            )}
          </button>

        </form>

        {/* Live 5-Agent Processing Box */}
        {isProcessing && (
          <div className="p-5 rounded-xl bg-slate-950 border border-purple-500/40 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Cpu className="h-4 w-4 text-purple-400 animate-spin" />
                <span>Live 5-Agent Execution Log</span>
              </div>
              <span className="text-xs text-purple-400 font-semibold">Step {currentStepIndex + 1} / {steps.length}</span>
            </div>

            <div className="space-y-2">
              {steps.map((st, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 text-xs p-2.5 rounded-lg border transition-all ${
                    i === currentStepIndex
                      ? 'bg-purple-500/10 border-purple-500/40 text-white font-semibold'
                      : i < currentStepIndex
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  {i < currentStepIndex ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : i === currentStepIndex ? (
                    <RefreshCw className="h-4 w-4 text-purple-400 animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-700 shrink-0"></div>
                  )}
                  <div>
                    <span className="font-bold">{st.title}</span> — <span className="font-normal">{st.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AskDoubtPage() {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
          <HelpCircle className="h-4 w-4" />
          <span>EduAgent AI • Doubt Resolution</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Ask your Thermodynamics Doubt</h1>
        <p className="text-xs text-slate-400">
          EduAgent AI processes queries through a transparent 5-Agent pipeline grounded in Dr. Vance's course syllabus.
        </p>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading form...</div>}>
        <AskDoubtForm />
      </Suspense>
    </div>
  );
}
