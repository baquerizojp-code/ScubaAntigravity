import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Building2, Globe, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ActionTarget = { centerId: string; action: 'approve' | 'reject' } | null;

const statusBadgeClasses: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  archived: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'archived'>('all');

  const { data: centers, isLoading } = useQuery({
    queryKey: ['super-admin-centers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dive_centers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ centerId, action }: { centerId: string; action: 'approve' | 'reject' }) => {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      const { error } = await supabase
        .from('dive_centers')
        .update({
          center_status: newStatus,
          approved_at: action === 'approve' ? new Date().toISOString() : null,
          approved_by: action === 'approve' ? user?.id : null,
        })
        .eq('id', centerId);
      if (error) throw error;

      // Create in-app notification for the center owner
      const { data: center } = await supabase
        .from('dive_centers')
        .select('created_by, name')
        .eq('id', centerId)
        .single();

      if (center?.created_by) {
        const title = action === 'approve' 
          ? t('superAdmin.notification.approvedTitle')
          : t('superAdmin.notification.rejectedTitle');
        const body = action === 'approve'
          ? t('superAdmin.notification.approvedBody')
          : t('superAdmin.notification.rejectedBody');

        await supabase.from('notifications').insert({
          user_id: center.created_by,
          type: action === 'approve' ? 'center_approved' : 'center_rejected',
          title,
          body: `${center.name} — ${body}`,
        });
      }
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-centers'] });
      toast.success(action === 'approve' ? t('superAdmin.approved') : t('superAdmin.rejected'));
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const filteredCenters = centers?.filter(c => 
    statusFilter === 'all' ? true : c.center_status === statusFilter
  );

  const counts = {
    all: centers?.length ?? 0,
    pending: centers?.filter(c => c.center_status === 'pending').length ?? 0,
    approved: centers?.filter(c => c.center_status === 'approved').length ?? 0,
    rejected: centers?.filter(c => c.center_status === 'rejected').length ?? 0,
    archived: centers?.filter(c => c.center_status === 'archived').length ?? 0,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-headline text-foreground">{t('superAdmin.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('superAdmin.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {(['all', 'pending', 'approved', 'rejected', 'archived'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-4 rounded-xl text-left transition-all ${
              statusFilter === status 
                ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20' 
                : 'bg-card border border-white/5 hover:border-white/10'
            }`}
          >
            <p className="text-xs text-muted-foreground capitalize">
              {t(`superAdmin.filter.${status}`)}
            </p>
            <p className="text-2xl font-bold text-foreground">{counts[status]}</p>
          </button>
        ))}
      </div>

      {/* Center List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !filteredCenters?.length ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{t('superAdmin.noCenters')}</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredCenters.map(center => (
            <Card
              key={center.id}
              className="p-5 cursor-pointer hover:border-white/20 transition-all"
              onClick={() => navigate(`/super-admin/centers/${center.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{center.name}</h3>
                    <Badge variant="outline" className={`capitalize ${statusBadgeClasses[center.center_status] ?? ''}`}>
                      {center.center_status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {center.location && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {center.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {format(new Date(center.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {center.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{center.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {center.center_status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActionTarget({ centerId: center.id, action: 'approve' }); }}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t('superAdmin.approve')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-1.5"
                        onClick={(e) => { e.stopPropagation(); setActionTarget({ centerId: center.id, action: 'reject' }); }}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {t('superAdmin.reject')}
                      </Button>
                    </>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget?.action === 'approve' 
                ? t('superAdmin.confirmApprove') 
                : t('superAdmin.confirmReject')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionTarget?.action === 'approve'
                ? t('superAdmin.confirmApproveDesc')
                : t('superAdmin.confirmRejectDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className={actionTarget?.action === 'approve' 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
              onClick={() => {
                if (actionTarget) {
                  updateStatusMutation.mutate(actionTarget);
                  setActionTarget(null);
                }
              }}
            >
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SuperAdminDashboard;
