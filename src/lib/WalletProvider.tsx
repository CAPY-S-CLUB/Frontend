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
  connectWithWallet: (walletId: string) => Promise<void>
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

  // Conectar com carteira específica
  const connectWithWallet = async (walletId: string) => {
    setIsLoading(true)
    try {
      if (kit) {
        try {
          // Configurar a carteira selecionada
          kit.setWallet(walletId)
          const { address } = await kit.getAddress()
          if (address) {
            setPublicKey(address)
            setIsWalletConnected(true)
            setIsLoading(false)
            return
          }
        } catch (error) {
          console.log(`Carteira ${walletId} não disponível, usando modo demo:`, error)
        }
      }
      
      // Fallback para modo demo
      setTimeout(() => {
        const demoAddress = 'GDEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
        setPublicKey(demoAddress)
        setIsWalletConnected(true)
        setIsLoading(false)
        alert(`Conectado com carteira demo (${walletId})! Endereço: ` + demoAddress.slice(0, 8) + '...' + demoAddress.slice(-8))
      }, 1500)
    } catch (error) {
      console.error('Erro ao conectar à carteira:', error)
      setIsLoading(false)
      throw error
    }
  }

  // Conectar à carteira (método legado - usa Freighter por padrão)
  const connect = async () => {
    await connectWithWallet(FREIGHTER_ID)
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
    connectWithWallet,
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

