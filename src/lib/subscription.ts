import type { Subscription } from '@/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

const SUBSCRIPTION_KEY = 'user-subscription';

export function getUserSubscription(): Subscription {
  return loadFromStorage<Subscription>(SUBSCRIPTION_KEY, {
    plan: 'free',
    expiresAt: null,
    activatedAt: null,
  });
}

export function isProUser(): boolean {
  const sub = getUserSubscription();
  if (sub.plan === 'free') return false;
  if (!sub.expiresAt) return true;
  return new Date(sub.expiresAt) > new Date();
}

export function activatePro(plan: 'pro' | 'family'): Subscription {
  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + 3);

  const subscription: Subscription = {
    plan,
    activatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  saveToStorage(SUBSCRIPTION_KEY, subscription);
  return subscription;
}

export function useProCheck(): { isPro: boolean; subscription: Subscription } {
  const subscription = getUserSubscription();
  return {
    isPro: isProUser(),
    subscription,
  };
}
