import posthog from 'posthog-js';

export function initAnalytics() {
  if (!import.meta.env.VITE_POSTHOG_KEY) return;
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? 'https://app.posthog.com',
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
