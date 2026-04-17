import posthog from 'posthog-js';

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    capture_pageview: true,
    persistence: 'localStorage',
  });
}

export function identifyUser(userId: string, props?: Record<string, unknown>) {
  posthog.identify(userId, props);
}

export function resetUser() {
  posthog.reset();
}

export function track(event: string, props?: Record<string, unknown>) {
  posthog.capture(event, props);
}
