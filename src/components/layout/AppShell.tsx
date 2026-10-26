'use client';

import React from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import Header from '@/components/header/Header';

interface AppShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function AppShell({ title, description, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={title} description={description} />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
