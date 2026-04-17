import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function DiverDashboardPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">
        Diver dashboard — migrating in Phase E
      </p>
    </div>
  );
}
