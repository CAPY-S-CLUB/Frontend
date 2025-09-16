// Sistema robusto de tratamento de erros para transações blockchain
import { getSorobanConfig } from './soroban-config'
import { getStellarConfig } from './stellar-config'

// Tipos de erro específicos
export enum BlockchainErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  USER_REJECTED = 'USER_REJECTED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Interface para erros estruturados
export interface BlockchainError {
  type: BlockchainErrorType
  message: string
  originalError?: any
  code?: string | number
  details?: Record<string, any>
  timestamp: number
  retryable: boolean
  userFriendlyMessage: string
}

// Mapeamento de mensagens amigáveis
const ERROR_MESSAGES: Record<BlockchainErrorType, string> = {
  [BlockchainErrorType.NETWORK_ERROR]: 'Erro de conexão com a rede. Verifique sua internet.',
  [BlockchainErrorType.WALLET_ERROR]: 'Erro na carteira. Verifique se está conectada.',
  [BlockchainErrorType.CONTRACT_ERROR]: 'Erro no contrato inteligente.',
  [BlockchainErrorType.TRANSACTION_ERROR]: 'Erro ao processar a transação.',
  [BlockchainErrorType.VALIDATION_ERROR]: 'Dados inválidos fornecidos.',
  [BlockchainErrorType.TIMEOUT_ERROR]: 'Operação expirou. Tente novamente.',
  [BlockchainErrorType.INSUFFICIENT_FUNDS]: 'Saldo insuficiente para completar a transação.',
  [BlockchainErrorType.USER_REJECTED]: 'Transação rejeitada pelo usuário.',
  [BlockchainErrorType.UNKNOWN_ERROR]: 'Erro desconhecido. Tente novamente.'
}

// Função para classificar erros
export function classifyError(error: any): BlockchainErrorType {
  if (!error) return BlockchainErrorType.UNKNOWN_ERROR
  
  const errorMessage = error.message?.toLowerCase() || ''
  const errorCode = error.code || error.status
  
  // Erros de rede
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorCode === 'NETWORK_ERROR') {
    return BlockchainErrorType.NETWORK_ERROR
  }
  
  // Erros de carteira
  if (errorMessage.includes('wallet') || errorMessage.includes('freighter') || errorCode === 'WALLET_ERROR') {
    return BlockchainErrorType.WALLET_ERROR
  }
  
  // Usuário rejeitou
  if (errorMessage.includes('user rejected') || errorMessage.includes('user denied') || errorCode === 4001) {
    return BlockchainErrorType.USER_REJECTED
  }
  
  // Saldo insuficiente
  if (errorMessage.includes('insufficient') || errorMessage.includes('balance') || errorCode === 'INSUFFICIENT_FUNDS') {
    return BlockchainErrorType.INSUFFICIENT_FUNDS
  }
  
  // Timeout
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out') || errorCode === 'TIMEOUT') {
    return BlockchainErrorType.TIMEOUT_ERROR
  }
  
  // Erros de contrato
  if (errorMessage.includes('contract') || errorMessage.includes('soroban') || errorCode === 'CONTRACT_ERROR') {
    return BlockchainErrorType.CONTRACT_ERROR
  }
  
  // Erros de transação
  if (errorMessage.includes('transaction') || errorMessage.includes('tx') || errorCode === 'TRANSACTION_ERROR') {
    return BlockchainErrorType.TRANSACTION_ERROR
  }
  
  // Erros de validação
  if (errorMessage.includes('invalid') || errorMessage.includes('validation') || errorCode === 'VALIDATION_ERROR') {
    return BlockchainErrorType.VALIDATION_ERROR
  }
  
  return BlockchainErrorType.UNKNOWN_ERROR
}

// Função para determinar se um erro é recuperável
export function isRetryableError(errorType: BlockchainErrorType): boolean {
  const retryableErrors = [
    BlockchainErrorType.NETWORK_ERROR,
    BlockchainErrorType.TIMEOUT_ERROR,
    BlockchainErrorType.TRANSACTION_ERROR
  ]
  
  return retryableErrors.includes(errorType)
}

// Função principal para criar erro estruturado
export function createBlockchainError(error: any, context?: string): BlockchainError {
  const errorType = classifyError(error)
  const retryable = isRetryableError(errorType)
  
  return {
    type: errorType,
    message: error.message || 'Erro desconhecido',
    originalError: error,
    code: error.code || error.status,
    details: {
      context,
      stack: error.stack,
      timestamp: new Date().toISOString()
    },
    timestamp: Date.now(),
    retryable,
    userFriendlyMessage: ERROR_MESSAGES[errorType]
  }
}

// Função para log de erros com diferentes níveis
export function logError(error: BlockchainError, level: 'error' | 'warn' | 'info' = 'error') {
  const config = getSorobanConfig()
  
  if (config.debug) {
    const logData = {
      type: error.type,
      message: error.message,
      code: error.code,
      retryable: error.retryable,
      timestamp: new Date(error.timestamp).toISOString(),
      details: error.details
    }
    
    console[level]('Blockchain Error:', logData)
  }
}

// Função para retry com backoff exponencial
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const blockchainError = createBlockchainError(error, `Tentativa ${attempt}/${maxAttempts}`)
      
      logError(blockchainError, 'warn')
      
      // Se não é recuperável ou é a última tentativa, falha
      if (!blockchainError.retryable || attempt === maxAttempts) {
        throw blockchainError
      }
      
      // Backoff exponencial
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw createBlockchainError(lastError, 'Todas as tentativas falharam')
}

// Função para validar endereços Stellar
export function validateStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false
  }
  
  // Endereços Stellar começam com G e têm 56 caracteres
  const stellarAddressRegex = /^G[A-Z2-7]{55}$/
  return stellarAddressRegex.test(address)
}

// Função para validar IDs de contrato
export function validateContractId(contractId: string): boolean {
  if (!contractId || typeof contractId !== 'string') {
    return false
  }
  
  // IDs de contrato começam com C e têm 56 caracteres
  const contractIdRegex = /^C[A-Z2-7]{55}$/
  return contractIdRegex.test(contractId)
}

// Função para sanitizar inputs
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  // Remove caracteres perigosos e limita o tamanho
  return input
    .replace(/[<>"'&]/g, '') // Remove caracteres HTML perigosos
    .trim()
    .substring(0, 1000) // Limita a 1000 caracteres
}

// Função para validar metadados de NFT/Badge
export function validateMetadata(metadata: any): boolean {
  if (!metadata || typeof metadata !== 'object') {
    return false
  }
  
  const requiredFields = ['name', 'description']
  return requiredFields.every(field => 
    metadata[field] && typeof metadata[field] === 'string' && metadata[field].trim().length > 0
  )
}

// Wrapper para operações blockchain com tratamento de erro
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries: number = 3
): Promise<{ success: true; data: T } | { success: false; error: BlockchainError }> {
  try {
    const data = await retryWithBackoff(operation, maxRetries)
    return { success: true, data }
  } catch (error) {
    const blockchainError = error instanceof Error && 'type' in error 
      ? error as BlockchainError
      : createBlockchainError(error, context)
    
    logError(blockchainError)
    return { success: false, error: blockchainError }
  }
}

// Função para monitorar saúde da rede
export async function checkNetworkHealth(): Promise<{
  stellar: boolean
  soroban: boolean
  errors: BlockchainError[]
}> {
  const errors: BlockchainError[] = []
  let stellar = false
  let soroban = false
  
  try {
    const stellarConfig = getStellarConfig()
    const response = await fetch(`${stellarConfig.horizonUrl}/`, {
      method: 'GET',
      timeout: stellarConfig.timeout.connection
    })
    stellar = response.ok
  } catch (error) {
    errors.push(createBlockchainError(error, 'Verificação de saúde do Stellar'))
  }
  
  try {
    const sorobanConfig = getSorobanConfig()
    const response = await fetch(sorobanConfig.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth'
      })
    })
    soroban = response.ok
  } catch (error) {
    errors.push(createBlockchainError(error, 'Verificação de saúde do Soroban'))
  }
  
  return { stellar, soroban, errors }
}