"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar, { SidebarProvider } from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";
import ToastProvider from "@/components/providers/ToastProvider";

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
    if (mounted) {
      // Check if user is authenticated
      if (!token || !user) {
        router.push("/login");
        return;
      }

      // SECURITY: Verify user has proper role for landlord dashboard
      // Only LANDLORD and PROPERTY_MANAGER roles can access this dashboard
      const allowedRoles = ["LANDLORD", "PROPERTY_MANAGER"];
      if (!allowedRoles.includes(user.role)) {
        console.warn(
          `[Security] Unauthorized access attempt: User with role '${user.role}' tried to access landlord dashboard`,
        );
        
        // Redirect tenant users to tenant dashboard
        if (user.role === "TENANT") {
          router.push("/tenant-dashboard");
        } else {
          // Redirect unknown roles to login
          router.push("/login");
        }
      }
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

  // Show loading if not authenticated or role not authorized
  if (!token || !user) {
    return null;
  }

  // SECURITY: Prevent rendering dashboard if user role is not authorized
  const allowedRoles = ["LANDLORD", "PROPERTY_MANAGER"];
  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  return (
    <>
      <ToastProvider />
      <SidebarProvider>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar />

          <div className="flex flex-col flex-1 min-w-0">
            <Navbar />
            <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6 flex-1">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
