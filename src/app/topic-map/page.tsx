'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Network,
  Sparkles,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function TopicMapPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [banner, setBanner] = useState({ type: '', message: '' });

  // Add custom topic modal/form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newUnit, setNewUnit] = useState('Unit I');
  const [newSubtopics, setNewSubtopics] = useState('');

  const loadTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/topics');
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleExtractFromSyllabus = async () => {
    setExtracting(true);
    setBanner({ type: '', message: '' });

    try {
      const res = await fetch('/api/topics/extract', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract topics from syllabus.');
      }

      setBanner({
        type: 'success',
        message: `Extracted ${data.topicsCount} units & topics strictly from your course syllabus.`,
      });
      await loadTopics();
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    } finally {
      setExtracting(false);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    try {
      const subtopicsArr = newSubtopics
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTopicName.trim(),
          unit: newUnit.trim(),
          subtopics: subtopicsArr,
        }),
      });

      if (!res.ok) throw new Error('Failed to add topic.');

      setBanner({ type: 'success', message: `Added topic "${newTopicName}".` });
      setNewTopicName('');
      setNewSubtopics('');
      setShowAddModal(false);
      await loadTopics();
    } catch (err) {
      setBanner({ type: 'error', message: err.message });
    }
  };

  const handleDeleteTopic = async (id, name) => {
    if (!confirm(`Delete topic "${name}" from topic map?`)) return;

    try {
      const res = await fetch(`/api/topics?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBanner({ type: 'success', message: `Deleted topic "${name}".` });
        await loadTopics();
      }
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to delete topic.' });
    }
  };

  return (
    <AppShell
      title="Curriculum Topic Map"
      description="Extracted curriculum taxonomy connecting syllabus units to supporting passages in your lecture notes and textbooks."
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

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="font-bold text-slate-900 text-base">Course Curriculum Map</div>
          <p className="text-xs text-slate-500">
            {topics.length} topics mapped to textbook references and lecture notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200"
          >
            <Plus className="h-4 w-4" /> Add Topic
          </button>
          <button
            onClick={handleExtractFromSyllabus}
            disabled={extracting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm shadow-indigo-600/30 disabled:opacity-50"
          >
            {extracting ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Extracting from Syllabus...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Auto-Extract From Syllabus</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Add Topic to Curriculum Map</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the topic unit and subtopics to include in diagnostic quizzes.
            </p>

            <form onSubmit={handleAddTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit / Module</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="e.g. Unit III: Trees"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Name</label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. Binary Search Trees & AVL Rotations"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtopics (comma-separated)
                </label>
                <input
                  type="text"
                  value={newSubtopics}
                  onChange={(e) => setNewSubtopics(e.target.value)}
                  placeholder="e.g. In-order Traversal, BST Property, Balance Factor"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Cards List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading topic map...</div>
      ) : topics.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Network className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-800">No topics mapped yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Upload your course syllabus in "My Materials" and click "Auto-Extract From Syllabus" to map the course topics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {t.unit || 'Unit'}
                  </span>
                  <button
                    onClick={() => handleDeleteTopic(t.id, t.name)}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Remove topic"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-2">{t.name}</h4>

                {/* Subtopics Chips */}
                {t.subtopics && t.subtopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {t.subtopics.map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100 font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                )}

                {/* Associated Notes Citation */}
                {t.sourcePassageExcerpt && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 mb-1">
                      <LinkIcon className="h-3 w-3 text-indigo-500" />
                      <span>{t.sourceDocTitle || 'Study Notes'} • Page {t.sourcePage || 1}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] line-clamp-2 italic">
                      "{t.sourcePassageExcerpt}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action to take quiz on this specific topic */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Grounded in curriculum</span>
                <Link
                  href={`/quiz?topic=${encodeURIComponent(t.name)}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                >
                  <HelpCircle className="h-3.5 w-3.5" /> Quiz on this topic
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

