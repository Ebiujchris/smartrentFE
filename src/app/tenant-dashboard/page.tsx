'use client';

import { useEffect } from 'react';
import { Home, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TenantOverviewPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.fullName}</h1>
        <p className="text-slate-600 mt-1">Here is your tenant dashboard overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats / Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Home className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Your Unit</p>
              <p className="text-xl font-bold text-slate-900">Active Lease</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Next Payment</p>
              <p className="text-xl font-bold text-slate-900">Pending</p>
            </div>
          </div>
          <Link href="/tenant-dashboard/payments">
            <Button variant="outline" className="w-full mt-4">View Payments</Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Maintenance</p>
              <p className="text-xl font-bold text-slate-900">Need Help?</p>
            </div>
          </div>
          <Link href="/tenant-dashboard/maintenance">
            <Button variant="outline" className="w-full mt-4">Report Issue</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Messages & Notices</h2>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">No new notices from your property manager.</p>
        </div>
      </div>
    </div>
  );
}
