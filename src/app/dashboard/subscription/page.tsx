'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Check, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { usePropertyStore } from '@/store/propertyStore';
import { toast } from 'sonner';
import { formatDate } from '@/lib/dateUtils';

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const { subscription, trialStatus, loading, fetchSubscription, updateSubscription, fetchTrialStatus } = useSubscriptionStore();
  const { properties } = usePropertyStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
    fetchTrialStatus();
  }, [fetchSubscription, fetchTrialStatus]);

  const handleSelectPlan = async (plan: string) => {
    setSelectedPlan(plan);
    try {
      await updateSubscription({ plan: plan as any });
      toast.success('Plan updated successfully!', {
        description: 'You have 30 days free trial. No payment required.',
      });
    } catch (error) {
      console.error('Failed to update plan:', error);
      toast.error('Failed to update plan', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setSelectedPlan(null);
    }
  };

  // Calculate units used
  const unitsUsed = properties.reduce((sum, prop) => sum + (prop.units?.length || 0), 0);

  const plans = [
    { 
      id: 'STARTER', 
      name: 'Starter', 
      price: 75000, 
      units: '15 Units',
      maxUnits: 15,
      features: [
        'Tenant management',
        'Rent tracking & payment recording',
        'Tenant Agreement management',
        'Maintenance request tracking',
        'Receipt generation',
        'Advanced analytics & reports',
        'SMS & email notifications',
        'Multi-manager support',
        'Priority support',
      ]
    },
    { 
      id: 'PROFESSIONAL', 
      name: 'Professional', 
      price: 150000, 
      units: '30 Units',
      maxUnits: 30,
      popular: true,
      features: [
        'Tenant management',
        'Rent tracking & payment recording',
        'Tenant Agreement management',
        'Maintenance request tracking',
        'Receipt generation',
        'Advanced analytics & reports',
        'SMS & email notifications',
        'Multi-manager support',
        'Priority support',
      ]
    },
    { 
      id: 'PREMIUM', 
      name: 'Premium', 
      price: 250000, 
      units: 'Unlimited Units',
      maxUnits: 9999,
      features: [
        'Tenant management',
        'Rent tracking & payment recording',
        'Tenant Agreement management',
        'Maintenance request tracking',
        'Receipt generation',
        'Advanced analytics & reports',
        'SMS & email notifications',
        'Multi-manager support',
        'Priority support',
      ]
    },
  ];

  if (loading && !subscription) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Subscription</h1>
        <p className="text-slate-600 mt-1">Manage your subscription plan</p>
      </div>

      {/* Trial Banner */}
      {subscription?.status === 'TRIAL' && trialStatus && !trialStatus.expired && (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-6 w-6" />
            <h3 className="text-xl font-bold">30-Day Free Trial Active!</h3>
          </div>
          <p className="text-emerald-50">
            You have {trialStatus.daysRemaining} days remaining in your free trial. 
            No payment required until {formatDate(trialStatus.trialEndsAt)}.
          </p>
        </div>
      )}

      {/* Current Plan */}
      {subscription && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Current Plan</h2>
          
          <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-lg border border-emerald-200">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {subscription.plan} Plan
              </h3>
              <p className="text-slate-600 mt-1">
                Status: <span className={`font-semibold ${subscription.status === 'TRIAL' ? 'text-emerald-600' : subscription.status === 'ACTIVE' ? 'text-blue-600' : 'text-red-600'}`}>
                  {subscription.status}
                </span>
              </p>
              {subscription.status === 'TRIAL' && trialStatus && (
                <p className="text-sm text-slate-500 mt-2">
                  Trial ends: {formatDate(subscription.trialEndsAt)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">UGX {Number(subscription.amount).toLocaleString()}</p>
              <p className="text-slate-600">/month</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Units Used</p>
              <p className="text-2xl font-bold text-slate-900">{unitsUsed} / {subscription.maxUnits}</p>
              {unitsUsed >= subscription.maxUnits && (
                <p className="text-xs text-red-600 mt-1">Limit reached - Upgrade to add more units</p>
              )}
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Trial Status</p>
              <p className="text-2xl font-bold text-slate-900">
                {subscription.status === 'TRIAL' && trialStatus ? `${trialStatus.daysRemaining} days` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Available Plans</h2>
        <p className="text-slate-600 mb-6">All plans include 30 days free trial. No payment required to start.</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-lg border-2 relative ${
                plan.popular
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200'
              } ${subscription?.plan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  MOST POPULAR
                </span>
              )}
              {subscription?.plan === plan.id && (
                <span className="absolute -top-3 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  CURRENT
                </span>
              )}
              <h3 className="text-xl font-bold text-slate-900 mt-4">{plan.name}</h3>
              <p className="text-slate-600 text-sm">{plan.units} Units</p>
              <p className="text-3xl font-bold text-slate-900 mt-4">
                UGX {plan.price.toLocaleString()}
              </p>
              <p className="text-slate-600 text-sm">/month</p>
              
              <ul className="mt-6 space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full mt-6 ${subscription?.plan === plan.id ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={subscription?.plan === plan.id || selectedPlan === plan.id}
              >
                {selectedPlan === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : subscription?.plan === plan.id ? (
                  'Current Plan'
                ) : (
                  'Select Plan'
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <CreditCard className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Payment Information</h3>
            <p className="text-sm text-slate-600">
              All plans come with a 30-day free trial. You can change or cancel your plan anytime during the trial period. 
              Payment integration will be enabled soon - for now, enjoy your free trial!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
