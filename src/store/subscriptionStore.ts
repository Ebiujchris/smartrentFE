import { create } from "zustand";
import {
  subscriptionService,
  UpdateSubscriptionDto,
} from "@/services/subscription.service";

interface SubscriptionStore {
  subscription: any | null;
  trialStatus: any | null;
  loading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<void>;
  updateSubscription: (data: UpdateSubscriptionDto) => Promise<any>;
  fetchTrialStatus: () => Promise<void>;
  reset: () => void; // Add reset method for security
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscription: null,
  trialStatus: null,
  loading: false,
  error: null,

  fetchSubscription: async () => {
    set({ loading: true, error: null });
    try {
      const subscription = await subscriptionService.getSubscription();
      set({ subscription, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateSubscription: async (data: UpdateSubscriptionDto) => {
    set({ loading: true, error: null });
    try {
      const subscription = await subscriptionService.updateSubscription(data);
      set({ subscription, loading: false });
      return subscription;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchTrialStatus: async () => {
    set({ loading: true, error: null });
    try {
      const trialStatus = await subscriptionService.getTrialStatus();
      set({ trialStatus, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // SECURITY: Reset method to clear all data on logout
  reset: () => {
    console.log("[SubscriptionStore] Resetting all subscription data");
    set({
      subscription: null,
      trialStatus: null,
      loading: false,
      error: null,
    });
  },
}));
