'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  StellarWalletsKit, 
  WalletNetwork, 
  allowAllModules,
  FREIGHTER_ID 
} from '@creit.tech/stellar-wallets-kit'
import { ALBEDO_ID } from '@creit.tech/stellar-wallets-kit/modules/albedo.module'

interface WalletContextType {
  isConnected: boolean
  publicKey: string | null
  connectWithWallet: (walletId: string) => Promise<void>
  disconnect: (forceDisconnect?: boolean) => void
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
  const [isInitialized, setIsInitialized] = useState(false)
  const [connectionMonitor, setConnectionMonitor] = useState<NodeJS.Timeout | null>(null)
  const [forceDisconnect, setForceDisconnect] = useState(false)

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
        setIsInitialized(true)
      } catch (error) {
        console.error('Erro ao inicializar Stellar Wallets Kit:', error)
        setIsInitialized(true)
      }
    }

    initKit()
  }, [])

  // Restaurar conexão da carteira do localStorage (SIMPLIFICADO)
  useEffect(() => {
    const restoreWalletConnection = async () => {
      if (!kit || !isInitialized) return

      const savedPublicKey = localStorage.getItem('wallet_public_key')
      const savedWalletId = localStorage.getItem('wallet_id')
      const forcePersist = localStorage.getItem('wallet_force_persist')
      
      if (!savedPublicKey || !savedWalletId || forcePersist !== 'true') {
        console.log('❌ Nenhuma sessão válida encontrada')
        return
      }

      console.log('✅ Restaurando sessão salva sem reconexão ativa')
      // Apenas restaurar o estado sem tentar reconectar ativamente
      setPublicKey(savedPublicKey)
      setIsWalletConnected(true)
      console.log('✅ Sessão restaurada com sucesso')
    }

    restoreWalletConnection()
  }, [kit, isInitialized])

  // Verificar persistência forçada ao montar componente
  useEffect(() => {
    const forcePersist = localStorage.getItem('wallet_force_persist')
    if (forcePersist === 'true') {
      console.log('🔒 Persistência forçada detectada - carteira será mantida conectada')
      setForceDisconnect(false)
    }
  }, [])

  // Função para monitorar conexão (REMOVIDA - causava loops)
  const startConnectionMonitoring = (walletId: string, expectedAddress: string) => {
    console.log('🔄 Monitoramento contínuo desabilitado para evitar loops')
    // Monitoramento removido para evitar tela de login repetitiva da Albedo
  }

  // Conectar com carteira específica
  const connectWithWallet = async (walletId: string) => {
    setIsLoading(true)
    try {
      if (kit) {
        console.log('Tentando conectar com carteira:', walletId)
        
        // Configurar a carteira selecionada
        kit.setWallet(walletId)
        
        // Aguardar um pouco para a carteira estar pronta
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { address } = await kit.getAddress()
        
        if (address) {
          console.log('✅ Conectado com sucesso:', address)
          setForceDisconnect(false) // Permitir conexão
          setPublicKey(address)
          setIsWalletConnected(true)
          // Salvar no localStorage para persistir a conexão
          localStorage.setItem('wallet_public_key', address)
          localStorage.setItem('wallet_id', walletId)
          localStorage.setItem('wallet_force_persist', 'true')
          
          console.log('🔒 Conexão salva - sem monitoramento ativo para evitar loops')
          
          setIsLoading(false)
          return
        } else {
          throw new Error('Endereço não obtido da carteira')
        }
      } else {
        throw new Error('Kit de carteiras não inicializado')
      }
    } catch (error) {
      console.error('Erro ao conectar à carteira:', error)
      setIsLoading(false)
      
      // Melhor tratamento de erro baseado no tipo
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          throw new Error('Conexão cancelada pelo usuário')
        } else if (error.message.includes('not available')) {
          throw new Error(`Carteira ${walletId} não está disponível ou instalada`)
        } else {
          throw new Error(`Falha ao conectar com a carteira ${walletId}: ${error.message}`)
        }
      } else {
        throw new Error(`Falha ao conectar com a carteira ${walletId}`)
      }
    }
  }

  // Conectar à carteira (método legado - usa Freighter por padrão)
  const connect = async () => {
    await connectWithWallet(FREIGHTER_ID)
  }

  // Desconectar da carteira (MUITO RESTRITIVO)
  const disconnect = (forceDisconnect = false) => {
    console.log('🔌 Tentativa de desconexão da carteira...')
    console.trace('Stack trace da desconexão:')
    
    const forcePersist = localStorage.getItem('wallet_force_persist')
    
    if (!forceDisconnect && forcePersist === 'true') {
      console.log('🚫 DESCONEXÃO BLOQUEADA! Persistência forçada ativa.')
      console.log('🔒 Para desconectar, use disconnect(true) ou remova wallet_force_persist')
      return
    }
    
    console.log('🔌 Executando desconexão...')
    setForceDisconnect(true)
    
    // Limpar monitor
    if (connectionMonitor) {
      clearInterval(connectionMonitor)
      setConnectionMonitor(null)
    }
    
    setPublicKey(null)
    setIsWalletConnected(false)
    // Limpar dados do localStorage
    localStorage.removeItem('wallet_public_key')
    localStorage.removeItem('wallet_id')
    localStorage.removeItem('wallet_force_persist')
    console.log('✅ Carteira desconectada')
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

