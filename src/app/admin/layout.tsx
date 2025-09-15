import type { Metadata } from 'next'
import { WalletProvider } from '@/lib/WalletProvider'

export const metadata: Metadata = {
  title: 'Admin Panel - Capys Club',
  description: 'Painel administrativo do Capys Club',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  )
}