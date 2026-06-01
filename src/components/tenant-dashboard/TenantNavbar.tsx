"use client";

import { useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useTenantSidebar } from "./TenantSidebar";

export default function TenantNavbar() {
  const { user } = useAuthStore();
  const { toggleMobileMenu } = useTenantSidebar();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-30">
      {/* Left side - Hamburger + Title */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        {/* Hamburger Menu Button - Only visible on mobile/tablet */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>

        {/* Page Title - Hidden on small mobile */}
        <h2 className="hidden sm:block text-lg font-semibold text-slate-900">
          Tenant Portal
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
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
    </header>
  );
}
