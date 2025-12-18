export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* TODO: Add shadcn/ui ThemeProvider + Sidebar */}
      {children}
    </div>
  )
}
