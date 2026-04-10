import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole, ActiveView, CenterStatus } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  diveCenterId: string | null;
  centerStatus: CenterStatus | null;
  activeView: ActiveView;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  setActiveView: (view: ActiveView) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  diveCenterId: null,
  centerStatus: null,
  activeView: 'diver',
  loading: true,
  signOut: async () => {},
  refreshRole: async () => {},
  setActiveView: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [diveCenterId, setDiveCenterId] = useState<string | null>(null);
  const [centerStatus, setCenterStatus] = useState<CenterStatus | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('diver');
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      setRole(data.role);
      
      if (data.role === 'super_admin') {
        // Super admin: set default view and check if they own a center
        setActiveView('super_admin');
        const { data: center } = await supabase
          .from('dive_centers')
          .select('id, center_status')
          .eq('created_by', userId)
          .maybeSingle();
        if (center) {
          setDiveCenterId(center.id);
          setCenterStatus(center.center_status as CenterStatus);
        }
      } else if (data.role === 'dive_center') {
        // Dive center owner: look up their center via created_by
        setActiveView('dive_center');
        const { data: center } = await supabase
          .from('dive_centers')
          .select('id, center_status')
          .eq('created_by', userId)
          .maybeSingle();
        if (center) {
          setDiveCenterId(center.id);
          setCenterStatus(center.center_status as CenterStatus);
        }
      } else {
        // Diver
        setActiveView('diver');
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
          setLoading(true);
          // Use setTimeout to avoid potential deadlocks with Supabase
          setTimeout(async () => {
            await fetchUserRole(session.user.id);
            setLoading(false);
          }, 0);
        } else {
          setRole(null);
          setDiveCenterId(null);
          setCenterStatus(null);
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
    setCenterStatus(null);
    setActiveView('diver');
  };

  const refreshRole = async () => {
    if (user) await fetchUserRole(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, diveCenterId, centerStatus, activeView, loading, signOut, refreshRole, setActiveView }}>
      {children}
    </AuthContext.Provider>
  );
};
