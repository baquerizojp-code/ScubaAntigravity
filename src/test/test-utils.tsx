/**
 * Shared test utilities: custom render with providers, mock auth context, etc.
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';

// ---------------------------------------------------------------------------
// React Query test client — disable retries & caching to keep tests fast
// ---------------------------------------------------------------------------
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

// ---------------------------------------------------------------------------
// Auth context mock — importable by tests that need AuthProvider control
// ---------------------------------------------------------------------------
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface MockAuthValues {
  user: { id: string; email?: string } | null;
  session: { user: { id: string } } | null;
  role: AppRole | null;
  diveCenterId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

export const defaultMockAuth: MockAuthValues = {
  user: null,
  session: null,
  role: null,
  diveCenterId: null,
  loading: false,
  signOut: async () => {},
  refreshRole: async () => {},
};

// We create a real React context so ProtectedRoute's useAuth picks it up.
import { createContext, useContext } from 'react';

const MockAuthContext = createContext<MockAuthValues>(defaultMockAuth);
export const useMockAuth = () => useContext(MockAuthContext);

export function MockAuthProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: Partial<MockAuthValues>;
}) {
  return (
    <MockAuthContext.Provider value={{ ...defaultMockAuth, ...value }}>
      {children}
    </MockAuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Custom render that wraps components in all necessary providers
// ---------------------------------------------------------------------------
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValues?: Partial<MockAuthValues>;
  routerProps?: MemoryRouterProps;
}

export function renderWithProviders(
  ui: ReactElement,
  { authValues, routerProps, ...renderOptions }: CustomRenderOptions = {},
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MockAuthProvider value={authValues}>
          <MemoryRouter {...routerProps}>{children}</MemoryRouter>
        </MockAuthProvider>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }), queryClient };
}

export { render };
