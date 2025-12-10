import { Navbar } from '@/components/layout/navbar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
    </div>
  )
}



