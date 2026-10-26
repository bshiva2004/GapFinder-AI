'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import {
  CalendarCheck,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  CheckSquare,
  Square,
} from 'lucide-react';

export default function RevisionPlanPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [banner, setBanner] = useState({ type: '', message: '' });

  // Inputs
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [examDate, setExamDate] = useState('');

  const loadPlan = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/revision-plan');
      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan);
        setDailyMinutes(data.plan.dailyAvailableMinutes || 60);
        if (data.plan.examDate) {
          setExamDate(data.plan.examDate);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setBanner({ type: '', message: '' });

    try {
      const res = await fetch('/api/revision-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dailyAvailableMinutes: dailyMinutes,
          examDate: examDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate revision plan.');
      }

      setPlan(data.plan);
      setBanner({
        type: 'success',
        message: data.message || 'Personalized revision plan generated successfully!',
      });
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const res = await fetch('/api/revision-plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      if (res.ok) {
        // Toggle locally
        setPlan((prev) => {
          if (!prev) return prev;
          const updatedTasks = prev.tasks.map((t) =>
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
          );
          return { ...prev, tasks: updatedTasks };
        });
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const completedCount = plan?.tasks ? plan.tasks.filter((t) => t.isCompleted).length : 0;
  const totalTasks = plan?.tasks ? plan.tasks.length : 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <AppShell
      title="Personalized Revision Timetable"
      description="Allocates your available daily study time dynamically, prioritizing detected weak topics while ensuring total planned time stays within your limit."
    >
      {/* Banner */}
      {banner.message && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
            banner.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {banner.type === 'error' ? (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs font-semibold">{banner.message}</div>
        </div>
      )}

      {/* Grid: Plan Configurator (Left 1 col) & Schedule (Right 2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plan Configurator */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Plan Parameters</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your daily study time and upcoming exam date.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Available Daily Study Time (Minutes)
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyMinutes(mins)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    dailyMinutes === mins
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
            <input
              type="number"
              min="20"
              max="480"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Or enter custom minutes"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Exam Date (Optional)
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{plan ? 'Regenerate Revision Plan' : 'Generate Revision Plan'}</span>
              </>
            )}
          </button>

          {/* Allocation Philosophy Notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-1">
            <span className="font-semibold text-slate-700 block">Pedagogical Allocation Rule:</span>
            <p>• Weak Topics: ~55% of study budget for deep conceptual drills.</p>
            <p>• Medium Topics: ~30% for targeted review of missed items.</p>
            <p>• Strong / Insufficient: ~15% for rapid retention checks.</p>
            <p className="font-medium text-indigo-700 pt-1">
              ✓ Total planned time strictly does not exceed daily limit.
            </p>
          </div>
        </div>

        {/* Actionable Task Schedule (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Actionable Revision Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {plan
                  ? `${plan.totalPlannedMinutes} minutes total planned for today's session (${totalTasks} tasks)`
                  : 'Generate a plan based on your quiz gap metrics.'}
              </p>
            </div>

            {plan && (
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-600">
                  Progress: {completedCount}/{totalTasks} done ({progressPercent}%)
                </span>
                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading revision plan...</div>
          ) : !plan || plan.tasks?.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-800">No active revision plan</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click "Generate Revision Plan" on the left to allocate your daily study budget across weak and medium topics.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {plan.tasks.map((task, idx) => {
                const typeBadges = {
                  deep_dive: 'bg-rose-50 text-rose-700 border-rose-200',
                  concept_review: 'bg-amber-50 text-amber-700 border-amber-200',
                  practice_quiz: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  quick_refresh: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                };

                const typeNames = {
                  deep_dive: 'Deep Dive (Weak Topic)',
                  concept_review: 'Concept Review (Medium)',
                  practice_quiz: 'Practice Quiz Check',
                  quick_refresh: 'Quick Refresh (Strong)',
                };

                return (
                  <div
                    key={task.id || idx}
                    className={`p-4 rounded-xl border transition-all ${
                      task.isCompleted
                        ? 'bg-slate-50/80 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {task.isCompleted ? (
                            <CheckSquare className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                        <div>
                          <span
                            className={`font-semibold text-sm ${
                              task.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {task.topic}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                            typeBadges[task.taskType] || typeBadges.concept_review
                          }`}
                        >
                          {typeNames[task.taskType] || task.taskType}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {task.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 ml-8 leading-relaxed mb-3">
                      {task.description}
                    </p>

                    {/* Cited Section Passages */}
                    {task.citedPassages && task.citedPassages.length > 0 && (
                      <div className="ml-8 p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-0.5">
                          <BookOpen className="h-3 w-3 text-indigo-500" />
                          <span>
                            {task.citedPassages[0].docTitle} ({task.citedPassages[0].pageOrSection})
                          </span>
                        </div>
                        <p className="italic text-slate-500 line-clamp-2">
                          "{task.citedPassages[0].excerpt}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
