'use client';

import { Wrench, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-slate-600 mt-1">Track maintenance requests</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="h-5 w-5 mr-2" />
          New Request
        </Button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No maintenance requests
          </h2>
          <p className="text-slate-600 mb-6">
            All maintenance requests will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
