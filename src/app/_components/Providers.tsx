'use client';

import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Client-only provider shell for the App Router tree. Currently wraps
 * next-themes so dark/light works the same way as in the Vite app; more
 * providers (React Query, AuthContext replacement) land in Phase D.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
