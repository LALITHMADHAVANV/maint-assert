import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { RouteGuard } from '@/components/layout/RouteGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <RouteGuard>
        <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </RouteGuard>
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-4 text-center no-print">
        <p>Garment Manufacturing Plant 03 • Coimbatore Unit • TexTech CMMS v4.2</p>
      </footer>
    </div>
  );
}
