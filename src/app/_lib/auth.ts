import { cache } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/integrations/supabase/server';
import type { AppRole, CenterStatus } from '@/types';

export interface ServerSession {
  user: User | null;
  role: AppRole | null;
  diveCenterId: string | null;
  centerStatus: CenterStatus | null;
}

const EMPTY_SESSION: ServerSession = {
  user: null,
  role: null,
  diveCenterId: null,
  centerStatus: null,
};

/**
 * Resolve the current signed-in user, their role, and (if applicable) the
 * dive center they own. Wrapped in React's `cache()` so a layout and the
 * page it renders share one Supabase round-trip per request.
 */
export const getSession = cache(async (): Promise<ServerSession> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_SESSION;

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  const role = (roleRow?.role ?? null) as AppRole | null;

  let diveCenterId: string | null = null;
  let centerStatus: CenterStatus | null = null;

  if (role === 'dive_center' || role === 'super_admin') {
    const { data: center } = await supabase
      .from('dive_centers')
      .select('id, center_status')
      .eq('created_by', user.id)
      .maybeSingle();

    if (center) {
      diveCenterId = center.id;
      centerStatus = center.center_status as CenterStatus;
    }
  }

  return { user, role, diveCenterId, centerStatus };
});
