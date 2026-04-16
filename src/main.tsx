import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from '@/components/ThemeProvider';
import { initAnalytics } from '@/lib/analytics';
import './index.css';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
});

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <App />
  </ThemeProvider>
);
