'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/integrations/supabase/browser';
import type { AppRole, CenterStatus } from '@/types';
import type { ServerSession } from '../_lib/auth';

interface AuthContextValue {
  user: User | null;
  role: AppRole | null;
  diveCenterId: string | null;
  centerStatus: CenterStatus | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

interface Props {
  session: ServerSession;
  children: ReactNode;
}

/**
 * Client-side auth context seeded from the server-resolved session so there's
 * no loading flash. Subscribes to Supabase auth state changes and asks the
 * server to re-run the layout (which re-runs getSession) via router.refresh()
 * whenever the session changes.
 */
export default function AuthProvider({ session, children }: Props) {
  const router = useRouter();
  const [state, setState] = useState<AuthContextValue>(() => ({
    user: session.user,
    role: session.role,
    diveCenterId: session.diveCenterId,
    centerStatus: session.centerStatus,
    signOut: async () => {},
  }));

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      user: session.user,
      role: session.role,
      diveCenterId: session.diveCenterId,
      centerStatus: session.centerStatus,
    }));
  }, [session]);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession?.user?.id !== state.user?.id) {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, state.user?.id]);

  const signOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {
      // Lock conflicts during sign-out are safe to ignore; navigate regardless
    }
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
