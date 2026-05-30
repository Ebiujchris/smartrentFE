"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import TenantSidebar, {
  TenantSidebarProvider,
} from "@/components/tenant-dashboard/TenantSidebar";
import TenantNavbar from "@/components/tenant-dashboard/TenantNavbar";
import ToastProvider from "@/components/providers/ToastProvider";

export default function TenantDashboardLayout({
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
      router.push("/login");
    } else if (mounted && user?.role !== "TENANT") {
      router.push("/dashboard");
    }
  }, [token, user, router, mounted]);

  if (!mounted || !token || !user || user?.role !== "TENANT") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastProvider />
      <TenantSidebarProvider>
        <div className="flex min-h-screen bg-slate-50">
          <TenantSidebar />

          <div className="flex flex-col flex-1 min-w-0">
            <TenantNavbar />
            <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6 flex-1">
              {children}
            </main>
          </div>
        </div>
      </TenantSidebarProvider>
    </>
  );
}
