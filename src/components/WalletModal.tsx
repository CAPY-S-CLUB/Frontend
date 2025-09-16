'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { X } from 'lucide-react'
import { useHeader } from '@/lib/HeaderProvider'
import { FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit'
import { ALBEDO_ID } from '@creit.tech/stellar-wallets-kit/modules/albedo.module'

interface WalletOption {
  id: string
  name: string
  icon: string
  description: string
  isInstalled?: boolean
}

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectWallet: (walletId: string) => void
}

// Lista de carteiras suportadas pelo Stellar Wallet Kit
// Usando os IDs corretos do @creit.tech/stellar-wallets-kit
const SUPPORTED_WALLETS: WalletOption[] = [
  {
    id: 'freighter',
    name: 'Freighter',
    icon: '🚀',
    description: 'Browser extension wallet for Stellar'
  },
  {
    id: 'albedo',
    name: 'Albedo',
    icon: '🌟',
    description: 'Web-based Stellar wallet'
  },
  {
    id: 'rabet',
    name: 'Rabet',
    icon: '🐰',
    description: 'Mobile and browser Stellar wallet'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect with mobile wallets'
  },
  {
    id: 'xbull',
    name: 'xBull',
    icon: '🐂',
    description: 'Multi-platform Stellar wallet'
  },
  {
    id: 'lobstr',
    name: 'LOBSTR',
    icon: '🦞',
    description: 'Mobile Stellar wallet'
  }
]

export default function WalletModal({ isOpen, onClose, onSelectWallet }: WalletModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const { hideHeader, showHeader } = useHeader()

  useEffect(() => {
    if (isOpen) {
      hideHeader()
    } else {
      showHeader()
    }
    return () => showHeader()
  }, [isOpen, hideHeader, showHeader])

  if (!isOpen) return null

  const handleWalletSelect = async (walletId: string) => {
    setIsConnecting(walletId)
    try {
      await onSelectWallet(walletId)
    } catch (error) {
      console.error('Erro ao conectar carteira:', error)
    } finally {
      setIsConnecting(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[60] p-4 pt-20">
      <div className="bg-slate-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 text-sm mb-6">
            Choose your preferred wallet to connect to the Stellar network
          </p>

          {/* Wallet Options */}
          <div className="space-y-3">
            {SUPPORTED_WALLETS.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.id)}
                disabled={isConnecting !== null}
                className="w-full p-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors duration-200 text-left group"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{wallet.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold group-hover:text-yellow-400 transition-colors">
                        {wallet.name}
                      </h3>
                      {isConnecting === wallet.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{wallet.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-xs text-center">
              Dont have a wallet?{' '}
              <a
                href="https://www.stellar.org/wallets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Learn more about Stellar wallets
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}