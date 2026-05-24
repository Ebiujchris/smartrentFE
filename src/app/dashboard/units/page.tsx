'use client';

import { DoorOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnitsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Units</h1>
          <p className="text-slate-600 mt-1">Manage all rental units</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="h-5 w-5 mr-2" />
          Add Unit
        </Button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DoorOpen className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            No units yet
          </h2>
          <p className="text-slate-600 mb-6">
            Add properties first, then create rental units within them
          </p>
        </div>
      </div>
    </div>
  );
}
