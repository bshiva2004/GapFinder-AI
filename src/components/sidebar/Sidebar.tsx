'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Network,
  HelpCircle,
  BarChart3,
  CalendarCheck,
  MessageSquare,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Materials', href: '/materials', icon: FileText },
  { name: 'Topic Map', href: '/topic-map', icon: Network },
  { name: 'Diagnostic Quiz', href: '/quiz', icon: HelpCircle },
  { name: 'Gap Report', href: '/gap-report', icon: BarChart3 },
  { name: 'Revision Plan', href: '/revision-plan', icon: CalendarCheck },
  { name: 'Ask Your Material', href: '/assistant', icon: MessageSquare },
  { name: 'Account / Mode', href: '/account', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight flex items-center gap-1.5">
              GapFinder <span className="text-indigo-400 font-mono text-sm px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-800">AI</span>
            </div>
            <p className="text-xs text-slate-400">Sphoorthy Hackathon 2026</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Hackathon Judge Pill & Mission */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="rounded-lg p-3 bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Grounded Knowledge Gap Detection</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Identifies study weaknesses using real source passages & creates targeted revision plans.
          </p>
        </div>
      </div>
    </aside>
  );
}

