"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import PaymentModal from "./PaymentModal";

export default function SubscriptionExpiredModal() {
  const router = useRouter();
  const { subscription, trialStatus, fetchSubscription, fetchTrialStatus } = useSubscriptionStore();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchTrialStatus();
  }, [fetchSubscription, fetchTrialStatus]);

  // Check if subscription is expired
  const isExpired = subscription?.status === 'EXPIRED' || 
                   (subscription?.status === 'TRIAL' && trialStatus?.expired);

  if (!isExpired) {
    return null;
  }

  const handleRenew = () => {
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchSubscription();
    fetchTrialStatus();
    setPaymentModalOpen(false);
  };

  const currentPlan = {
    name: subscription?.plan || 'STARTER',
    price: Number(subscription?.amount) || 75000,
    id: subscription?.plan || 'STARTER',
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border-4 border-red-500">
          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-3">
            Subscription Expired
          </h2>

          {/* Message */}
          <p className="text-center text-slate-600 mb-6">
            Your subscription has expired. You can view your data but cannot perform any actions until you renew your subscription.
          </p>

          {/* Current Plan Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Current Plan</span>
              <span className="font-semibold text-slate-900">{subscription?.plan}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Status</span>
              <span className="font-semibold text-red-600">EXPIRED</span>
            </div>
          </div>

          {/* Renewal Button */}
          <Button
            onClick={handleRenew}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Renew Subscription Now
          </Button>

          {/* Note */}
          <p className="text-xs text-center text-slate-500 mt-4">
            All your data is safe and will be restored once you renew your subscription.
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          plan={currentPlan}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
