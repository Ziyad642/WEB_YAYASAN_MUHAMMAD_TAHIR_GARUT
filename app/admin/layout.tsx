// Admin layout — intentionally excludes public SiteHeader/SiteFooter
// All admin UI is self-contained inside AdminDashboardShell

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
