'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Send,
  MessageSquare,
  Sparkles,
  BookOpen,
  AlertTriangle,
  User,
  Bot,
  HelpCircle,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What is the balance factor condition for an AVL tree and what rotations restore balance?',
  'Why does Dijkstra single-source shortest path algorithm fail when negative edge weights are present?',
  'What causes primary clustering in open addressing hash tables with linear probing?',
  'How does row-major address calculation differ from column-major order in 2D arrays?',
  'Explain quantum teleportation in cryptography', // Out of syllabus test question to verify refusal!
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Hello! I am your GapFinder Academic Assistant. Ask any question about your course, and I will answer strictly using retrieved passages from your uploaded syllabus and lecture notes with exact page and section citations.\n\nIf a question is outside your uploaded study materials, I will explicitly notify you.',
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (textToSend) => {
    const question = textToSend || inputQuestion;
    if (!question.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to query assistant.');
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        isUnsupportedBySources: data.isUnsupportedBySources || false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: `Error: ${err.message}`,
          isUnsupportedBySources: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      title="Ask Your Material — Grounded AI Assistant"
      description="Strict Retrieval-Augmented Assistant. Answers exclusively from your uploaded study materials and cites exact documents and sections."
    >
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-14rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Suggested Queries Pill Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1 pl-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Prompts:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 whitespace-nowrap transition-colors text-[11px]"
            >
              {q.slice(0, 45)}...
            </button>
          ))}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : msg.isUnsupportedBySources
                        ? 'bg-rose-50 text-rose-950 border border-rose-200 rounded-bl-none'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.isUnsupportedBySources && (
                      <div className="flex items-center gap-1.5 font-bold text-rose-700 text-xs mb-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Source Grounding Limitation
                      </div>
                    )}
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {/* Citations Pill Box */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          Cited Source Passages:
                        </div>
                        {msg.citations.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600"
                          >
                            <div className="font-semibold text-indigo-900 flex items-center gap-1">
                              <BookOpen className="h-3 w-3 text-indigo-500" />
                              {c.docTitle} ({c.pageOrSection})
                            </div>
                            <div className="italic text-slate-500 text-[10px] mt-0.5 line-clamp-2">
                              "{c.excerpt}"
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 block px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-400 p-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Retrieving relevant chunks and verifying source evidence...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask a question about your uploaded materials (e.g. Explain AVL Rotations)..."
              disabled={loading}
              className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Ask</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
