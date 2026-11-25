import { LandingSections } from '@/components/landing/LandingSections';
import { PublicShell } from '@/components/layout/PublicShell';
import {
  getEducationUnits,
  getFoundationSettings,
  getPublishedNews,
} from '@/lib/data/public-repository';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [settings, units, { articles }] = await Promise.all([
    getFoundationSettings(),
    getEducationUnits(),
    getPublishedNews({ limit: 3 }),
  ]);

  return (
    <PublicShell>
      <LandingSections settings={settings} units={units} latestNews={articles} />
    </PublicShell>
  );
}
