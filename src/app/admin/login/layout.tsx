export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // No AdminHeader, no white background wrapper — login page controls its own look
  return <>{children}</>
}
