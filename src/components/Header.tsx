'use client'

import { Button } from './ui/button'
import { useWallet } from '@/lib/WalletProvider'
import { useAuth } from '@/lib/AuthProvider'
import ConnectButton from '@/components/ConnectButton'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useHeader } from '@/lib/HeaderProvider'
import WalletModal from './WalletModal'

export default function Header() {
  const { isConnected, publicKey, connectWithWallet, disconnect, isLoading } = useWallet()
  const { user, isAuthenticated, logout, loginDemo } = useAuth()
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

  const handleDemoAccount = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      loginDemo()
      router.push('/dashboard')
    }
  }

  const handleLogin = () => {
    router.push('/login')
  }

  const handleLogout = () => {
    console.log('🔴 Botão de logout clicado no Header')
    console.trace('Stack trace do clique no logout:')
    logout()
    disconnect(true) // Forçar desconexão apenas quando usuário clica em logout
    router.push('/')
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
          <img 
            src="/capys-logo.jpeg" 
            alt="Capys Club" 
            className="h-8 w-auto"
          />
        </div>

        {/* User Authentication and Wallet */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">

              
              {/* Wallet Status */}
              {isConnected && publicKey ? (
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-300">
                    <span className="text-green-400">●</span> {formatAddress(publicKey)}
                  </div>
                  <Button
                     onClick={() => disconnect(true)}
                     className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-2 py-1 text-xs rounded transition-colors duration-200"
                     title="Desconectar carteira"
                   >
                     ✕
                   </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnectClick}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full transition-colors duration-200 bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-500"
                >
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
              
              {/* Dashboard Button */}
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-full transition-colors duration-200 bg-gradient-to-r from-yellow-400 to-yellow-500 border border-yellow-400 font-bold"
              >
                Dashboard
              </Button>
              
              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-full transition-colors duration-200 bg-gradient-to-r from-yellow-400 to-yellow-500 border border-yellow-400 font-bold"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={handleDemoAccount}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-full transition-colors duration-200 bg-gradient-to-r from-yellow-400 to-yellow-500 border border-yellow-400 font-bold"
              >
                Demo Account
              </Button>
              <Button
                onClick={handleConnectClick}
                disabled={isLoading}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 px-6 py-3 rounded-full transition-colors duration-200 bg-gradient-to-r from-yellow-400 to-yellow-500 border border-yellow-400 font-bold"
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
