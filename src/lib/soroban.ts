import * as StellarSdk from 'stellar-sdk'
import { getSorobanConfig } from './soroban-config'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'

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
 * @returns Promise<string> - XDR da transação construída
 */
export async function issueMembershipTransaction(
  userAddress: string,
  tier: string,
  rarity: string,
  category: string
): Promise<string> {
  try {
    const config = getSorobanConfig()
    const server = new StellarSdk.SorobanRpc.Server(config.rpcUrl)

    // Get admin account
    const adminKeypair = StellarSdk.Keypair.fromSecret(config.adminSecretKey)
    const adminAccount = await server.getAccount(adminKeypair.publicKey())

    // Create contract instance
    const contract = new StellarSdk.Contract(config.membershipContractId)

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(adminAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'issue_membership',
          StellarSdk.nativeToScVal(userAddress, { type: 'address' }),
          StellarSdk.nativeToScVal(tier, { type: 'string' }),
          StellarSdk.nativeToScVal(rarity, { type: 'string' }),
          StellarSdk.nativeToScVal(category, { type: 'string' })
        )
      )
      .setTimeout(30)
      .build()

    return transaction.toXDR()
  } catch (error) {
    console.error('Erro ao criar transação de membership:', error)
    throw new Error('Falha ao criar transação de membership')
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

    // Get admin account
    const adminKeypair = StellarSdk.Keypair.fromSecret(config.adminSecretKey)
    const adminAccount = await server.getAccount(adminKeypair.publicKey())

    // Create contract instance
    const contract = new StellarSdk.Contract(config.badgesContractId)

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(adminAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'issue_badge',
          StellarSdk.nativeToScVal(userAddress, { type: 'address' }),
          StellarSdk.nativeToScVal(badgeType, { type: 'string' }),
          StellarSdk.nativeToScVal(rarity, { type: 'string' }),
          StellarSdk.nativeToScVal(category, { type: 'string' })
        )
      )
      .setTimeout(30)
      .build()

    return transaction.toXDR()
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

    // Get admin account
    const adminKeypair = StellarSdk.Keypair.fromSecret(config.adminSecretKey)
    const adminAccount = await server.getAccount(adminKeypair.publicKey())

    // Create contract instance
    const contract = new StellarSdk.Contract(config.badgesContractId)

    // Build transaction
    const transaction = new StellarSdk.TransactionBuilder(adminAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: config.networkPassphrase,
    })
      .addOperation(
        contract.call(
          'award_badge',
          StellarSdk.nativeToScVal(userAddress, { type: 'address' }),
          StellarSdk.nativeToScVal(badgeId, { type: 'string' }),
          StellarSdk.nativeToScVal(reason, { type: 'string' })
        )
      )
      .setTimeout(30)
      .build()

    return transaction.toXDR()
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
  try {
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
      // Aguardar confirmação
      let attempts = 0
      const maxAttempts = 30
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const txResponse = await server.getTransaction(response.hash)
        
        if (txResponse.status === 'SUCCESS') {
          return {
            status: 'success',
            message: 'Transação confirmada com sucesso',
            transactionHash: response.hash
          }
        } else if (txResponse.status === 'FAILED') {
          return {
            status: 'error',
            message: 'Transação falhou',
            error: 'Transaction failed on network'
          }
        }
        
        attempts++
      }
      
      return {
        status: 'error',
        message: 'Timeout aguardando confirmação da transação',
        error: 'Transaction confirmation timeout'
      }
    } else {
      return {
        status: 'error',
        message: 'Falha ao enviar transação',
        error: response.errorResult?.toString() || 'Unknown error'
      }
    }
  } catch (error) {
    console.error('Erro ao assinar/enviar transação:', error)
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Erro ao processar transação',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
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
