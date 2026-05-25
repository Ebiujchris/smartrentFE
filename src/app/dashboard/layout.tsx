'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import ToastProvider from '@/components/providers/ToastProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!token || !user)) {
      router.push('/login');
    }
  }, [token, user, router, mounted]);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated
  if (!token || !user) {
    return null;
  }

  return (
    <>
      <ToastProvider />
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        
        <div className="flex flex-col flex-1">
          <Navbar />
          <main className="p-6 space-y-6 flex-1">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
