import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/StarRating';
import { useI18n } from '@/lib/i18n';

const REVIEW_TITLE_MAX = 80;
const REVIEW_BODY_MAX = 500;

interface ReviewFormProps {
  submitting: boolean;
  onSubmit: (values: { rating: number; title: string | null; body: string | null }) => void;
}

export function ReviewForm({ submitting, onSubmit }: ReviewFormProps) {
  const { t } = useI18n();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = () => {
    if (rating < 1) return;
    onSubmit({
      rating,
      title: title.trim() || null,
      body: body.trim() || null,
    });
  };

  return (
    <div className="space-y-4 bg-card p-6 rounded-3xl border border-white/5 shadow-card">
      <h3 className="text-xl font-headline font-bold">{t('reviews.leaveReview')}</h3>

      <div>
        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground block mb-2">
          {t('reviews.rating')}
        </label>
        <StarRating value={rating} onChange={setRating} size={32} />
      </div>

      <div>
        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground block mb-2">
          {t('reviews.reviewTitle')}
        </label>
        <Input
          value={title}
          maxLength={REVIEW_TITLE_MAX}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs uppercase font-bold tracking-widest text-muted-foreground block mb-2">
          {t('reviews.reviewBody')}
        </label>
        <Textarea
          value={body}
          maxLength={REVIEW_BODY_MAX}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {body.length}/{REVIEW_BODY_MAX}
        </p>
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={submitting || rating < 1}
      >
        {submitting ? t('common.loading') : t('reviews.submit')}
      </Button>
    </div>
  );
}

export default ReviewForm;
