'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, MessageSquare, CheckCircle2, AlertTriangle, ShieldCheck, 
  TrendingUp, BookOpen, Cpu, Upload, FileText, X, Check, Edit3, 
  Send, Layers, Sparkles, Filter, ChevronRight, RefreshCw, BarChart3, HelpCircle, ArrowRight 
} from 'lucide-react';

interface OverviewData {
  students_count: number;
  questions_today: number;
  total_doubts: number;
  ai_resolved_count: number;
  escalated_count: number;
  ai_resolution_rate: number;
  escalation_rate: number;
  avg_confidence: number;
  low_confidence_count: number;
  retrieval_failures_count: number;
  most_confusing_topic: string;
}

interface TicketItem {
  id: string;
  question_id: string;
  student_question: string;
  topic: string;
  module: string;
  confidence: number;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | string;
  created_at: string;
  reason: string;
  retrieved_sources: string[];
  source_snippets: string[];
  potential_contradiction?: string;
  ai_reasoning_summary: string;
  suggested_answer: string;
}

interface DocumentItem {
  id: string;
  title: string;
  file_type: string;
  module: string;
  chunk_count: number;
  status: string;
  created_at: string;
}

export default function InstructorCommandCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'escalations' | 'knowledge' | 'performance'>('overview');
  
  // Data states
  const [overview, setOverview] = useState<OverviewData>({
    students_count: 42,
    questions_today: 4,
    total_doubts: 12,
    ai_resolved_count: 9,
    escalated_count: 2,
    ai_resolution_rate: 75.0,
    escalation_rate: 25.0,
    avg_confidence: 0.84,
    low_confidence_count: 2,
    retrieval_failures_count: 1,
    most_confusing_topic: 'Entropy'
  });

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [ticketFilter, setTicketFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED' | 'RESOLVED'>('PENDING');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [editedAnswer, setEditedAnswer] = useState<string>('');
  
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('');

  // Fetch initial data
  useEffect(() => {
    fetchOverview();
    fetchAnalytics();
    fetchEscalations();
    fetchDocuments();
  }, []);

  const fetchOverview = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/instructor/overview`);
      if (res.ok) setOverview(await res.json());
    } catch (e) {
      console.warn("Could not fetch overview metrics:", e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/instructor/analytics/details`);
      if (res.ok) setAnalyticsData(await res.json());
    } catch (e) {
      console.warn("Could not fetch analytics details:", e);
    }
  };

  const fetchEscalations = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/instructor/escalations?status_filter=ALL`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (e) {
      console.warn("Could not fetch escalations:", e);
    }
  };

  const fetchDocuments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/instructor/documents`);
      if (res.ok) setDocuments(await res.json());
    } catch (e) {
      console.warn("Could not fetch documents:", e);
    }
  };

  const handleOpenTicket = (t: TicketItem) => {
    setSelectedTicket(t);
    setEditedAnswer(t.suggested_answer);
  };

  const handleTicketAction = async (action: 'approve_answer' | 'edit_answer' | 'send_to_student' | 'mark_resolved') => {
    if (!selectedTicket) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/instructor/escalations/${selectedTicket.id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          edited_answer: editedAnswer
        })
      });

      if (res.ok) {
        fetchEscalations();
        fetchOverview();
        setSelectedTicket(null);
      }
    } catch (e) {
      console.warn("Ticket action failed:", e);
    }
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      const newDoc: DocumentItem = {
        id: `doc_${Date.now()}`,
        title: newDocTitle.trim(),
        file_type: "PDF",
        module: "Week 7 - Applications",
        chunk_count: 24,
        status: "Indexed",
        created_at: new Date().toISOString()
      };
      setDocuments([newDoc, ...documents]);
      setNewDocTitle('');
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 800);
  };

  const filteredTickets = tickets.filter(t => {
    if (ticketFilter === 'ALL') return true;
    return t.status.toUpperCase() === ticketFilter;
  });

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 rounded bg-purple-900/40 border border-purple-700/50">
              Instructor SaaS Command Center
            </span>
            <span className="text-xs text-slate-400">Thermodynamics ME202</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Instructor Control Portal</h1>
          <p className="text-xs text-slate-400">Dr. Robert Vance • Active Term: Fall 2026</p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button 
            onClick={() => { fetchOverview(); fetchEscalations(); fetchDocuments(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>OVERVIEW</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>DOUBT ANALYTICS</span>
        </button>

        <button
          onClick={() => setActiveTab('escalations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all relative ${
            activeTab === 'escalations'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>ESCALATION QUEUE</span>
          {overview.escalated_count > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-extrabold">
              {overview.escalated_count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'knowledge'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>KNOWLEDGE BASE</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'performance'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <Cpu className="h-4 w-4 text-cyan-400" />
          <span>AGENT PERFORMANCE</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: OVERVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Students */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Students</span>
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">{overview.students_count}</div>
              <p className="text-[11px] text-slate-400">Enrolled in Thermodynamics ME202</p>
            </div>

            {/* Questions Today */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Questions Today</span>
                <MessageSquare className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">{overview.questions_today}</div>
              <p className="text-[11px] text-emerald-400 font-medium">↑ Active class engagement</p>
            </div>

            {/* AI Resolution Rate */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">AI Resolution Rate</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">{overview.ai_resolution_rate}%</div>
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overview.ai_resolution_rate}%` }}></div>
              </div>
            </div>

            {/* Escalations */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Escalations</span>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-400">{overview.escalated_count}</div>
              <p className="text-[11px] text-amber-300 font-medium">Requires instructor review</p>
            </div>

          </div>

          {/* Activity Overview Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Quick Actions & Status */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Command Center Quick Actions</span>
              </h2>

              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveTab('escalations')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-amber-300">Triage Escalation Queue ({overview.escalated_count})</h3>
                      <p className="text-[11px] text-slate-400">Review student questions with low confidence or material conflicts.</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white" />
                </button>

                <button
                  onClick={() => setActiveTab('knowledge')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                      <Upload className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white group-hover:text-blue-300">Upload Course Material</h3>
                      <p className="text-[11px] text-slate-400">Add slides, lab manuals, or textbook chapters to RAG index.</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white" />
                </button>
              </div>
            </div>

            {/* Confusing Topic Alert */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-400" />
                <span>Class Misconception Summary</span>
              </h2>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Most Confusing Topic:</span>
                <h3 className="text-lg font-bold text-white">{overview.most_confusing_topic}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  50% of student doubts relate to statistical multiplicity vs heat transfer assumptions in isolated systems.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <span>View Analytics Breakdown</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: DOUBT ANALYTICS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span>Most Asked Topics Breakdown</span>
            </h2>

            <div className="space-y-3">
              {(analyticsData?.top_topics || [
                { topic: "Entropy", count: 42, percentage: 50.0 },
                { topic: "Second Law", count: 31, percentage: 25.0 },
                { topic: "Carnot Engine", count: 12, percentage: 15.0 },
                { topic: "Heat Transfer", count: 8, percentage: 10.0 }
              ]).map((tp: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">{tp.topic}</span>
                    <span className="text-slate-400">{tp.count} questions ({tp.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" 
                      style={{ width: `${tp.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Module Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Module Distribution</h3>
              <div className="space-y-2">
                {(analyticsData?.questions_per_module || [
                  { module: "Week 6 - Entropy", count: 42 },
                  { module: "Week 5 - Reversibility", count: 26 },
                  { module: "Week 3 - Heat Engines", count: 18 },
                  { module: "Week 2 - First Law", count: 12 }
                ]).map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <span className="font-bold text-slate-200">{m.module}</span>
                    <span className="px-2.5 py-1 rounded-full bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30">
                      {m.count} doubts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confusing Concept Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Misconception Cluster</h3>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Week 6 Syllabus Node:</span>
                <h4 className="text-sm font-bold text-white">Entropy Microstate Multiplicity vs Heat Transfer</h4>
                <p className="text-xs text-slate-300">
                  Students frequently confuse local entropy reduction in open systems with total entropy generation $dS \ge 0$.
                </p>
                <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-300 font-medium">
                  💡 Suggested Action: Clarify microstate probability matrix during next lecture.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: ESCALATION QUEUE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'escalations' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Triage Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 glass-panel p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Triage Queue Status:</span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {(['ALL', 'PENDING', 'REVIEWED', 'RESOLVED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setTicketFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    ticketFilter === st
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List */}
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 text-xs text-slate-400">
                No escalation tickets found matching status '{ticketFilter}'.
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => handleOpenTicket(t)}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          t.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          t.status === 'REVIEWED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {t.status}
                        </span>
                        <span className="text-xs text-purple-300 font-bold">{t.topic}</span>
                        <span className="text-xs text-slate-400">• {t.module}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        "{t.student_question}"
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="text-slate-400">Confidence: <strong className="text-amber-400">{Math.round(t.confidence * 100)}%</strong></span>
                      <button className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md">
                        Review Ticket
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 italic">
                    Reason: {t.reason}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: KNOWLEDGE BASE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Document Upload Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Upload className="h-4 w-4 text-purple-400" />
              <span>Upload New Course Material</span>
            </h2>

            <form onSubmit={handleUploadDocument} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Document Title (e.g. Chapter 7: Reversible Work & Availability.pdf)"
                className="flex-1 bg-slate-950 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-purple-500 outline-none"
                required
              />
              <button
                type="submit"
                disabled={isUploading || !newDocTitle.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>Upload & Index</span>
              </button>
            </form>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Document parsed into chunks, vector embedded, and indexed into RAG memory successfully!</span>
              </div>
            )}
          </div>

          {/* Document Inventory */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span>Indexed Course Syllabus Documents ({documents.length})</span>
            </h3>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold uppercase text-[10px]">
                      {doc.file_type}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400">{doc.module} • {doc.chunk_count} Vector Chunks</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                    ✓ {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: AGENT PERFORMANCE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Avg Confidence */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Average Confidence</span>
              <div className="text-2xl font-extrabold text-blue-400">{Math.round(overview.avg_confidence * 100)}%</div>
              <p className="text-[11px] text-slate-400">Mean vector grounding score</p>
            </div>

            {/* Low Confidence Count */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Low Confidence Queries</span>
              <div className="text-2xl font-extrabold text-amber-400">{overview.low_confidence_count}</div>
              <p className="text-[11px] text-amber-300 font-medium">Confidence &lt; 70%</p>
            </div>

            {/* Retrieval Failures */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Retrieval Failures</span>
              <div className="text-2xl font-extrabold text-slate-300">{overview.retrieval_failures_count}</div>
              <p className="text-[11px] text-slate-400">Ungrounded / Out-of-syllabus</p>
            </div>

            {/* Escalation Rate */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Escalation Rate</span>
              <div className="text-2xl font-extrabold text-purple-400">{overview.escalation_rate}%</div>
              <p className="text-[11px] text-purple-300 font-medium">Triage escalation ratio</p>
            </div>

          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>5-Agent Pipeline Operational Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">✓ Agent 1: Student Interaction</span>
                <p className="text-slate-400 text-[11px]">Intent & Scope classification operational.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">✓ Agent 2: Syllabus Grounding</span>
                <p className="text-slate-400 text-[11px]">RAG Vector retrieval & chunk ranking operational.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">✓ Agent 3: Contradiction Analysis</span>
                <p className="text-slate-400 text-[11px]">Contextual conflict scanner operational.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">✓ Agent 4: Escalation Agent</span>
                <p className="text-slate-400 text-[11px]">8-Signal risk auditor operational.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">✓ Agent 5: Answer Composition</span>
                <p className="text-slate-400 text-[11px]">Pedagogical response synthesis operational.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">✓ Agent 6: Doubt Analytics</span>
                <p className="text-slate-400 text-[11px]">Real-time metrics tracking operational.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TICKET TRIAGE MODAL / DRAWER */}
      {/* ------------------------------------------------------------- */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                  Escalation Ticket Triage
                </span>
                <h2 className="text-lg font-bold text-white mt-1">Ticket #{selectedTicket.id}</h2>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Student Question */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Question:</span>
              <p className="text-base font-bold text-white">"{selectedTicket.student_question}"</p>
              <p className="text-xs text-slate-400 pt-1">
                Topic: <strong className="text-purple-300">{selectedTicket.topic}</strong> • {selectedTicket.module}
              </p>
            </div>

            {/* Potential Contradiction Banner */}
            {selectedTicket.potential_contradiction && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-1">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Potential Contradiction / Conflict Detected:</span>
                </span>
                <p className="text-slate-200 leading-relaxed pt-0.5">
                  {selectedTicket.potential_contradiction}
                </p>
              </div>
            )}

            {/* Source Snippets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Retrieved Course Material Snippets:</span>
              <div className="space-y-2 text-xs font-mono">
                {selectedTicket.source_snippets.map((sn, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
                    "{sn}"
                  </div>
                ))}
              </div>
            </div>

            {/* AI Reasoning Summary */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5 text-xs">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-purple-400" />
                <span>AI Pipeline Reasoning Summary:</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                {selectedTicket.ai_reasoning_summary}
              </p>
            </div>

            {/* Suggested Answer & Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Suggested Instructor Answer:</span>
                <span className="text-xs text-blue-400 font-semibold">Confidence: {Math.round(selectedTicket.confidence * 100)}%</span>
              </div>
              <textarea
                rows={5}
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                className="w-full bg-slate-900 rounded-xl p-4 text-xs text-slate-100 border border-slate-800 focus:border-purple-500 outline-none font-mono"
              />
            </div>

            {/* Triage Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs font-bold">
              <button
                onClick={() => handleTicketAction('approve_answer')}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Approve</span>
              </button>

              <button
                onClick={() => handleTicketAction('edit_answer')}
                className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center justify-center gap-1.5"
              >
                <Edit3 className="h-4 w-4" />
                <span>Save Edit</span>
              </button>

              <button
                onClick={() => handleTicketAction('send_to_student')}
                className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>

              <button
                onClick={() => handleTicketAction('mark_resolved')}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 shadow-md flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Resolve</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
