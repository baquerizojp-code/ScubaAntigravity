import { format } from 'date-fns';
import { StarRating } from '@/components/StarRating';
import { translate, type Locale } from '@/app/_lib/i18n';
import type { ReviewWithDiver } from '@/app/_lib/queries';

interface ReviewsListProps {
  reviews: ReviewWithDiver[];
  locale: Locale;
}

function firstName(full: string | null): string {
  if (!full) return '';
  return full.trim().split(/\s+/)[0] ?? '';
}

export default function ReviewsList({ reviews, locale }: ReviewsListProps) {
  const t = (k: string) => translate(k, locale);

  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground italic">{t('reviews.noReviews')}</p>;
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="bg-card p-5 rounded-2xl border border-white/5 shadow-card">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <p className="font-semibold text-foreground">
                {firstName(r.diver_profiles?.full_name ?? null) || t('reviews.verifiedAttendee')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('reviews.verifiedAttendee')} · {format(new Date(r.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
            <StarRating value={r.rating} size={16} />
          </div>
          {r.title && <p className="font-semibold text-foreground mt-1">{r.title}</p>}
          {r.body && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{r.body}</p>}
        </li>
      ))}
    </ul>
  );
}
