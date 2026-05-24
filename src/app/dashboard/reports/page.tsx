'use client';

import { BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-1">Financial reports and analytics</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Download className="h-5 w-5 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No data for reports
          </h2>
          <p className="text-slate-600 mb-6">
            Reports will be generated once you have payment data
          </p>
        </div>
      </div>
    </div>
  );
}
