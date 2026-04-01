import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { UserPlus, Trash2, Users, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type StaffRole = Database['public']['Enums']['staff_role'];

const AdminStaff = () => {
  const { diveCenterId, role } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('staff');
  const isAdmin = role === 'dive_center_admin';

  const { data: staffMembers, isLoading: loadingStaff } = useQuery({
    queryKey: ['admin-staff', diveCenterId],
    queryFn: async () => {
      if (!diveCenterId) return [];
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('dive_center_id', diveCenterId);
      if (error) throw error;
      return data;
    },
    enabled: !!diveCenterId,
  });

  const { data: invites, isLoading: loadingInvites } = useQuery({
    queryKey: ['admin-invites', diveCenterId],
    queryFn: async () => {
      if (!diveCenterId) return [];
      const { data, error } = await supabase
        .from('staff_invites')
        .select('*')
        .eq('dive_center_id', diveCenterId)
        .eq('accepted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!diveCenterId && isAdmin,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('staff_invites').insert({
        dive_center_id: diveCenterId!,
        invited_email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
      setInviteOpen(false);
      setInviteEmail('');
      toast.success(t('admin.staff.invited'));
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error');
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const { error } = await supabase.from('staff_members').delete().eq('id', staffId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success(t('admin.staff.removed'));
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.nav.staff')}</h1>
          <p className="text-sm text-muted-foreground">{t('admin.staff.subtitle')}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setInviteOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> {t('admin.staff.invite')}
          </Button>
        )}
      </div>

      {/* Staff Members */}
      <h2 className="font-semibold text-foreground mb-3">{t('admin.staff.members')}</h2>
      {loadingStaff ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : !staffMembers?.length ? (
        <Card className="flex items-center justify-center py-12">
          <Users className="h-8 w-8 text-muted-foreground/40 mr-3" />
          <p className="text-muted-foreground">{t('admin.staff.empty')}</p>
        </Card>
      ) : (
        <div className="grid gap-3 mb-8">
          {staffMembers.map((member) => (
            <Card key={member.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{member.user_id.slice(0, 8)}...</p>
                <Badge variant="outline">{member.role}</Badge>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost" size="icon"
                  onClick={() => {
                    if (confirm(t('admin.staff.confirmRemove'))) removeMutation.mutate(member.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pending Invites */}
      {isAdmin && (
        <>
          <h2 className="font-semibold text-foreground mb-3">{t('admin.staff.pendingInvites')}</h2>
          {loadingInvites ? (
            <p className="text-muted-foreground">{t('common.loading')}</p>
          ) : !invites?.length ? (
            <Card className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{t('admin.staff.noInvites')}</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {invites.map((invite) => (
                <Card key={invite.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{invite.invited_email}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('admin.staff.expires')} {format(new Date(invite.expires_at), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{invite.role}</Badge>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.staff.inviteTitle')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(); }} className="space-y-4">
            <div>
              <Label>{t('auth.email')}</Label>
              <Input 
                type="email" value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>{t('admin.staff.role')}</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as StaffRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? t('common.loading') : t('admin.staff.sendInvite')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStaff;
