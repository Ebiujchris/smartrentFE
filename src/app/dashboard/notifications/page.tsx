'use client';

import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-600 mt-1">Stay updated with important alerts</p>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-slate-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No notifications
          </h2>
          <p className="text-slate-600">
            You're all caught up! Notifications will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
