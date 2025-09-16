'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CadastroPage() {
  const router = useRouter()
  const [showOptions, setShowOptions] = useState(false)

  const handleGetStarted = () => {
    setShowOptions(true)
  }

  const handleConnectWallet = () => {
    console.log('Connect Wallet clicked!')
    // Implement wallet connection logic
    alert('Connecting wallet...')
  }

  const handleCreateWallet = () => {
    console.log('Create Wallet clicked!')
    // Implement wallet creation logic
    alert('Creating new wallet...')
  }

  const handleBack = () => {
    if (showOptions) {
      setShowOptions(false)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="relative min-h-screen text-white w-full bg-premium-dark overflow-hidden">
      {/* Premium Floating Particles */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-premium-gold rounded-full animate-pulse opacity-60" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-premium-gold rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-premium-gold rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-premium-gold rounded-full animate-pulse opacity-30" style={{animationDelay: '3s'}} />
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-premium-gold rounded-full animate-pulse opacity-70" style={{animationDelay: '4s'}} />
      </div>
      
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-premium-dark via-slate-900 to-premium-dark opacity-95" />
      
      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full text-center p-4 sm:p-8">
        <div className="max-w-md w-full space-y-8">
          {/* Premium Header */}
          <div className="text-center">
            <h1 className="premium-title mb-4">Welcome to Meridian</h1>
            <p className="premium-subtitle mb-8">
              {showOptions ? 'Escolha como deseja acessar a plataforma' : 'A comunidade privada para os proprietários de iates mais exigentes'}
            </p>
          </div>
          
          <div className="space-y-6">
            <Button
              onClick={handleConnectWallet}
              className="premium-button w-full px-8 py-4 text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              CONECTAR CARTEIRA
            </Button>
              
              <Button
                onClick={handleCreateWallet}
                className="w-full bg-premium-gold/10 border border-premium-gold text-premium-gold hover:bg-premium-gold hover:text-premium-dark font-medium px-6 py-3 rounded-full transition-all duration-300"
              >
                Criar Nova Carteira
              </Button>
            </div>
          
          <div className="pt-6">
            <Button
              onClick={handleBack}
              className="premium-subtitle hover:text-premium-gold underline bg-transparent hover:bg-transparent transition-colors duration-300"
            >
              {showOptions ? 'Voltar' : 'Voltar ao Início'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}