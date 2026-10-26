'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  title: string;
  description?: string;
}

export default function Header({ title, description }: HeaderProps) {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleResetDemoData = async () => {
    if (!confirm('Reset study materials and topics to fresh Sphoorthy Engineering College demo dataset?')) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch('/api/materials/seed', { method: 'POST' });
      if (res.ok) {
        setResetMessage('Sample data reset successfully!');
        setTimeout(() => setResetMessage(''), 3000);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>

      <div className="flex items-center gap-4">
        {resetMessage && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{resetMessage}</span>
          </div>
        )}

        <button
          onClick={handleResetDemoData}
          disabled={resetting}
          className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
          title="Reload fresh Data Structures sample syllabus and notes"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Reset Sample Demo Data</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
            JH
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-slate-900">Judge Session</div>
            <div className="text-[10px] text-slate-500">judge@sphoorthy.edu</div>
          </div>
        </div>
      </div>
    </header>
  );
}
