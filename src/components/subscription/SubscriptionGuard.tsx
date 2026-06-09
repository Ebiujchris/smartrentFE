"use client";

import { useEffect, ReactNode } from "react";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import SubscriptionExpiredModal from "./SubscriptionExpiredModal";

interface SubscriptionGuardProps {
  children: ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { subscription, trialStatus, fetchSubscription, fetchTrialStatus } = useSubscriptionStore();

  useEffect(() => {
    fetchSubscription();
    fetchTrialStatus();
  }, [fetchSubscription, fetchTrialStatus]);

  // Check if subscription is expired
  const isExpired = subscription?.status === 'EXPIRED' || 
                   (subscription?.status === 'TRIAL' && trialStatus?.expired);

  return (
    <>
      {/* Show modal if expired */}
      <SubscriptionExpiredModal />
      
      {/* Wrap children in read-only div if expired */}
      <div className={isExpired ? "pointer-events-none opacity-60" : ""}>
        {children}
      </div>
    </>
  );
}
