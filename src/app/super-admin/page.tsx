import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Super Admin',
  robots: { index: false, follow: false },
};

export default function SuperAdminDashboardPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">
        Super admin dashboard — migrating in Phase E
      </p>
    </div>
  );
}
