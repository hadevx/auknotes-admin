// Mirrors backend/utils/subscription.js so the panel and the API agree
export const SUBSCRIPTION_MONTHS = 3;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type Subscription = {
  isActive?: boolean;
  plan?: string | null;
  startedAt?: string | null;
  expiresAt?: string | null;
};

export const isSubscriptionActive = (subscription?: Subscription | null) => {
  if (!subscription?.isActive || !subscription.expiresAt) return false;
  return new Date(subscription.expiresAt).getTime() > Date.now();
};

export const subscriptionDaysLeft = (subscription?: Subscription | null) => {
  if (!isSubscriptionActive(subscription)) return 0;
  const diff = new Date(subscription!.expiresAt as string).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / MS_PER_DAY));
};

export const formatSubscriptionDate = (value?: string | null, locale = "en") =>
  value
    ? new Date(value).toLocaleDateString(locale === "ar" ? "ar-KW" : undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
