"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionStore } from "@/store/subscriptionStore";

export default function SubscriptionExpiryBanner() {
  const router = useRouter();
  const { subscription, trialStatus, fetchSubscription, fetchTrialStatus } = useSubscriptionStore();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchSubscription();
    fetchTrialStatus();
  }, [fetchSubscription, fetchTrialStatus]);

  // Don't show if dismissed in this session
  if (dismissed) {
    return null;
  }

  // Don't show if subscription is expired (main modal handles that)
  if (subscription?.status === 'EXPIRED' || (subscription?.status === 'TRIAL' && trialStatus?.expired)) {
    return null;
  }

  // Check if subscription is expiring soon (within 7 days)
  const daysRemaining = trialStatus?.daysRemaining || 0;
  const showWarning = subscription?.status === 'TRIAL' && daysRemaining <= 7 && daysRemaining > 0;

  if (!showWarning) {
    return null;
  }

  // Color based on urgency
  const getUrgencyStyles = () => {
    if (daysRemaining <= 3) {
      return {
        bg: "bg-red-50 border-red-200",
        text: "text-red-800",
        icon: "text-red-600",
        button: "bg-red-600 hover:bg-red-700",
      };
    } else if (daysRemaining <= 5) {
      return {
        bg: "bg-orange-50 border-orange-200",
        text: "text-orange-800",
        icon: "text-orange-600",
        button: "bg-orange-600 hover:bg-orange-700",
      };
    } else {
      return {
        bg: "bg-yellow-50 border-yellow-200",
        text: "text-yellow-800",
        icon: "text-yellow-600",
        button: "bg-yellow-600 hover:bg-yellow-700",
      };
    }
  };

  const styles = getUrgencyStyles();

  const handleRenew = () => {
    router.push('/dashboard/subscription');
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className={`${styles.bg} border-b-2 border-t-2 px-4 py-3 shadow-sm`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className={`h-5 w-5 ${styles.icon} flex-shrink-0`} />
          <div className="flex-1">
            <p className={`${styles.text} font-semibold text-sm sm:text-base`}>
              {daysRemaining === 1 ? (
                <>⚠️ Your trial expires tomorrow!</>
              ) : (
                <>⚠️ Your trial expires in {daysRemaining} days</>
              )}
            </p>
            <p className={`${styles.text} text-xs sm:text-sm opacity-90 mt-0.5`}>
              Renew now to avoid service interruption
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={handleRenew}
            size="sm"
            className={`${styles.button} text-white shadow-sm hidden sm:flex`}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Renew Now
          </Button>
          <Button
            onClick={handleRenew}
            size="sm"
            className={`${styles.button} text-white shadow-sm sm:hidden`}
          >
            Renew
          </Button>
          <button
            onClick={handleDismiss}
            className={`${styles.text} hover:opacity-70 p-1 rounded transition-opacity`}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
