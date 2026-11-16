'use client';

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 75000,
    units: '7 Units',
    features: [
      'Tenant management',
      'Rent tracking & payment recording',
      'Lease management',
      'Maintenance request tracking',
      'Receipt generation',
      'Advanced analytics & reports',
      'SMS & email notifications',
      'Multi-manager support',
      'Priority support',
    ],
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 150000,
    units: '30 Units',
    popular: true,
    features: [
      'Tenant management',
      'Rent tracking & payment recording',
      'Lease management',
      'Maintenance request tracking',
      'Receipt generation',
      'Vacancy advertising',
      'Advanced analytics & reports',
      'SMS & email notifications',
      'Multi-manager support',
      'Priority support',
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 300000,
    units: 'Unlimited Units',
    features: [
      'Tenant management',
      'Rent tracking & payment recording',
      'Lease management',
      'Maintenance request tracking',
      'Receipt generation',
      'Vacancy advertising',
      'Advanced analytics & reports',
      'SMS & email notifications',
      'Multi-manager support',
      'Priority support',
    ],
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    setLoading(true);
    router.push('/onboarding/property');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Your free trial starts with the Starter plan
          </h1>
          <p className="text-lg text-slate-600">
            Your plan is locked for the 30-day free trial. You can change plans after the trial ends.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative bg-white rounded-2xl p-8 transition-all
                ${plan.id === 'STARTER'
                  ? 'ring-2 ring-emerald-500 shadow-xl scale-105'
                  : 'border border-slate-200 hover:shadow-lg'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-600 mb-4">{plan.units}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-slate-900">
                    UGX {plan.price.toLocaleString()}
                  </span>
                  <span className="text-slate-600">/month</span>
                </div>
                <p className="text-sm text-emerald-600 font-semibold">
                  {plan.id === 'STARTER' ? '30 days free' : 'Available after trial'}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                disabled
                className={`w-full ${
                  plan.id === 'STARTER'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {plan.id === 'STARTER' ? 'Your trial plan' : 'Locked during trial'}
              </Button>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              'Continue with Starter trial'
            )}
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            Plan changes become available after your 30-day trial ends.
          </p>
        </div>
      </div>
    </div>
  );
}
