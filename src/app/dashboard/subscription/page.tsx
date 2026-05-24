'use client';

import { CreditCard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export default function SubscriptionPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Subscription</h1>
        <p className="text-slate-600 mt-1">Manage your subscription plan</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Current Plan</h2>
        
        <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-lg border border-emerald-200">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {user?.subscription?.plan || 'Trial'} Plan
            </h3>
            <p className="text-slate-600 mt-1">
              Status: <span className="text-emerald-600 font-semibold">Active</span>
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Next billing: June 24, 2026
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">UGX 75,000</p>
            <p className="text-slate-600">/month</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Units Used</p>
            <p className="text-2xl font-bold text-slate-900">0 / 10</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Trial Ends</p>
            <p className="text-2xl font-bold text-slate-900">14 days</p>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Available Plans</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Starter', price: 75000, units: '1-10' },
            { name: 'Professional', price: 150000, units: '11-20', popular: true },
            { name: 'Premium', price: 200000, units: '21+' },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-lg border-2 ${
                plan.popular
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200'
              }`}
            >
              {plan.popular && (
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  POPULAR
                </span>
              )}
              <h3 className="text-xl font-bold text-slate-900 mt-4">{plan.name}</h3>
              <p className="text-slate-600 text-sm">{plan.units} Units</p>
              <p className="text-3xl font-bold text-slate-900 mt-4">
                UGX {plan.price.toLocaleString()}
              </p>
              <p className="text-slate-600 text-sm">/month</p>
              <Button className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600">
                Select Plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
