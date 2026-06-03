'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptionStore } from '@/store/subscriptionStore';

const plans = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 75000,
    units: '5 Units',
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
    units: '20 Units',
    popular: true,
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
      'Advanced analytics & reports',
      'SMS & email notifications',
      'Multi-manager support',
      'Priority support',
    ],
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { updateSubscription } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState('PROFESSIONAL');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await updateSubscription({ plan: selectedPlan as any });
      router.push('/onboarding/property');
    } catch (error) {
      console.error('Failed to update subscription:', error);
      alert('Failed to select plan. Please try again.');
    } finally {
      setLoading(false);
    }
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
            Start with a 30-day free trial. No payment required. Upgrade or downgrade anytime.
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
                <p className="text-sm text-emerald-600 font-semibold">30 days free</p>
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
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              'Start 30-Day Free Trial'
            )}
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            No payment required. Cancel anytime during trial.
          </p>
        </div>
      </div>
    </div>
  );
}
