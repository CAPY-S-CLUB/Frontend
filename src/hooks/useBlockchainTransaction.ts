'use client'

import { useState, useCallback } from 'react'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { 
  signAndSubmitTransaction,
  issueMembershipTransaction,
  issueBadgeTransaction,
  awardBadgeTransaction,
  TransactionStatus
} from '@/lib/soroban'
import { 
  BlockchainError, 
  withErrorHandling, 
  checkNetworkHealth 
} from '@/lib/error-handler'
import { LoadingState } from '@/components/ui/LoadingStates'

// Tipos de transação disponíveis
export type TransactionType = 'membership' | 'badge' | 'award'

// Interface para o estado da transação
interface TransactionState {
  loadingState: LoadingState
  message: string
  progress?: number
  transactionHash?: string
  error?: BlockchainError
  steps: Array<{
    id: string
    label: string
    state: LoadingState
  }>
  currentStep?: string
}

// Interface para parâmetros de transação
interface TransactionParams {
  userAddress: string
  adminAddress: string
  kit: StellarWalletsKit
  type: TransactionType
  data: {
    tier?: string
    rarity?: string
    category?: string
    badgeId?: string
    badgeName?: string
    badgeDescription?: string
    reason?: string
  }
}

// Hook principal para gerenciar transações blockchain
export function useBlockchainTransaction() {
  const [state, setState] = useState<TransactionState>({
    loadingState: 'idle',
    message: '',
    steps: [
      { id: 'validate', label: 'Validando dados', state: 'idle' },
      { id: 'build', label: 'Construindo transação', state: 'idle' },
      { id: 'sign', label: 'Aguardando assinatura', state: 'idle' },
      { id: 'submit', label: 'Enviando transação', state: 'idle' },
      { id: 'confirm', label: 'Aguardando confirmação', state: 'idle' }
    ]
  })

  // Função para atualizar o estado
  const updateState = useCallback((updates: Partial<TransactionState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Função para atualizar um step específico
  const updateStep = useCallback((stepId: string, stepState: LoadingState) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, state: stepState } : step
      ),
      currentStep: stepState === 'loading' ? stepId : prev.currentStep
    }))
  }, [])

  // Função para resetar o estado
  const reset = useCallback(() => {
    setState({
      loadingState: 'idle',
      message: '',
      steps: [
        { id: 'validate', label: 'Validando dados', state: 'idle' },
        { id: 'build', label: 'Construindo transação', state: 'idle' },
        { id: 'sign', label: 'Aguardando assinatura', state: 'idle' },
        { id: 'submit', label: 'Enviando transação', state: 'idle' },
        { id: 'confirm', label: 'Aguardando confirmação', state: 'idle' }
      ]
    })
  }, [])

  // Função para verificar saúde da rede
  const checkNetwork = useCallback(async () => {
    updateState({ 
      loadingState: 'loading', 
      message: 'Verificando conectividade da rede...' 
    })
    
    const health = await checkNetworkHealth()
    
    if (!health.stellar || !health.soroban) {
      updateState({ 
        loadingState: 'error', 
        message: 'Problemas de conectividade detectados',
        error: health.errors[0]
      })
      return false
    }
    
    updateState({ 
      loadingState: 'success', 
      message: 'Rede disponível' 
    })
    return true
  }, [updateState])

  // Função principal para executar transação
  const executeTransaction = useCallback(async (params: TransactionParams): Promise<boolean> => {
    try {
      // Reset do estado
      reset()
      
      // Step 1: Validação
      updateStep('validate', 'loading')
      updateState({ 
        loadingState: 'loading', 
        message: 'Validando parâmetros da transação...' 
      })
      
      // Verificar conectividade da rede
      const networkOk = await checkNetwork()
      if (!networkOk) {
        updateStep('validate', 'error')
        return false
      }
      
      updateStep('validate', 'success')
      
      // Step 2: Construir transação
      updateStep('build', 'loading')
      updateState({ message: 'Construindo transação...' })
      
      let transactionXdr: string
      
      switch (params.type) {
        case 'membership':
          transactionXdr = await issueMembershipTransaction(
            params.userAddress,
            params.data.tier || 'VIP',
            params.data.rarity || 'Legendary',
            params.data.category || 'Membership'
          )
          break
        case 'badge':
          transactionXdr = await issueBadgeTransaction(
            params.userAddress,
            params.data.badgeId || '',
            params.data.badgeName || '',
            params.data.badgeDescription || ''
          )
          break
        case 'award':
          transactionXdr = await awardBadgeTransaction(
            params.userAddress,
            params.data.badgeId || '',
            params.data.reason || 'Badge awarded'
          )
          break
        default:
          throw new Error('Tipo de transação não suportado')
      }
      
      updateStep('build', 'success')
      
      // Step 3: Assinar transação
      updateStep('sign', 'loading')
      updateState({ message: 'Aguardando assinatura da carteira...' })
      
      // Step 4: Enviar transação
      updateStep('submit', 'loading')
      updateState({ message: 'Enviando transação para a rede...' })
      
      // Step 5: Aguardar confirmação
      updateStep('confirm', 'loading')
      updateState({ message: 'Aguardando confirmação da transação...' })
      
      const result = await signAndSubmitTransaction(
        transactionXdr,
        params.adminAddress,
        params.kit
      )
      
      if (result.status === 'success') {
        updateStep('sign', 'success')
        updateStep('submit', 'success')
        updateStep('confirm', 'success')
        updateState({
          loadingState: 'success',
          message: 'Transação confirmada com sucesso!',
          transactionHash: result.transactionHash
        })
        return true
      } else {
        // Determinar qual step falhou baseado no erro
        if (result.error?.includes('rejected') || result.error?.includes('denied')) {
          updateStep('sign', 'error')
        } else if (result.error?.includes('network') || result.error?.includes('submit')) {
          updateStep('submit', 'error')
        } else {
          updateStep('confirm', 'error')
        }
        
        updateState({
          loadingState: 'error',
          message: result.message || 'Erro na transação'
        })
        return false
      }
      
    } catch (error: any) {
      // Determinar qual step falhou
      if (state.currentStep) {
        updateStep(state.currentStep, 'error')
      }
      
      updateState({
        loadingState: 'error',
        message: error.userFriendlyMessage || error.message || 'Erro desconhecido',
        error: error
      })
      return false
    }
  }, [reset, updateStep, updateState, checkNetwork, state.currentStep])

  // Função para emitir membership
  const issueMembership = useCallback(async (
    userAddress: string,
    adminAddress: string,
    kit: StellarWalletsKit,
    tier: string = 'VIP',
    rarity: string = 'Legendary',
    category: string = 'Membership'
  ) => {
    return executeTransaction({
      userAddress,
      adminAddress,
      kit,
      type: 'membership',
      data: { tier, rarity, category }
    })
  }, [executeTransaction])

  // Função para emitir badge
  const issueBadge = useCallback(async (
    userAddress: string,
    adminAddress: string,
    kit: StellarWalletsKit,
    badgeId: string,
    badgeName: string,
    badgeDescription: string
  ) => {
    return executeTransaction({
      userAddress,
      adminAddress,
      kit,
      type: 'badge',
      data: { badgeId, badgeName, badgeDescription }
    })
  }, [executeTransaction])

  // Função para conceder badge
  const awardBadge = useCallback(async (
    userAddress: string,
    adminAddress: string,
    kit: StellarWalletsKit,
    badgeId: string,
    reason: string = 'Badge awarded for achievement'
  ) => {
    return executeTransaction({
      userAddress,
      adminAddress,
      kit,
      type: 'award',
      data: { badgeId, reason }
    })
  }, [executeTransaction])

  return {
    // Estado atual
    state,
    
    // Funções de controle
    reset,
    checkNetwork,
    
    // Funções de transação
    executeTransaction,
    issueMembership,
    issueBadge,
    awardBadge,
    
    // Estados derivados para facilitar o uso
    isLoading: state.loadingState === 'loading',
    isSuccess: state.loadingState === 'success',
    isError: state.loadingState === 'error',
    hasTransactionHash: !!state.transactionHash
  }
}

// Hook simplificado para operações de carteira
export function useWalletOperations() {
  const [walletState, setWalletState] = useState<{
    loadingState: LoadingState
    message: string
    connectedWallet?: string
  }>({ loadingState: 'idle', message: '' })

  const connectWallet = useCallback(async (kit: StellarWalletsKit) => {
    setWalletState({ loadingState: 'loading', message: 'Conectando carteira...' })
    
    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          setWalletState({ 
            loadingState: 'loading', 
            message: `Conectando com ${option.name}...` 
          })
        }
      })
      
      const { address } = await kit.getAddress()
      
      setWalletState({ 
        loadingState: 'success', 
        message: 'Carteira conectada com sucesso!',
        connectedWallet: address
      })
      
      return address
    } catch (error: any) {
      setWalletState({ 
        loadingState: 'error', 
        message: error.message || 'Erro ao conectar carteira' 
      })
      return null
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    setWalletState({ 
      loadingState: 'idle', 
      message: '',
      connectedWallet: undefined 
    })
  }, [])

  return {
    walletState,
    connectWallet,
    disconnectWallet,
    isConnected: !!walletState.connectedWallet
  }
}