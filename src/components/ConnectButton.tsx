'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { useWallet } from '@/lib/WalletProvider'
import WalletModal from './WalletModal'

type ConnectButtonProps = {
  className?: string
}

export default function ConnectButton({ className }: ConnectButtonProps) {
  const { isConnected, connectWithWallet, disconnect, isLoading } = useWallet()
  const [showWalletModal, setShowWalletModal] = useState(false)

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

  if (isConnected) {
    return (
      <Button
        onClick={() => disconnect()}
        className={`bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 ${className ?? ''}`}
      >
        Disconnect
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={handleConnectClick}
        disabled={isLoading}
        className={`bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 ${className ?? ''}`}
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelectWallet={handleWalletSelect}
      />
    </>
  )
}


