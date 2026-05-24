'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 75000,
    units: '1-10 Units',
    features: [
      'Tenant management',
      'Rent tracking',
      'Receipt generation',
      'Basic reports',
      'Email support',
    ],
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 150000,
    units: '11-20 Units',
    popular: true,
    features: [
      'Everything in Starter',
      'Advanced analytics',
      'Maintenance tracking',
      'SMS reminders',
      'Priority support',
    ],
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 200000,
    units: '21+ Units',
    features: [
      'Everything in Professional',
      'Multi-manager support',
      'WhatsApp alerts',
      'Custom reports',
      'Dedicated support',
    ],
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('PROFESSIONAL');

  const handleContinue = () => {
    // In production, this would create/update the subscription
    router.push('/onboarding/property');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Choose the plan that fits your needs
          </h1>
          <p className="text-lg text-slate-600">
            Start with a 14-day free trial. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`
                relative bg-white rounded-2xl p-8 cursor-pointer transition-all
                ${selectedPlan === plan.id
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
                className={`w-full ${
                  selectedPlan === plan.id
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </Button>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 text-lg"
          >
            Start 14-Day Free Trial
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
