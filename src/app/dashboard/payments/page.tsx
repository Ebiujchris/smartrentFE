'use client';

import { CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600 mt-1">Track rent payments and receipts</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="h-5 w-5 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No payments recorded
          </h2>
          <p className="text-slate-600 mb-6">
            Start recording rent payments to track your revenue
          </p>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-5 w-5 mr-2" />
            Record First Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
