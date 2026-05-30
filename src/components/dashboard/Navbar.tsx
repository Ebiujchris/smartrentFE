"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useSidebar } from "./Sidebar";

export default function Navbar() {
  const { user } = useAuthStore();
  const { subscription, fetchSubscription } = useSubscriptionStore();
  const { toggleMobileMenu } = useSidebar();
  const [showSearch, setShowSearch] = useState(false);

  // Fetch subscription on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-30">
      {/* Left side - Hamburger + Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        {/* Hamburger Menu Button - Only visible on mobile/tablet */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>

        {/* Search - Responsive */}
        <div className="relative flex-1 max-w-xl">
          {/* Desktop/Tablet Search Bar */}
          <div className="hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenants, payments, properties..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Mobile Search Icon */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="sm:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        {/* Subscription Badge - Hidden on mobile */}
        {subscription && (
          <span className="hidden md:inline-block px-3 py-1.5 text-xs lg:text-sm font-medium bg-emerald-100 text-emerald-700 rounded-full whitespace-nowrap">
            {subscription.plan} Plan
          </span>
        )}

        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">
              {user?.fullName}
            </p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showSearch && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-3 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
