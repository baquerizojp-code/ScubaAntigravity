import { useI18n } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Building2, Globe, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const statusBadgeClasses: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  archived: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const SuperAdminDashboard = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
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
                    <Badge variant="outline" className={`capitalize flex-shrink-0 ${statusBadgeClasses[center.center_status] ?? ''}`}>
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
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
