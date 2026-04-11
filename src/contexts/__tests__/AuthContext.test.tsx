/* eslint-disable @typescript-eslint/no-explicit-any -- test-mock boundary: testChain/mockAuth casts needed for vitest mock type compatibility */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockSupabase, resetSupabaseMock, mockFrom, mockAuth, testChain } from '@/test/mocks/supabase';

vi.mock('@/integrations/supabase/client', () => ({ supabase: mockSupabase }));

import { AuthProvider, useAuth } from '@/contexts/AuthContext';

beforeEach(() => resetSupabaseMock());

/**
 * Vitest's inferred mock type for onAuthStateChange is too narrow to accept
 * a callback parameter in mockImplementation. We use a relaxed vi.fn() cast
 * at the test-mock boundary only (not in production code).
 */
const onAuthStateChangeImpl = mockAuth.onAuthStateChange as ReturnType<typeof vi.fn>;

// Helper component that exposes auth state for assertions
function AuthConsumer() {
  const { user, role, diveCenterId, loading, signOut } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.id ?? 'none'}</span>
      <span data-testid="role">{role ?? 'none'}</span>
      <span data-testid="centerId">{diveCenterId ?? 'none'}</span>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('starts in loading state and resolves to no user when no session', async () => {
    onAuthStateChangeImpl.mockImplementation(
      (callback: (...args: unknown[]) => void) => {
        setTimeout(() => callback('INITIAL_SESSION', null), 0);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    );

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('role').textContent).toBe('none');
  });

  it('fetches role when session exists', async () => {
    const mockUser = { id: 'user-123', email: 'test@test.com' };
    const mockSession = { user: mockUser };

    mockAuth.getSession.mockResolvedValue({ data: { session: mockSession } });

    mockAuth.onAuthStateChange.mockImplementation(() => {
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return testChain({ data: { role: 'diver' } }) as any;
      }
      return testChain({ data: null }) as any;
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('diver');
    });

    expect(screen.getByTestId('user').textContent).toBe('user-123');
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('fetches diveCenterId for dive_center role via dive_centers.created_by', async () => {
    const mockUser = { id: 'owner-1', email: 'owner@center.com' };
    const mockSession = { user: mockUser };

    onAuthStateChangeImpl.mockImplementation(
      (callback: (...args: unknown[]) => void) => {
        setTimeout(() => callback('SIGNED_IN', mockSession), 0);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    );
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') {
        return testChain({ data: { role: 'dive_center' } }) as any;
      }
      if (table === 'dive_centers') {
        return testChain({ data: { id: 'dc-42', center_status: 'approved' } }) as any;
      }
      return testChain({ data: null }) as any;
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('dive_center');
    });

    await waitFor(() => {
      expect(screen.getByTestId('centerId').textContent).toBe('dc-42');
    });
  });

  it('clears role and centerId on sign out', async () => {
    const mockUser = { id: 'user-1' };
    let authCallback: (...args: unknown[]) => void;

    onAuthStateChangeImpl.mockImplementation(
      (callback: (...args: unknown[]) => void) => {
        authCallback = callback;
        setTimeout(() => callback('SIGNED_IN', { user: mockUser }), 0);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    );
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-mock boundary
    mockFrom.mockImplementation((_table: string) => {
      return testChain({ data: { role: 'diver' } }) as any;
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('role').textContent).toBe('diver');
    });

    mockAuth.signOut.mockImplementation(async () => {
      authCallback('SIGNED_OUT', null);
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('none');
      expect(screen.getByTestId('role').textContent).toBe('none');
      expect(screen.getByTestId('centerId').textContent).toBe('none');
    });
  });

  it('sets role to null when user has no role row', async () => {
    const mockUser = { id: 'new-user' };
    onAuthStateChangeImpl.mockImplementation(
      (callback: (...args: unknown[]) => void) => {
        setTimeout(() => callback('SIGNED_IN', { user: mockUser }), 0);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
    );
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test-mock boundary
    mockFrom.mockImplementation(() => {
      return testChain({ data: null }) as any;
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('role').textContent).toBe('none');
  });
});
