'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  StellarWalletsKit, 
  WalletNetwork, 
  allowAllModules,
  FREIGHTER_ID 
} from '@creit.tech/stellar-wallets-kit'

interface WalletContextType {
  isConnected: boolean
  publicKey: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isLoading: boolean
  kit: StellarWalletsKit | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [kit, setKit] = useState<StellarWalletsKit | null>(null)

  // Inicializar o Stellar Wallets Kit
  useEffect(() => {
    const initKit = () => {
      try {
        const walletKit = new StellarWalletsKit({
          network: WalletNetwork.TESTNET,
          selectedWalletId: FREIGHTER_ID,
          modules: allowAllModules(),
        })
        setKit(walletKit)
      } catch (error) {
        console.error('Erro ao inicializar Stellar Wallets Kit:', error)
      }
    }

    initKit()
  }, [])

  // Conectar à carteira
  const connect = async () => {
    if (!kit) {
      alert('Stellar Wallets Kit não está inicializado.')
      return
    }

    setIsLoading(true)
    try {
      const { address } = await kit.getAddress()
      if (address) {
        setPublicKey(address)
        setIsWalletConnected(true)
      } else {
        throw new Error('Falha ao obter endereço da carteira')
      }
    } catch (error) {
      console.error('Erro ao conectar à carteira:', error)
      alert('Erro ao conectar à carteira. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // Desconectar da carteira
  const disconnect = () => {
    setPublicKey(null)
    setIsWalletConnected(false)
  }

  const value: WalletContextType = {
    isConnected: isWalletConnected,
    publicKey,
    connect,
    disconnect,
    isLoading,
    kit
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// Hook para usar o contexto da carteira
export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet deve ser usado dentro de um WalletProvider')
  }
  return context
}

