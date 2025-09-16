'use client'

import { Button } from './ui/button'
import { useWallet } from '@/lib/WalletProvider'
import ConnectButton from '@/components/ConnectButton'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useHeader } from '@/lib/HeaderProvider'
import WalletModal from './WalletModal'

export default function Header() {
  const { isConnected, publicKey, connectWithWallet, disconnect, isLoading } = useWallet()
  const router = useRouter()
  const { isHeaderVisible } = useHeader()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showWalletModal, setShowWalletModal] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Detectar se rolou para baixo ou para cima
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Rolando para baixo - esconder header
        setIsVisible(false)
      } else {
        // Rolando para cima - mostrar header
        setIsVisible(true)
      }
      
      // Adicionar background quando rolar
      setIsScrolled(currentScrollY > 50)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleConnectClick = () => {
    setShowWalletModal(true)
  }

  const handleWalletSelect = async (walletId: string) => {
    try {
      await connectWithWallet(walletId)
      setShowWalletModal(false)
    } catch (error) {
      console.error('Erro ao conectar carteira:', error)
      // Manter modal aberta em caso de erro para o usuário tentar novamente
    }
  }

  const generateDemoAccount = () => {
    // Gerar dados fictícios de conta demo
    const demoData = {
      accountId: 'DEMO_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      balance: Math.floor(Math.random() * 10000) + 1000,
      assets: ['XLM', 'USDC', 'BTC'],
      transactions: [],
      createdAt: new Date().toISOString()
    }
    
    // Salvar dados demo no localStorage
    localStorage.setItem('demoAccount', JSON.stringify(demoData))
    
    // Redirecionar para dashboard com parâmetro demo
    router.push('/dashboard?demo=true')
  }

  const formatAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 text-white px-6 transition-all duration-300 ease-in-out ${
      (isVisible && isHeaderVisible) ? 'translate-y-0' : '-translate-y-full'
    } ${
       isScrolled ? 'bg-slate-900/95 backdrop-blur-md border-b border-white/20 py-2' : 'bg-transparent border-b border-white/10 py-3'
     }`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">
            Capys Club
          </h1>
        </div>

        {/* Wallet Connection and Demo Account */}
        <div className="flex items-center space-x-4">
          {isConnected && publicKey ? (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-300">
                <span className="text-green-400">●</span> {formatAddress(publicKey)}
              </div>
              <Button
                onClick={generateDemoAccount}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-3 py-1.5 text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-gold-500/25"
              >
                Generate Demo Account
              </Button>
              <Button
                onClick={disconnect}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                onClick={generateDemoAccount}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-3 py-1.5 text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-gold-500/25"
              >
                Generate Demo Account
              </Button>
              <Button
                onClick={handleConnectClick}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1.5 text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelectWallet={handleWalletSelect}
      />
    </header>
  )
}
