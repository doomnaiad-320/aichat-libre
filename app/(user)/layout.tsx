export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* TODO: Add @lobehub/ui ThemeProvider */}
      {children}
    </div>
  )
}
