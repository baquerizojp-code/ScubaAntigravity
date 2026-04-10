/**
 * Dialog prompting first-time divers to complete their profile before booking.
 * Extracted from pages/app/TripDetail.tsx.
 */
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const CERT_OPTIONS = [
  { value: 'none', labelKey: 'profile.cert.none' },
  { value: 'open_water', labelKey: 'profile.cert.openWater' },
  { value: 'advanced_open_water', labelKey: 'profile.cert.advanced' },
  { value: 'rescue_diver', labelKey: 'profile.cert.rescue' },
  { value: 'divemaster', labelKey: 'profile.cert.divemaster' },
  { value: 'instructor', labelKey: 'profile.cert.instructor' },
] as const;

interface ProfileCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  onFullNameChange: (name: string) => void;
  certification: string;
  onCertificationChange: (cert: string) => void;
  creating: boolean;
  onSubmit: () => void;
}

export function ProfileCompletionDialog({
  open,
  onOpenChange,
  fullName,
  onFullNameChange,
  certification,
  onCertificationChange,
  creating,
  onSubmit,
}: ProfileCompletionDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('diver.trip.completeProfileTitle')}</DialogTitle>
          <DialogDescription>{t('diver.trip.completeProfileDesc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">{t('diver.trip.fullNameLabel')}</Label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={e => onFullNameChange(e.target.value)}
              placeholder={t('diver.trip.fullNameLabel')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-cert">{t('diver.trip.certLabel')}</Label>
            <Select value={certification} onValueChange={onCertificationChange}>
              <SelectTrigger id="profile-cert"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CERT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            className="w-full bg-primary text-primary-foreground hover:brightness-110 shadow-ocean"
            onClick={onSubmit}
            disabled={creating || !fullName.trim()}
          >
            {creating ? t('common.loading') : t('diver.trip.completeAndBook')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
