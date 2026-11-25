import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/PublicShell';
import { UnitDetailView } from '@/components/units/UnitDetailView';
import { getUnitDetailBySlug } from '@/lib/data/public-repository';
import type { UnitSlug } from '@/types/database';

export const dynamic = 'force-dynamic';

const VALID_SLUGS: UnitSlug[] = ['ra', 'mi', 'smp'];

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  if (!VALID_SLUGS.includes(params.slug as UnitSlug)) {
    return { title: 'Unit Tidak Ditemukan' };
  }
  const detail = await getUnitDetailBySlug(params.slug as UnitSlug);
  if (!detail) return { title: 'Unit Tidak Ditemukan' };

  return {
    title: detail.unit.name,
    description: detail.unit.short_description,
  };
}

export default async function UnitDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  if (!VALID_SLUGS.includes(params.slug as UnitSlug)) {
    notFound();
  }

  const detail = await getUnitDetailBySlug(params.slug as UnitSlug);
  if (!detail) {
    notFound();
  }

  return (
    <PublicShell>
      <UnitDetailView {...detail} />
    </PublicShell>
  );
}
