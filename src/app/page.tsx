import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Layers,
  HelpCircle,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">GapFinder AI</span>
              <span className="text-[11px] block text-slate-400 font-mono">
                Sphoorthy Engineering College Hackathon 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
            >
              <span>Launch Demo Mode for Judges</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden text-center max-w-5xl mx-auto flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-xs font-semibold text-indigo-300 mx-auto mb-6 shadow-inner">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span>Purpose-Built for University Engineering Students</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Stop revising what you know. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-emerald-400">
            Find and fix your knowledge gaps.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Students frequently spend hours rereading comfortable chapters while leaving difficult gaps unaddressed.
          GapFinder AI indexes your university syllabus and lecture notes, tests your retention with strictly grounded diagnostic quizzes, calculates topic proficiency, and creates an actionable daily revision plan.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-600/40 inline-flex items-center gap-2"
          >
            <span>Explore Live Dashboard (1-Click Judge Access)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/quiz"
            className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700"
          >
            Take 5-Question Diagnostic Quiz
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-800 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Real RAG Pipeline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Splits syllabi and notes into overlapping chunks with page and section tags, generating vector embeddings for high-precision semantic retrieval.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-800 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Evidence-Based Gap Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Topics classified into Weak (&lt;50%), Medium (50-79%), or Strong (≥80%) based on quiz performance, avoiding false classifications on single questions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-800 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Actionable Revision Plan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically allocates your available daily study budget, prioritizing weak topics with cited lecture readings and practice exercises within your time limit.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-500">
        <p>GapFinder AI • Sphoorthy Engineering College Hackathon 2026</p>
        <p className="mt-1 text-[11px] text-slate-600">
          Strictly grounded in uploaded student materials • Real vector embeddings & citation verification
        </p>
      </footer>
    </div>
  );
}

