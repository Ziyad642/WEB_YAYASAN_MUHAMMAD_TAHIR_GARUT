import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { getEducationUnits, getFoundationSettings } from '@/lib/data/public-repository';

export async function PublicShell({ children }: { children: ReactNode }) {
  const [settings, units] = await Promise.all([
    getFoundationSettings(),
    getEducationUnits(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader settings={settings} units={units} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
