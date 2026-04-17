import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, ArrowLeft, CheckCircle2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { parseLocalDate, getImageUrl } from '@/lib/utils';
import Navbar from '../../_components/Navbar';
import ReviewsList from '../../_components/ReviewsList';
import BookButton from '../../_components/BookButton';
import { fetchTripBySlug, fetchReviewsForTrip } from '../../_lib/queries';
import { getLocale } from '../../_lib/server-locale';
import { translate } from '../../_lib/i18n';

export const revalidate = 300;

interface TripPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = await fetchTripBySlug(slug);
  if (!trip) return { title: 'Trip not found' };

  const description =
    trip.description?.slice(0, 160) ??
    `Dive ${trip.dive_site} on ${format(parseLocalDate(trip.trip_date), 'MMM dd, yyyy')}.`;
  const image = trip.image_url ? getImageUrl(trip.image_url, { width: 1200, quality: 80 }) : undefined;

  return {
    title: trip.title,
    description,
    alternates: { canonical: `/explore/${trip.slug}` },
    openGraph: {
      title: trip.title,
      description,
      images: image ? [image] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: trip.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function TripDetailPage({ params }: TripPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const trip = await fetchTripBySlug(slug);
  if (!trip) notFound();

  const reviews = await fetchReviewsForTrip(trip.id);
  const t = (k: string) => translate(k, locale);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-secondary/30">
      <Navbar initialLocale={locale} />

      {/* Hero */}
      <section className="relative h-[65vh] min-h-[500px] w-full mt-0 overflow-hidden">
        <div className="absolute inset-0">
          {trip.image_url ? (
            <img
              src={getImageUrl(trip.image_url, { width: 800, quality: 80 }) ?? trip.image_url}
              srcSet={[
                `${getImageUrl(trip.image_url, { width: 800, quality: 80 })} 800w`,
                `${getImageUrl(trip.image_url, { width: 1600, quality: 75 })} 1600w`,
              ].join(', ')}
              sizes="100vw"
              alt={trip.title}
              className="w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-[20s] ease-out"
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-ocean-900 object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/20 to-transparent" />
        </div>

        <div className="absolute bottom-0 w-full z-10">
          <div className="container mx-auto px-6 sm:px-10 pb-12 md:pb-24">
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <Link href="/explore">
                <Button
                  variant="ghost"
                  className="mb-6 hover:bg-foreground/10 text-foreground border border-foreground/20 rounded-full pl-3 pr-5"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> {t('explore.trip.backToExplore')}
                </Button>
              </Link>

              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-background/40 backdrop-blur-md text-foreground border border-foreground/20 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  {trip.dive_centers?.name || t('explore.trip.independentCenter')}
                </Badge>
                {trip.dive_centers?.avg_rating != null && (trip.dive_centers?.review_count ?? 0) > 0 && (
                  <Badge className="bg-background/40 backdrop-blur-md text-foreground border border-foreground/20 text-xs px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    <span className="font-semibold">{Number(trip.dive_centers.avg_rating).toFixed(1)}</span>
                    <span className="opacity-70">({trip.dive_centers.review_count})</span>
                  </Badge>
                )}
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-headline text-foreground tracking-tighter leading-[0.9] mb-6 drop-shadow-2xl">
                {trip.title}
              </h1>

              <p className="text-xl md:text-2xl text-foreground font-light max-w-2xl flex items-center gap-2 bg-background/40 backdrop-blur-sm w-fit px-4 py-2 rounded-xl border border-foreground/10">
                <MapPin className="w-6 h-6 text-primary" />
                {trip.dive_site} <span className="text-foreground/40 mx-2">•</span>{' '}
                <span className="opacity-80 text-lg">{trip.departure_point}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content split */}
      <section className="container mx-auto px-6 sm:px-10 py-16 md:py-24 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-20">
          <div className="xl:col-span-7 space-y-16">
            <div>
              <h2 className="text-3xl font-headline font-bold mb-6 text-foreground flex items-center gap-3">
                <div className="w-8 h-1 bg-secondary rounded-full" />
                {t('explore.trip.theExperience')}
              </h2>
              <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                {trip.description || t('explore.trip.defaultDescription')}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-headline font-bold mb-8 text-foreground">
                {t('explore.trip.expeditionDetails')}
              </h2>
              <div className="grid grid-cols-2 gap-4 md:gap-6 bg-card p-6 md:p-8 rounded-3xl border border-white/5 shadow-card">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-electric/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-cyan-electric" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      {t('common.time')}
                    </p>
                    <p className="font-bold text-foreground">{trip.trip_time.slice(0, 5)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-electric/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-electric" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      {t('explore.trip.group')}
                    </p>
                    <p className="font-bold text-foreground">
                      {t('explore.trip.max')} {trip.total_spots}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-headline font-bold mb-6 text-foreground flex items-center gap-3">
                <div className="w-8 h-1 bg-secondary rounded-full" />
                {t('reviews.title')}
              </h2>
              <ReviewsList reviews={reviews} locale={locale} />
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                <h3 className="font-headline font-bold text-xl mb-6">{t('explore.trip.whatsIncluded')}</h3>
                <ul className="space-y-4">
                  {[
                    t('explore.trip.included.tanks'),
                    t('explore.trip.included.guide'),
                    t('explore.trip.included.snacks'),
                    t('explore.trip.included.fees'),
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium text-foreground">
                      <CheckCircle2 className="w-5 h-5 text-cyan-electric shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card p-8 rounded-3xl border border-border">
                <h3 className="font-headline font-bold text-xl mb-6">{t('explore.trip.requirements')}</h3>
                <ul className="space-y-4">
                  {[
                    t('explore.trip.req.cert'),
                    t('explore.trip.req.insurance'),
                    t('explore.trip.req.sunscreen'),
                    t('explore.trip.req.waiver'),
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-5 h-5 rounded-full border border-muted-foreground/30 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="xl:col-span-5 relative">
            <div className="sticky top-28">
              <div className="bg-card rounded-3xl p-8 border border-white/5 shadow-2xl shadow-black/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />

                <h3 className="text-2xl font-headline font-bold mb-2">{t('explore.trip.reserveYourSpot')}</h3>
                <p className="text-muted-foreground mb-8 text-sm">
                  {trip.available_spots} {t('explore.trip.availabilityRemains')}
                </p>

                <div className="flex items-end justify-between mb-8 pb-8">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                      {t('explore.trip.totalInvestment')}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-headline font-black text-primary leading-none">
                        ${Number(trip.price_usd)}
                      </span>
                      <span className="text-muted-foreground font-bold">USD</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-background rounded-2xl border border-border flex justify-between items-center group hover:border-secondary transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-cyan-electric/10 flex items-center justify-center text-cyan-electric">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                          {t('explore.trip.departureDate')}
                        </p>
                        <p className="font-bold text-foreground">
                          {format(parseLocalDate(trip.trip_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-background rounded-2xl border border-border flex justify-between items-center group hover:border-secondary transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-cyan-electric/10 flex items-center justify-center text-cyan-electric">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                          {t('explore.trip.spotsLeft')}
                        </p>
                        <p className="font-bold text-foreground">
                          {trip.available_spots} {t('explore.trip.available')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <BookButton tripId={trip.id} availableSpots={trip.available_spots} locale={locale} />

                <p className="text-center text-xs text-muted-foreground mt-5 italic">
                  {t('explore.trip.noPaymentRequired')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
