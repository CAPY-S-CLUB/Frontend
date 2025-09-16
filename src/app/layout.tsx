import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { WalletProvider } from '@/lib/WalletProvider'
import { HeaderProvider } from '@/lib/HeaderProvider'
import { AuthProvider } from '@/lib/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Frontend HackMeridian',
  description: 'Projeto Next.js com App Router, TypeScript e Tailwind CSS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-900`}>
        <WalletProvider>
          <AuthProvider>
            <HeaderProvider>
              <Header />
              <main className="pt-20">
                {children}
              </main>
            </HeaderProvider>
          </AuthProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
