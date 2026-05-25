import api from '@/lib/api';

export interface UpdateSubscriptionDto {
  plan: 'STARTER' | 'PROFESSIONAL' | 'PREMIUM';
}

export const subscriptionService = {
  async getSubscription() {
    const response = await api.get('/subscriptions');
    return response.data;
  },

  async updateSubscription(data: UpdateSubscriptionDto) {
    const response = await api.patch('/subscriptions', data);
    return response.data;
  },

  async getTrialStatus() {
    const response = await api.get('/subscriptions/trial-status');
    return response.data;
  },
};
