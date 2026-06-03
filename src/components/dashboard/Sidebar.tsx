"use client";

import { useState, createContext, useContext, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Building2,
  DoorOpen,
  Users,
  CreditCard,
  Wrench,
  BarChart3,
  Bell,
  CreditCard as Subscription,
  Settings,
  LogOut,
  X,
  MessageCircle,
  FileText,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useMaintenanceStore } from "@/store/maintenanceStore";
import { useNotificationStore } from "@/store/notificationStore";
import SupportChatModal from "@/components/support/SupportChatModal";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Properties", href: "/dashboard/properties", icon: Building2 },
  { name: "Units", href: "/dashboard/units", icon: DoorOpen },
  { name: "Tenants", href: "/dashboard/tenants", icon: Users },
  { name: "Vacancies", href: "/dashboard/vacancies", icon: Home, requiresPlan: ['PROFESSIONAL', 'PREMIUM'] },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
  { name: "Tenancy Agreements", href: "/dashboard/contracts", icon: FileText },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

const bottomItems = [
  { name: "Subscription", href: "/dashboard/subscription", icon: Subscription },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

// Create context for mobile menu state
const SidebarContext = createContext<{
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}>({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isMobileMenuOpen, toggleMobileMenu }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const { subscription, fetchSubscription } = useSubscriptionStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useSidebar();
  const pendingCount = useMaintenanceStore((state) => state.pendingCount);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const [showSupportChat, setShowSupportChat] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isActive = (href: string) => pathname === href;
  const showPendingBadge = user?.role ? ['LANDLORD', 'PROPERTY_MANAGER', 'ADMIN'].includes(user.role) : false;

  const hasAccess = (requiresPlan?: string[]) => {
    if (!requiresPlan) return true;
    return requiresPlan.includes(subscription?.plan || '');
  };

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
            href="/dashboard"
            className="flex items-center gap-2"
            onClick={handleLinkClick}
          >
            <div className="bg-emerald-500 p-1.5 rounded-md">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">SmartRentUG</span>
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

        {/* Main Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasAccessToItem = hasAccess(item.requiresPlan);

            // Hide menu item if user doesn't have access
            if (!hasAccessToItem) {
              return null;
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${
                    active
                      ? "bg-emerald-500/10 text-emerald-400 border-l-3 border-emerald-500"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium flex-1">{item.name}</span>
                {item.name === "Maintenance" && showPendingBadge && pendingCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {pendingCount}
                  </span>
                )}
                {item.name === "Notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="p-4 space-y-1 border-t border-slate-800">
          {/* Customer Support Button */}
          <button
            onClick={() => setShowSupportChat(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-300 hover:bg-slate-800 hover:text-white w-full"
          >
            <MessageCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Customer Support</span>
          </button>

          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${
                    active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-slate-300 hover:bg-slate-800 hover:text-white w-full"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-xs text-slate-500 border-t border-slate-800 text-center">
          © 2026 SmartRentUG
        </div>
      </aside>

      {/* Support Chat Modal */}
      <SupportChatModal
        isOpen={showSupportChat}
        onClose={() => setShowSupportChat(false)}
      />
    </>
  );
}
