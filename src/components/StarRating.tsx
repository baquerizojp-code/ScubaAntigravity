import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  /** Current rating value (1-5). Use 0 for no selection. */
  value: number;
  /** Called with the clicked star value. Omit to render read-only. */
  onChange?: (value: number) => void;
  /** Visual size of each star in px. Defaults to 20. */
  size?: number;
  className?: string;
}

/**
 * Interactive 1–5 star rating selector.
 * Read-only when `onChange` is not provided.
 */
export function StarRating({ value, onChange, size = 20, className }: StarRatingProps) {
  const interactive = typeof onChange === 'function';
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={cn('flex items-center gap-1', className)} role={interactive ? 'radiogroup' : undefined}>
      {stars.map((n) => {
        const filled = n <= value;
        const Wrapper = interactive ? 'button' : 'span';
        return (
          <Wrapper
            key={n}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange!(n) : undefined}
            aria-label={interactive ? `${n} star${n > 1 ? 's' : ''}` : undefined}
            role={interactive ? 'radio' : undefined}
            aria-checked={interactive ? filled : undefined}
            className={cn(
              'inline-flex items-center justify-center leading-none',
              interactive && 'cursor-pointer rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              !interactive && 'cursor-default',
            )}
          >
            <Star
              width={size}
              height={size}
              className={cn(
                'transition-colors',
                filled ? 'fill-warning text-warning' : 'fill-transparent text-muted-foreground',
              )}
            />
          </Wrapper>
        );
      })}
    </div>
  );
}

export default StarRating;
