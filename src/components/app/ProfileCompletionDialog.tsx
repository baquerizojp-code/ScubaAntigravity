/**
 * Dialog prompting divers to complete missing profile fields before booking.
 * Shows only the fields that are actually missing, so returning divers see
 * a minimal form.
 */
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/PhoneInput';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

const CERT_OPTIONS = [
  { value: 'none', labelKey: 'profile.cert.none' },
  { value: 'open_water', labelKey: 'profile.cert.openWater' },
  { value: 'advanced_open_water', labelKey: 'profile.cert.advanced' },
  { value: 'rescue_diver', labelKey: 'profile.cert.rescue' },
  { value: 'divemaster', labelKey: 'profile.cert.divemaster' },
  { value: 'instructor', labelKey: 'profile.cert.instructor' },
] as const;

export interface ProfileFieldValues {
  firstName: string;
  lastName: string;
  certification: string;
  loggedDives: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface MissingFields {
  firstName?: boolean;
  lastName?: boolean;
  certification?: boolean;
  loggedDives?: boolean;
  emergencyContactName?: boolean;
  emergencyContactPhone?: boolean;
}

interface ProfileCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: ProfileFieldValues;
  onFieldChange: <K extends keyof ProfileFieldValues>(key: K, value: ProfileFieldValues[K]) => void;
  missingFields: MissingFields;
  creating: boolean;
  onSubmit: () => void;
  /** true when the profile already exists (update mode vs create mode) */
  isUpdate: boolean;
}

export function ProfileCompletionDialog({
  open,
  onOpenChange,
  fields,
  onFieldChange,
  missingFields,
  creating,
  onSubmit,
  isUpdate,
}: ProfileCompletionDialogProps) {
  const { t } = useI18n();

  const showFirstName = !!missingFields.firstName;
  const showLastName = !!missingFields.lastName;
  const showDives = !!missingFields.loggedDives;
  const showEmergency = !!missingFields.emergencyContactName || !!missingFields.emergencyContactPhone;
  const showNameRow = showFirstName || showLastName;

  // Validate: all shown fields must be filled
  const isValid =
    (!showNameRow || (fields.firstName.trim().length > 0 && fields.lastName.trim().length > 0)) &&
    (!showEmergency || (fields.emergencyContactName.trim().length > 0 && fields.emergencyContactPhone.trim().length > 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('diver.trip.completeProfileTitle')}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? (t('diver.trip.completeProfileDescUpdate') || t('diver.trip.completeProfileDesc'))
              : t('diver.trip.completeProfileDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Name row — always show both fields as a pair when either is missing */}
          {showNameRow && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="profile-first">{t('diver.profile.firstName')} <span className="text-destructive">*</span></Label>
                <Input
                  id="profile-first"
                  value={fields.firstName}
                  onChange={e => onFieldChange('firstName', e.target.value)}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-last">{t('diver.profile.lastName')} <span className="text-destructive">*</span></Label>
                <Input
                  id="profile-last"
                  value={fields.lastName}
                  onChange={e => onFieldChange('lastName', e.target.value)}
                  placeholder="Pérez"
                />
              </div>
            </div>
          )}

          {/* Certification — always shown so the user can review/change */}
          <div className="space-y-1.5">
            <Label>{t('diver.trip.certLabel')} <span className="text-destructive">*</span></Label>
            <Select value={fields.certification} onValueChange={v => onFieldChange('certification', v)}>
              <SelectTrigger><SelectValue placeholder={t('diver.trip.certLabel')} /></SelectTrigger>
              <SelectContent>
                {CERT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Certification = none warning */}
          {fields.certification === 'none' && (
            <div className="flex gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-warning leading-relaxed">
                {t('diver.trip.noCertWarning') || 'Please note: you should have a valid diver certification before diving. Your booking will be reviewed for confirmation pending you obtaining your certification.'}
              </p>
            </div>
          )}

          {/* Logged dives */}
          {showDives && (
            <div className="space-y-1.5">
              <Label htmlFor="profile-dives">{t('diver.profile.dives')} <span className="text-destructive">*</span></Label>
              <Input
                id="profile-dives"
                type="number"
                min={0}
                value={fields.loggedDives}
                onChange={e => onFieldChange('loggedDives', parseInt(e.target.value) || 0)}
                onFocus={e => e.target.select()}
              />
            </div>
          )}

          {/* Emergency contact — name on top, phone below */}
          {showEmergency && (
            <>
              <Label className="text-sm font-medium">{t('diver.profile.emergency')} <span className="text-destructive">*</span></Label>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-emergency-name" className="text-xs text-muted-foreground">{t('diver.profile.emergencyName')}</Label>
                  <Input
                    id="profile-emergency-name"
                    value={fields.emergencyContactName}
                    onChange={e => onFieldChange('emergencyContactName', e.target.value)}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-emergency-phone" className="text-xs text-muted-foreground">{t('diver.profile.emergencyPhone')}</Label>
                  <PhoneInput
                    value={fields.emergencyContactPhone}
                    onChange={v => onFieldChange('emergencyContactPhone', v)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            className="w-full bg-primary text-primary-foreground hover:brightness-110 shadow-ocean"
            onClick={onSubmit}
            disabled={creating || !isValid}
          >
            {creating ? t('common.loading') : t('diver.trip.completeAndBook')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
