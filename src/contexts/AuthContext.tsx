import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  diveCenterId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  diveCenterId: null,
  loading: true,
  signOut: async () => {},
  refreshRole: async () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [diveCenterId, setDiveCenterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setRole(data.role);
      
      if (data.role === 'dive_center_admin' || data.role === 'dive_center_staff') {
        const { data: staff } = await supabase
          .from('staff_members')
          .select('dive_center_id')
          .eq('user_id', userId)
          .maybeSingle();
        if (staff) setDiveCenterId(staff.dive_center_id);
      }
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    let initialSessionHandled = false;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // Skip if getSession already handled the initial load
        if (!initialSessionHandled) {
          initialSessionHandled = true;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase
          setTimeout(async () => {
            await fetchUserRole(session.user.id);
            setLoading(false);
          }, 0);
        } else {
          setRole(null);
          setDiveCenterId(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session — only handle if listener hasn't fired yet
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (initialSessionHandled) return;
      initialSessionHandled = true;

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setDiveCenterId(null);
  };

  const refreshRole = async () => {
    if (user) await fetchUserRole(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, diveCenterId, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};
