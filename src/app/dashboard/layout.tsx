import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { RouteGuard } from '@/components/layout/RouteGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <RouteGuard>
          <main className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </main>
        </RouteGuard>
        <footer className="bg-white/80 border-t border-slate-200 text-slate-400 text-xs py-3 text-center no-print mt-auto">
          <p>TexTech Garments CMMS • Coimbatore Unit</p>
        </footer>
      </div>
    </div>
  );
}
