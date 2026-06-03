"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CreditCard, Wrench, LogOut, X, FileText } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// Create context for mobile menu state
const TenantSidebarContext = createContext<{
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}>({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
});

export const useTenantSidebar = () => useContext(TenantSidebarContext);

export function TenantSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <TenantSidebarContext.Provider
      value={{ isMobileMenuOpen, toggleMobileMenu }}
    >
      {children}
    </TenantSidebarContext.Provider>
  );
}

export default function TenantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useTenantSidebar();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  const menuItems = [
    {
      title: "Overview",
      icon: LayoutDashboard,
      path: "/tenant-dashboard",
    },
    {
      title: "Payments",
      icon: CreditCard,
      path: "/tenant-dashboard/payments",
    },
    {
      title: "Tenant Agreements",
      icon: FileText,
      path: "/tenant-dashboard/contracts",
    },
    {
      title: "Maintenance",
      icon: Wrench,
      path: "/tenant-dashboard/maintenance",
    },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen w-64 bg-slate-900 text-white flex flex-col
          z-50 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link
            href="/tenant-dashboard"
            className="flex items-center gap-2"
            onClick={handleLinkClick}
          >
            <div className="bg-emerald-500 p-1.5 rounded-md">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">SmartRent</span>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="mb-4 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tenant Portal
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-l-3 border-emerald-500"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-slate-800 hover:text-white transition-all text-slate-300 text-left"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-xs text-slate-500 border-t border-slate-800 text-center">
          © 2026 SmartRent
        </div>
      </aside>
    </>
  );
}
