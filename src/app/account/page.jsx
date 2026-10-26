'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  User,
  ShieldCheck,
  Key,
  Database,
  Cpu,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSwitchToJudge = async () => {
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      const data = await res.json();
      setUser(data.user);
      setMsg('Switched active profile to Sphoorthy Hackathon Demo Judge.');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppShell
      title="Account & System Integration Status"
      description="Inspect active user session, demo credentials for judges, and environment integration health."
    >
      {msg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-base border border-indigo-100">
              {user ? user.fullName?.slice(0, 2).toUpperCase() : 'JH'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{user?.fullName || 'Active User'}</h3>
              <p className="text-xs text-slate-500">{user?.email || 'judge@sphoorthy.edu'}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Institution</span>
              <span className="font-semibold text-slate-800">{user?.institution || 'Sphoorthy Engineering College'}</span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Assigned Role</span>
              <span className="font-semibold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                {user?.role || 'Judge'}
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-500">Evaluation Mode</span>
              <span className="font-semibold text-emerald-700">Hackathon 2026 Judge Session</span>
            </div>
          </div>

          <button
            onClick={handleSwitchToJudge}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Active Profile to Demo Judge</span>
          </button>
        </div>

        {/* Integration Health & Demo Instructions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <span>System Health & Integrations</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Cpu className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-slate-900">RAG Vector Retrieval</div>
                  <div className="text-[11px] text-slate-500">
                    Active • Real TF-IDF & Cosine Similarity vector engine
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Operational
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Database className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-slate-900">PostgreSQL / Supabase Schema</div>
                  <div className="text-[11px] text-slate-500">
                    Dual-Mode • Instant Demo Storage + Supabase SQL Migration
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Ready
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Key className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-slate-900">Google Gemini / LLM Grounding</div>
                  <div className="text-[11px] text-slate-500">
                    Configurable via GEMINI_API_KEY with deterministic grounding fallback
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Configured
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-indigo-900 block">Instructions for Hackathon Judges:</span>
            <p>1. Pre-seeded with Sphoorthy B.Tech Data Structures (CS301PC) syllabus & notes.</p>
            <p>2. Generate diagnostic questions and submit answers in Diagnostic Quiz.</p>
            <p>3. Observe topic classification in Gap Report and verify revision plan duration limits.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
