'use client';

import { useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';

export default function Navbar() {
  const { user } = useAuthStore();
  const { subscription, fetchSubscription } = useSubscriptionStore();

  // Fetch subscription on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // The subscription from the store will automatically update when changed
  // No need for additional useEffect since Zustand handles reactivity

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search tenants, payments, properties..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Subscription Badge */}
        {subscription && (
          <span className="px-3 py-1.5 text-sm font-medium bg-emerald-100 text-emerald-700 rounded-full">
            {subscription.plan} Plan
          </span>
        )}

        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
