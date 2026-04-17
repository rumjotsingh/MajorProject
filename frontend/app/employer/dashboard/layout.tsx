export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container py-6 md:py-8">
      {children}
    </div>
  );
}
