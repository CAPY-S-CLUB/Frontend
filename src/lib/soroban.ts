import * as StellarSdk from 'stellar-sdk'
import { getSorobanConfig } from './soroban-config'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { 
  createBlockchainError, 
  logError, 
  withErrorHandling, 
  validateStellarAddress, 
  validateContractId,
  sanitizeInput,
  BlockchainError,
  BlockchainErrorType
} from './error-handler'

// Obter configurações do Soroban
const config = getSorobanConfig()

// Interfaces
export interface TransactionStatus {
  status: 'pending' | 'success' | 'error'
  message: string
  transactionHash?: string
  error?: string
}

export interface MembershipData {
  targetAddress: string
  membershipId: string
  tier: string
  metadata: string
}

/**
 * Constrói uma transação para emitir um novo membership
 * @param userAddress - Endereço da carteira que receberá o membership
 * @param tier - Tier do membership
 * @param rarity - Raridade do membership
 * @param category - Categoria do membership
 * @returns Promise<string> -XDR da transação construída
 */
export async function issueMembershipTransaction(
  userAddress: string,
  tier: string,
  rarity: string,
  category: string
): Promise<string> {
  // Validação de inputs
  if (!validateStellarAddress(userAddress)) {
    throw createBlockchainError(
      new Error('Endereço de usuário inválido'),
      'Validação de endereço'
    )
  }
  
  const sanitizedTier = sanitizeInput(tier)
  const sanitizedRarity = sanitizeInput(rarity)
  const sanitizedCategory = sanitizeInput(category)
  
  if (!sanitizedTier || !sanitizedRarity || !sanitizedCategory) {
    throw createBlockchainError(
      new Error('Parâmetros de membership inválidos'),
      'Validação de parâmetros'
    )
  }

  try {
    const config = getSorobanConfig()
    
    if (!validateContractId(config.contracts.membership)) {
      throw createBlockchainError(
        new Error('ID do contrato de membership inválido'),
        'Validação de contrato'
      )
    }
    
    const server = new StellarSdk.SorobanRpc.Server(config.rpcUrl)
    const contract = new StellarSdk.Contract(config.contracts.membership)

    // Simular transação (sem chave secreta do admin)
    const sourceAccount = new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0')
    
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: config.baseFee,
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'issue_membership',
          StellarSdk.nativeToScVal(userAddress, { type: 'address' }),
          StellarSdk.nativeToScVal(sanitizedTier, { type: 'string' }),
          StellarSdk.nativeToScVal(sanitizedRarity, { type: 'string' }),
          StellarSdk.nativeToScVal(sanitizedCategory, { type: 'string' })
        )
      )
      .setTimeout(config.transactionTimeout)
      .build()

    return transaction.toXDR()
  } catch (error) {
    const blockchainError = createBlockchainError(error, 'Criação de transação de membership')
    logError(blockchainError)
    throw blockchainError
  }
}

/**
 * Constrói uma transação para emitir um badge
 * @param userAddress - Endereço da carteira que receberá o badge
 * @param badgeType - Tipo do badge
 * @param rarity - Raridade do badge
 * @param category - Categoria do badge
 * @returns Promise<string> - XDR da transação construída
 */
export async function issueBadgeTransaction(
  userAddress: string,
  badgeType: string,
  rarity: string,
  category: string
): Promise<string> {
  try {
    const config = getSorobanConfig()
    const server = new StellarSdk.SorobanRpc.Server(config.rpcUrl)

    // Note: Admin functionality requires proper key management
    // For now, we'll use a placeholder or require the admin key to be passed as parameter
    throw new Error('Admin secret key not configured. Please provide admin credentials.')

    // Create contract instance
    const contract: StellarSdk.Contract = new StellarSdk.Contract(config.contracts.badges)

    // Build transaction would require admin account
    // const transaction = new StellarSdk.TransactionBuilder(adminAccount, {
    //   fee: StellarSdk.BASE_FEE,
    //   networkPassphrase: config.networkPassphrase,
    // })
    //   .addOperation(
    //     contract.call(
    //       'issue_badge',
    //       StellarSdk.nativeToScVal(userAddress, { type: 'address' }),
    //       StellarSdk.nativeToScVal(badgeType, { type: 'string' }),
    //       StellarSdk.nativeToScVal(rarity, { type: 'string' }),
    //       StellarSdk.nativeToScVal(category, { type: 'string' })
    //     )
    //   )
    //   .setTimeout(30)
    //   .build()

    // return transaction.toXDR()
    return 'placeholder_transaction_xdr'
  } catch (error) {
    console.error('Erro ao criar transação de badge:', error)
    throw new Error('Falha ao criar transação de badge')
  }
}

/**
 * Constrói uma transação para conceder (award) um badge existente
 * @param userAddress - Endereço da carteira que receberá o badge
 * @param badgeId - ID do badge a ser concedido
 * @param reason - Razão para conceder o badge
 * @returns Promise<string> - XDR da transação construída
 */
export async function awardBadgeTransaction(
  userAddress: string,
  badgeId: string,
  reason: string
): Promise<string> {
  try {
    const config = getSorobanConfig()
    const server = new StellarSdk.SorobanRpc.Server(config.rpcUrl)

    // Note: Admin functionality requires proper key management
    // For now, we'll use a placeholder or require the admin key to be passed as parameter
    throw new Error('Admin secret key not configured. Please provide admin credentials.')

    // Create contract instance
    const contract: StellarSdk.Contract = new StellarSdk.Contract(config.contracts.badges)

    // Build transaction would require admin account
    // const transaction = new StellarSdk.TransactionBuilder(adminAccount, {
    //   fee: StellarSdk.BASE_FEE,
    //   networkPassphrase: config.networkPassphrase,
    // })
    //   .addOperation(
    //     contract.call(
    //       'award_badge',
    //       StellarSdk.nativeToScVal(userAddress, { type: 'address' }),
    //       StellarSdk.nativeToScVal(badgeId, { type: 'string' }),
    //       StellarSdk.nativeToScVal(reason, { type: 'string' })
    //     )
    //   )
    //   .setTimeout(30)
    //   .build()

    // return transaction.toXDR()
    return 'placeholder_transaction_xdr'
  } catch (error) {
    console.error('Erro ao criar transação de award badge:', error)
    throw new Error('Falha ao criar transação de award badge')
  }
}

/**
 * Assina e envia uma transação usando a Freighter
 * @param transaction - Transação a ser assinada
 * @param userAddress - Endereço do usuário que assinará
 * @returns Promise<TransactionStatus> - Status da transação
 */
export async function signAndSubmitTransaction(
  transactionXdr: string,
  userAddress: string,
  kit: StellarWalletsKit
): Promise<TransactionStatus> {
  // Validação de inputs
  if (!validateStellarAddress(userAddress)) {
    const error = createBlockchainError(
      new Error('Endereço de usuário inválido'),
      'Validação de endereço'
    )
    logError(error)
    return {
      status: 'error',
      message: error.userFriendlyMessage,
      error: error.message
    }
  }
  
  if (!transactionXdr || typeof transactionXdr !== 'string') {
    const error = createBlockchainError(
      new Error('XDR da transação inválido'),
      'Validação de XDR'
    )
    logError(error)
    return {
      status: 'error',
      message: error.userFriendlyMessage,
      error: error.message
    }
  }

  const result = await withErrorHandling(async () => {
    const config = getSorobanConfig()
    
    // Assinar com Stellar Wallets Kit
    const { signedTxXdr } = await kit.signTransaction(transactionXdr, {
      address: userAddress,
      networkPassphrase: config.networkPassphrase,
    })

    // Configurar servidor
    const server = new StellarSdk.SorobanRpc.Server(config.rpcUrl)
    
    // Submeter transação
    const transaction = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, config.networkPassphrase)
    const response = await server.sendTransaction(transaction)
    
    if (response.status === 'PENDING') {
      // Aguardar confirmação com timeout configurável
      let attempts = 0
      const maxAttempts = Math.floor(config.transactionTimeout / 2000) // 2 segundos por tentativa
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const txResponse = await server.getTransaction(response.hash)
        
        if (txResponse.status === 'SUCCESS') {
          return {
            status: 'success' as const,
            message: 'Transação confirmada com sucesso',
            transactionHash: response.hash
          }
        } else if (txResponse.status === 'FAILED') {
          throw createBlockchainError(
            new Error('Transação falhou na rede'),
            'Falha de transação'
          )
        }
        
        attempts++
      }
      
      throw createBlockchainError(
        new Error('Timeout aguardando confirmação da transação'),
        'Timeout de confirmação'
      )
    } else {
      throw createBlockchainError(
        new Error(response.errorResult?.toString() || 'Falha ao enviar transação'),
        'Envio de transação'
      )
    }
  }, 'Assinatura e envio de transação', 2) // Máximo 2 tentativas
  
  if (result.success) {
    return result.data
  } else {
    return {
      status: 'error',
      message: result.error.userFriendlyMessage,
      error: result.error.message
    }
  }
}

export async function issueMembership(
  targetAddress: string,
  adminAddress: string,
  kit: StellarWalletsKit
): Promise<TransactionStatus> {
  try {
    // Construir transação
    const transactionXdr = await issueMembershipTransaction(
      targetAddress,
      'VIP',
      'Legendary', 
      'Membership'
    )
    
    // Assinar e enviar
    const result = await signAndSubmitTransaction(transactionXdr, adminAddress, kit)
    
    return result
  } catch (error) {
    console.error('Erro ao emitir membership:', error)
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro ao emitir membership',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

export async function issueBadge(
  targetAddress: string,
  badgeId: string,
  badgeName: string,
  badgeDescription: string,
  adminAddress: string,
  kit: StellarWalletsKit
): Promise<TransactionStatus> {
  try {
    // Construir transação
    const transactionXdr = await issueBadgeTransaction(
      targetAddress,
      badgeId,
      badgeName,
      badgeDescription
    )
    
    // Assinar e enviar
    const result = await signAndSubmitTransaction(transactionXdr, adminAddress, kit)
    
    return result
  } catch (error) {
    console.error('Erro ao emitir badge:', error)
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro ao emitir badge',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

export async function awardBadge(
  targetAddress: string,
  badgeId: string,
  adminAddress: string,
  kit: StellarWalletsKit
): Promise<TransactionStatus> {
  try {
    // Construir transação
    const transactionXdr = await awardBadgeTransaction(
      targetAddress,
      badgeId,
      'Badge awarded for achievement'
    )
    
    // Assinar e enviar
    const result = await signAndSubmitTransaction(transactionXdr, adminAddress, kit)
    
    return result
  } catch (error) {
    console.error('Erro ao conceder badge:', error)
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro ao conceder badge',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}
