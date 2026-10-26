'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  CalendarCheck,
  ArrowRight,
  TrendingUp,
  Info,
  BookOpen,
  Filter,
} from 'lucide-react';

export default function GapReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterClassification, setFilterClassification] = useState('all');

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const res = await fetch('/api/gap-report');
        const data = await res.json();
        setReport(data.report || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  const topicReports = report?.topicReports || [];
  const filteredTopics =
    filterClassification === 'all'
      ? topicReports
      : topicReports.filter((t) => t.classification === filterClassification);

  return (
    <AppShell
      title="Knowledge Gap Analysis Report"
      description="Evidence-based classification of curriculum topics into Weak (<50%), Medium (50-79%), or Strong (≥80%) mastery."
    >
      {/* Top Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Overall Accuracy
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {report ? report.overallAccuracy : 0}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Across all attempted quiz questions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Weak Topics (&lt;50%)
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-1">
            {report ? report.weakCount : 0}
          </div>
          <p className="text-xs text-rose-600/80 mt-1">High priority for revision</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Medium (50-79%)
            </span>
            <Info className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">
            {report ? report.mediumCount : 0}
          </div>
          <p className="text-xs text-amber-600/80 mt-1">Moderate comprehension</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Strong (≥80%)
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">
            {report ? report.strongCount : 0}
          </div>
          <p className="text-xs text-emerald-600/80 mt-1">Solid retention demonstrated</p>
        </div>
      </div>

      {/* Action Header & Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-400 mr-1" />
          {['all', 'weak', 'medium', 'strong', 'insufficient_data'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterClassification(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                filterClassification === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        <Link
          href="/revision-plan"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <CalendarCheck className="h-4 w-4" />
          <span>Generate Personalized Revision Plan</span>
        </Link>
      </div>

      {/* Topic Gap Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Computing gap analysis...</div>
      ) : filteredTopics.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-800">No topic performance data found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Take a diagnostic quiz to generate evidence-based topic evaluations.
          </p>
          <Link
            href="/quiz"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Take Diagnostic Quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTopics.map((topic, idx) => {
            const badgeConfigs = {
              weak: {
                label: 'Weak Topic',
                border: 'border-rose-200',
                badge: 'bg-rose-100 text-rose-800 border-rose-300',
                bar: 'bg-rose-500',
              },
              medium: {
                label: 'Medium Mastery',
                border: 'border-amber-200',
                badge: 'bg-amber-100 text-amber-800 border-amber-300',
                bar: 'bg-amber-500',
              },
              strong: {
                label: 'Strong Mastery',
                border: 'border-emerald-200',
                badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                bar: 'bg-emerald-500',
              },
              insufficient_data: {
                label: 'Not Enough Data',
                border: 'border-slate-200',
                badge: 'bg-slate-100 text-slate-700 border-slate-300',
                bar: 'bg-slate-400',
              },
            };

            const config = badgeConfigs[topic.classification] || badgeConfigs.insufficient_data;

            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border ${config.border} p-6 shadow-sm transition-all hover:shadow-md`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{topic.topic}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {topic.questionsCorrect} of {topic.questionsAttempted} questions answered correctly
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-700">
                      {topic.accuracyPercentage}%
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${config.badge}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${config.bar}`}
                    style={{ width: `${Math.max(5, topic.accuracyPercentage)}%` }}
                  />
                </div>

                {/* Classification Justification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1">
                      Reason for Classification
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {topic.classificationReason}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100/60">
                    <div className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider mb-1">
                      Recommended Next Action
                    </div>
                    <p className="text-xs text-indigo-950 leading-relaxed">
                      {topic.recommendedAction}
                    </p>
                  </div>
                </div>

                {/* Cited Source Passages */}
                {topic.relevantPassages && topic.relevantPassages.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200/60 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Reference in Uploaded Materials:</span>
                    </div>
                    <p className="text-[11px] italic text-slate-500 line-clamp-2">
                      "{topic.relevantPassages[0].excerpt}"
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Source: {topic.relevantPassages[0].docTitle} ({topic.relevantPassages[0].pageOrSection})
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

