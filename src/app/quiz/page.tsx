'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

function QuizContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get('topic') || 'All Topics';

  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [questionCount, setQuestionCount] = useState(5);

  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: optionIndex }

  // Submission Result State
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch('/api/topics');
        const data = await res.json();
        setTopics(data.topics || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchTopics();
  }, []);

  const handleGenerateQuiz = async () => {
    setGenerating(true);
    setErrorBanner('');
    setActiveQuiz(null);
    setSubmissionResult(null);
    setUserAnswers({});

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          count: questionCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate diagnostic quiz.');
      }

      setActiveQuiz(data);
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (submissionResult) return; // locked after submission
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    // Check if at least one question answered
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < activeQuiz.questions.length) {
      if (
        !confirm(
          `You have answered ${answeredCount} of ${activeQuiz.questions.length} questions. Submit anyway?`
        )
      ) {
        return;
      }
    }

    setSubmitting(true);
    setErrorBanner('');

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: activeQuiz.quizId,
          answers: userAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quiz.');
      }

      setSubmissionResult(data.attempt);
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Error Banner */}
      {errorBanner && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">Quiz Generation Notice</div>
            <div className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorBanner}</div>
          </div>
        </div>
      )}

      {/* Quiz Generator Control Panel (when no active quiz or want new quiz) */}
      {!activeQuiz && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Configure Diagnostic Quiz</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Questions are created strictly from retrieved passages in your uploaded syllabus and lecture notes. Correct answers are hidden until submission.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Topic / Scope
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="All Topics">All Topics (Comprehensive Course Evaluation)</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.unit ? `${t.unit}: ${t.name}` : t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Number of Questions
              </label>
              <div className="flex items-center gap-3">
                {[5, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      questionCount === num
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={generating}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {generating ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Retrieving Source Passages & Generating Grounded Questions...</span>
                </>
              ) : (
                <>
                  <HelpCircle className="h-4 w-4" />
                  <span>Generate Diagnostic Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Quiz Card / Result View */}
      {activeQuiz && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {activeQuiz.topic}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">{activeQuiz.title}</h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeQuiz.questions.length} questions • Grounded in student uploaded materials
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm('Start a new quiz session?')) {
                  setActiveQuiz(null);
                  setSubmissionResult(null);
                  setUserAnswers({});
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> New Quiz
            </button>
          </div>

          {/* Submission Score Banner if completed */}
          {submissionResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-16 w-16 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 ${
                      submissionResult.scorePercentage >= 80
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : submissionResult.scorePercentage >= 50
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {submissionResult.scorePercentage}%
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Quiz Completed: {submissionResult.correctAnswersCount} / {submissionResult.totalQuestions} Correct
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Results and question-level responses have been saved to your Gap Report.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/gap-report"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm inline-flex items-center gap-2"
                  >
                    View Gap Report <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {(submissionResult ? submissionResult.submittedAnswers : activeQuiz.questions).map(
              (q, qIdx) => {
                const questionId = submissionResult ? q.questionId : q.id;
                const selectedOption = userAnswers[questionId];
                const isSubmitted = Boolean(submissionResult);
                const isCorrect = isSubmitted && q.isCorrect;

                return (
                  <div
                    key={questionId}
                    className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
                      isSubmitted
                        ? isCorrect
                          ? 'border-emerald-300 bg-emerald-50/10'
                          : 'border-rose-300 bg-rose-50/10'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {qIdx + 1}
                        </span>
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          {q.topic}
                        </span>
                      </div>

                      {isSubmitted && (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" /> Incorrect
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <h4 className="font-semibold text-slate-900 text-sm mb-4 leading-relaxed">
                      {submissionResult ? q.questionText : q.question}
                    </h4>

                    {/* Options (A, B, C, D) */}
                    <div className="space-y-2.5 mb-4">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOption === optIdx;
                        const isTheCorrectAnswer = isSubmitted && q.correctOptionIndex === optIdx;
                        const isTheWrongSelection = isSubmitted && isSelected && !isCorrect;

                        let optionStyle = 'border-slate-200 hover:border-slate-300 bg-white';
                        if (isSubmitted) {
                          if (isTheCorrectAnswer) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
                          } else if (isTheWrongSelection) {
                            optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                          } else {
                            optionStyle = 'border-slate-200 opacity-60 bg-slate-50/50';
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-medium ring-2 ring-indigo-500/20';
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(questionId, optIdx)}
                            className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 transition-all cursor-pointer ${optionStyle}`}
                          >
                            <span
                              className={`h-6 w-6 rounded-lg font-bold text-[11px] flex items-center justify-center shrink-0 border ${
                                isSubmitted && isTheCorrectAnswer
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : isSubmitted && isTheWrongSelection
                                  ? 'bg-rose-600 text-white border-rose-600'
                                  : isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation and Citation Block (Shown AFTER Submission) */}
                    {isSubmitted && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        {/* Why incorrect message if failed */}
                        {q.incorrectExplanation && (
                          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                            <span className="font-bold">Feedback on your choice: </span>
                            {q.incorrectExplanation}
                          </div>
                        )}

                        {/* Explanation */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                          <span className="font-bold text-slate-900">Why this answer is correct: </span>
                          {q.explanation}
                        </div>

                        {/* Cited Passage Pill */}
                        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-950">
                          <div className="flex items-center gap-1.5 font-semibold text-indigo-700 mb-1">
                            <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                            <span>Source: {q.sourceDocTitle} ({q.sourcePageOrSection})</span>
                          </div>
                          <p className="italic text-slate-600 font-serif">
                            "{q.sourcePassageExcerpt}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* Submit Action Bar */}
          {!submissionResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {Object.keys(userAnswers).length} of {activeQuiz.questions.length} questions answered
              </span>

              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Answers...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submit Diagnostic Quiz</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function QuizPage() {
  return (
    <AppShell
      title="Diagnostic Knowledge Quiz"
      description="Evaluates your mastery through questions grounded in retrieved passages from your study materials."
    >
      <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading quiz environment...</div>}>
        <QuizContent />
      </Suspense>
    </AppShell>
  );
}

