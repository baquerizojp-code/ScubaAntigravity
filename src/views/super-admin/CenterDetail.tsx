import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  ArrowLeft, CheckCircle, XCircle, Archive, Trash2,
  Globe, Clock, Phone, Building2, User,
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

type DialogAction = 'approve' | 'reject' | 'archive' | 'delete' | null;

const statusBadgeClasses: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  archived: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const CenterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);

  const { data: center, isLoading } = useQuery({
    queryKey: ['super-admin-center', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dive_centers')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: owner } = useQuery({
    queryKey: ['super-admin-center-owner', center?.created_by],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diver_profiles')
        .select('full_name, avatar_url')
        .eq('id', center!.created_by!)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!center?.created_by,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (action: 'approve' | 'reject' | 'archive') => {
      const statusMap = { approve: 'approved', reject: 'rejected', archive: 'archived' } as const;
      const newStatus = statusMap[action];

      const { error } = await supabase
        .from('dive_centers')
        .update({
          center_status: newStatus,
          approved_at: action === 'approve' ? new Date().toISOString() : null,
          approved_by: action === 'approve' ? user?.id : null,
        })
        .eq('id', id!);
      if (error) throw error;

      if ((action === 'approve' || action === 'reject') && center?.created_by) {
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
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-center', id] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-centers'] });
      const messages = {
        approve: t('superAdmin.approved'),
        reject: t('superAdmin.rejected'),
        archive: t('superAdmin.archived'),
      };
      toast.success(messages[action]);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('dive_centers').delete().eq('id', id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-centers'] });
      toast.success(t('superAdmin.deleted'));
      navigate('/super-admin');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleConfirm = () => {
    if (!dialogAction) return;
    if (dialogAction === 'delete') {
      deleteMutation.mutate();
    } else {
      updateStatusMutation.mutate(dialogAction);
    }
    setDialogAction(null);
  };

  const dialogConfig: Record<NonNullable<DialogAction>, { title: string; desc: string; destructive?: boolean }> = {
    approve: { title: t('superAdmin.confirmApprove'), desc: t('superAdmin.confirmApproveDesc') },
    reject: { title: t('superAdmin.confirmReject'), desc: t('superAdmin.confirmRejectDesc') },
    archive: { title: t('superAdmin.confirmArchive'), desc: t('superAdmin.confirmArchiveDesc') },
    delete: { title: t('superAdmin.confirmDelete'), desc: t('superAdmin.confirmDeleteDesc'), destructive: true },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!center) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>Center not found.</p>
      </div>
    );
  }

  const status = center.center_status as string;

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button
        onClick={() => navigate('/super-admin')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('superAdmin.backToDashboard')}
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-headline text-foreground">{center.name}</h1>
          <Badge variant="outline" className={`capitalize mt-1.5 ${statusBadgeClasses[status] ?? ''}`}>
            {status}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <Card className="p-5 mb-4">
        <div className="space-y-3 text-sm">
          {center.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span>{center.location}</span>
            </div>
          )}
          {center.whatsapp && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{center.whatsapp}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{t('superAdmin.centerDetail.registeredOn')} {format(new Date(center.created_at), 'MMM d, yyyy')}</span>
          </div>
          {center.approved_at && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              <span>{t('superAdmin.centerDetail.approvedOn')} {format(new Date(center.approved_at), 'MMM d, yyyy')}</span>
            </div>
          )}
          {owner?.full_name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 flex-shrink-0" />
              <span>{t('superAdmin.centerDetail.owner')}: {owner.full_name}</span>
            </div>
          )}
          {center.description && (
            <>
              <div className="border-t border-border" />
              <p className="text-foreground leading-relaxed">{center.description}</p>
            </>
          )}
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-5 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Actions</p>
        <div className="flex flex-wrap gap-2">
          {status !== 'approved' && status !== 'archived' && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => setDialogAction('approve')}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {t('superAdmin.approve')}
            </Button>
          )}
          {status !== 'rejected' && status !== 'archived' && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-1.5"
              onClick={() => setDialogAction('reject')}
            >
              <XCircle className="h-3.5 w-3.5" />
              {t('superAdmin.reject')}
            </Button>
          )}
          {status !== 'archived' && (
            <Button
              size="sm"
              variant="outline"
              className="text-muted-foreground gap-1.5"
              onClick={() => setDialogAction('archive')}
            >
              <Archive className="h-3.5 w-3.5" />
              {t('superAdmin.archive')}
            </Button>
          )}
          {status === 'archived' && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => setDialogAction('approve')}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {t('superAdmin.approve')}
            </Button>
          )}
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="p-5 border-red-500/20">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-3">Danger Zone</p>
        <p className="text-xs text-muted-foreground mb-3">{t('superAdmin.confirmDeleteDesc')}</p>
        <Button
          size="sm"
          variant="outline"
          className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-1.5"
          onClick={() => setDialogAction('delete')}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t('superAdmin.delete')}
        </Button>
      </Card>

      {/* Confirmation dialog */}
      <AlertDialog open={!!dialogAction} onOpenChange={() => setDialogAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogAction ? dialogConfig[dialogAction].title : ''}</AlertDialogTitle>
            <AlertDialogDescription>{dialogAction ? dialogConfig[dialogAction].desc : ''}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className={dialogAction && dialogConfig[dialogAction].destructive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : dialogAction === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : ''}
              onClick={handleConfirm}
            >
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CenterDetail;
