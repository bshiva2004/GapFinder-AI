'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import {
  FileText,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  BookOpen,
  Sparkles,
  Award,
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    documentsCount: 0,
    attemptsCount: 0,
    overallAccuracy: 0,
    weakCount: 0,
    mediumCount: 0,
    strongCount: 0,
    insufficientDataCount: 0,
    topicReports: [],
    recentAttempts: [],
    activePlan: null,
  });

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [docsRes, gapRes, historyRes, planRes] = await Promise.all([
          fetch('/api/materials'),
          fetch('/api/gap-report'),
          fetch('/api/quiz/history'),
          fetch('/api/revision-plan'),
        ]);

        const docsJson = await docsRes.json();
        const gapJson = await gapRes.json();
        const historyJson = await historyRes.json();
        const planJson = await planRes.json();

        const report = gapJson.report || {};

        setData({
          documentsCount: docsJson.totalDocuments || 0,
          attemptsCount: historyJson.totalAttempts || 0,
          overallAccuracy: report.overallAccuracy || 0,
          weakCount: report.weakCount || 0,
          mediumCount: report.mediumCount || 0,
          strongCount: report.strongCount || 0,
          insufficientDataCount: report.insufficientDataCount || 0,
          topicReports: report.topicReports || [],
          recentAttempts: historyJson.attempts || [],
          activePlan: planJson.plan || null,
        });
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <AppShell
      title="Student Progress & Knowledge Gap Dashboard"
      description="Real-time mastery tracking computed strictly from your diagnostic quiz submissions and uploaded study material."
    >
      {/* Top Banner for Hackathon Judges */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-xs font-semibold text-indigo-200 mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Sphoorthy Engineering College Hackathon 2026 Evaluation Ready
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome to GapFinder AI</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Unlike generic chat assistants, GapFinder AI evaluates your knowledge against your university curriculum, detects weak topics using statistical thresholds, and constructs a grounded revision schedule.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/quiz"
              className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/30 inline-flex items-center gap-2"
            >
              Take Diagnostic Quiz <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/gap-report"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700"
            >
              View Gap Analysis
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Uploaded Documents */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Study Materials</span>
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.documentsCount}</div>
          <p className="text-xs text-slate-500 mt-1">Syllabi & lecture notes indexed</p>
        </div>

        {/* Quiz Attempts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quiz Attempts</span>
            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HelpCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.attemptsCount}</div>
          <p className="text-xs text-slate-500 mt-1">Saved diagnostic evaluations</p>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Accuracy</span>
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{data.overallAccuracy}%</div>
          <p className="text-xs text-slate-500 mt-1">Evidence-based answer accuracy</p>
        </div>

        {/* Knowledge Gaps Identified */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weak Topics</span>
            <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{data.weakCount}</div>
          <p className="text-xs text-slate-500 mt-1">Below 50% threshold requiring action</p>
        </div>
      </div>

      {/* Main Content Grid: Topic Performance + Revision Plan Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Topic-Wise Performance Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Curriculum Topic Mastery</h3>
              <p className="text-xs text-slate-500">Classified as Weak (&lt;50%), Medium (50-79%), or Strong (≥80%)</p>
            </div>
            <Link
              href="/gap-report"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Full Gap Report <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading topic performance...</div>
          ) : data.topicReports.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 font-medium">No diagnostic attempts recorded yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Take your first 5-question diagnostic quiz to generate authentic topic gap metrics.
              </p>
              <Link
                href="/quiz"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Launch Diagnostic Quiz
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {data.topicReports.map((topic, i) => {
                const badgeColors = {
                  weak: 'bg-rose-100 text-rose-800 border-rose-200',
                  medium: 'bg-amber-100 text-amber-800 border-amber-200',
                  strong: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  insufficient_data: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                const barColors = {
                  weak: 'bg-rose-500',
                  medium: 'bg-amber-500',
                  strong: 'bg-emerald-500',
                  insufficient_data: 'bg-slate-400',
                };

                return (
                  <div key={i} className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-sm text-slate-800">{topic.topic}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {topic.questionsCorrect}/{topic.questionsAttempted} correct ({topic.accuracyPercentage}%)
                        </span>
                        <span
                          className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                            badgeColors[topic.classification] || badgeColors.insufficient_data
                          }`}
                        >
                          {topic.classification.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          barColors[topic.classification] || barColors.insufficient_data
                        }`}
                        style={{ width: `${Math.max(5, topic.accuracyPercentage)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-1">{topic.classificationReason}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Revision Plan Summary (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <CalendarCheck className="h-5 w-5" />
                <h3 className="font-bold text-slate-900 text-base">Active Revision Plan</h3>
              </div>
              <Link href="/revision-plan" className="text-xs text-indigo-600 hover:underline font-semibold">
                View Plan
              </Link>
            </div>

            {data.activePlan && data.activePlan.tasks?.length > 0 ? (
              <div>
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 mb-4">
                  <div className="text-xs text-indigo-700 font-medium">Daily Study Allocation</div>
                  <div className="text-lg font-bold text-indigo-950 mt-0.5">
                    {data.activePlan.totalPlannedMinutes} / {data.activePlan.dailyAvailableMinutes} mins planned
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Priority Tasks</div>
                  {data.activePlan.tasks.slice(0, 3).map((task, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">{task.topic}</span>
                        <span className="font-mono text-[11px] text-slate-500">{task.durationMinutes}m</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <CalendarCheck className="h-9 w-9 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">No revision plan generated yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Once your diagnostic quiz reveals your weak topics, generate a personalized timetable.
                </p>
                <Link
                  href="/revision-plan"
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100"
                >
                  Generate Plan
                </Link>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6">
            <Link
              href="/assistant"
              className="flex items-center justify-between text-xs font-medium text-slate-600 hover:text-indigo-600 p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 transition-colors"
            >
              <span>Need help on a topic? Ask Your Materials</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quiz History Row */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Diagnostic Evaluation History</h3>
            <p className="text-xs text-slate-500">Track score improvements across multiple diagnostic attempts.</p>
          </div>
          <Link
            href="/quiz"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            New Quiz Attempt <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {data.recentAttempts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No quiz attempts recorded yet. Attempt a quiz to see your progress history.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.recentAttempts.map((att, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    #{data.recentAttempts.length - idx}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-800">{att.quizTitle}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(att.completedAt).toLocaleString()} • {att.correctAnswersCount}/{att.totalQuestions} questions correct
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold text-sm px-3 py-1 rounded-full ${
                      att.scorePercentage >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : att.scorePercentage >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {att.scorePercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

