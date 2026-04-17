import type { Metadata } from 'next';
import Navbar from '../_components/Navbar';
import ExploreFilters from '../_components/ExploreFilters';
import { fetchPublishedTrips } from '../_lib/queries';
import { getLocale } from '../_lib/server-locale';
import { translate } from '../_lib/i18n';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const title = translate('diver.discover.title', locale);
  const description = translate('diver.discover.subtitle', locale);
  return {
    title,
    description,
    alternates: { canonical: '/explore' },
  };
}

export default async function ExplorePage() {
  const [locale, trips] = await Promise.all([getLocale(), fetchPublishedTrips()]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar initialLocale={locale} />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-28 pb-16">
        <ExploreFilters initialTrips={trips} locale={locale} />
      </div>
    </div>
  );
}
