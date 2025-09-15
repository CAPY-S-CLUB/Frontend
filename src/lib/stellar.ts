import StellarSdk, { Asset, Keypair } from 'stellar-sdk'
import { getStellarConfig } from './stellar-config'

// Obter configurações do Stellar
const config = getStellarConfig()

// Interfaces para metadados
export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string
  }>
}

export interface BadgeMetadata {
  name: string
  description: string
  image: string
  rarity: string
  category: string
}

/**
 * Verifica se o usuário possui o NFT de membership
 * @param userAddress - Endereço público da carteira do usuário
 * @returns Promise<boolean> - true se possui membership, false caso contrário
 */
export async function checkMembership(userAddress: string): Promise<boolean> {
  try {
    // Validar endereço
    if (!userAddress || typeof userAddress !== 'string') {
      console.error('Endereço de usuário inválido')
      return false
    }

    // Configurar servidor Stellar
    const server = new StellarSdk.Server(config.horizonUrl)
    
    // Criar objeto do ativo de membership
    const membershipAsset = new Asset(config.membershipAsset.code, config.membershipAsset.issuer)
    
    // Buscar conta do usuário
    const account = await server.loadAccount(userAddress)
    
    // Verificar se a conta possui o ativo de membership
    const balance = account.balances.find((balance: any) => {
      if (balance.asset_type === 'native') return false
      
      const asset = new Asset(balance.asset_code!, balance.asset_issuer!)
      return asset.equals(membershipAsset)
    })
    
    // Retornar true se encontrar o ativo com saldo > 0
    if (balance && parseFloat(balance.balance) > 0) {
      console.log(`Usuário ${userAddress} possui membership NFT`)
      return true
    }
    
    console.log(`Usuário ${userAddress} não possui membership NFT`)
    return false
    
  } catch (error) {
    console.error('Erro ao verificar membership:', error)
    
    // Em caso de erro, retornar false por segurança
    return false
  }
}

/**
 * Verifica se o usuário possui um badge específico
 * @param userAddress - Endereço público da carteira do usuário
 * @param badgeId - ID do badge a ser verificado
 * @returns Promise<boolean> - true se possui o badge, false caso contrário
 */
export async function checkBadge(userAddress: string, badgeId: string): Promise<boolean> {
  try {
    // Validar parâmetros
    if (!userAddress || !badgeId) {
      console.error('Parâmetros inválidos para verificação de badge')
      return false
    }

    // Configurar servidor Stellar
    const server = new StellarSdk.Server(config.horizonUrl)
    
    // Criar objeto do ativo do badge
    const badgeAsset = new Asset(badgeId, config.membershipAsset.issuer)
    
    // Buscar conta do usuário
    const account = await server.loadAccount(userAddress)
    
    // Verificar se a conta possui o ativo do badge
    const balance = account.balances.find((balance: any) => {
      if (balance.asset_type === 'native') return false
      
      const asset = new Asset(balance.asset_code!, balance.asset_issuer!)
      return asset.equals(badgeAsset)
    })
    
    // Retornar true se encontrar o ativo com saldo > 0
    if (balance && parseFloat(balance.balance) > 0) {
      console.log(`Usuário ${userAddress} possui badge ${badgeId}`)
      return true
    }
    
    console.log(`Usuário ${userAddress} não possui badge ${badgeId}`)
    return false
    
  } catch (error) {
    console.error('Erro ao verificar badge:', error)
    return false
  }
}

/**
 * Obtém informações da conta do usuário
 * @param userAddress - Endereço público da carteira do usuário
 * @returns Promise<object> - Informações da conta
 */
export async function getAccountInfo(userAddress: string) {
  try {
    const server = new StellarSdk.Server(config.horizonUrl)
    const account = await server.loadAccount(userAddress)
    
    return {
      accountId: account.accountId(),
      balances: account.balances,
      sequence: account.sequenceNumber(),
      subentryCount: account.subentryCount()
    }
  } catch (error) {
    console.error('Erro ao obter informações da conta:', error)
    throw error
  }
}

/**
 * Busca metadados do NFT de membership
 * @param userAddress - Endereço público da carteira do usuário
 * @returns Promise<NFTMetadata | null> - Metadados do NFT ou null se não encontrado
 */
export async function getMembershipNFTMetadata(userAddress: string): Promise<NFTMetadata | null> {
  try {
    // Verificar se possui membership
    const hasMembership = await checkMembership(userAddress)
    if (!hasMembership) {
      return null
    }

    // Em um cenário real, os metadados seriam armazenados em IPFS ou similar
    // Por enquanto, retornamos metadados mockados baseados no endereço
    const mockMetadata: NFTMetadata = {
      name: `Capys Club Membership #${userAddress.slice(-4)}`,
      description: "Exclusive membership NFT for Capys Club. Grants access to premium features and exclusive content.",
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userAddress}&backgroundColor=1f2937&textColor=ffffff`,
      attributes: [
        {
          trait_type: "Tier",
          value: "VIP"
        },
        {
          trait_type: "Rarity",
          value: "Legendary"
        },
        {
          trait_type: "Member Since",
          value: new Date().toLocaleDateString()
        },
        {
          trait_type: "Wallet",
          value: userAddress.slice(0, 8) + "..." + userAddress.slice(-8)
        }
      ]
    }

    return mockMetadata
  } catch (error) {
    console.error('Erro ao buscar metadados do NFT de membership:', error)
    return null
  }
}

/**
 * Busca metadados de todos os badges que o usuário possui
 * @param userAddress - Endereço público da carteira do usuário
 * @returns Promise<BadgeMetadata[]> - Array de metadados dos badges
 */
export async function getUserBadgesMetadata(userAddress: string): Promise<BadgeMetadata[]> {
  try {
    const badges: BadgeMetadata[] = []
    
    // Lista de badges disponíveis para verificar
    const availableBadges = [
      { id: 'BADGE1', name: 'First Achievement', description: 'Completed your first task', rarity: 'Common', category: 'Milestone' },
      { id: 'BADGE2', name: 'Community Helper', description: 'Helped 10 community members', rarity: 'Rare', category: 'Community' },
      { id: 'BADGE3', name: 'Early Adopter', description: 'Joined in the first week', rarity: 'Epic', category: 'Exclusive' },
      { id: 'BADGE4', name: 'Content Creator', description: 'Created 5 pieces of content', rarity: 'Rare', category: 'Creative' },
      { id: 'BADGE5', name: 'Loyal Member', description: 'Active for 30+ days', rarity: 'Epic', category: 'Loyalty' }
    ]

    // Verificar cada badge
    for (const badge of availableBadges) {
      const hasBadge = await checkBadge(userAddress, badge.id)
      if (hasBadge) {
        badges.push({
          name: badge.name,
          description: badge.description,
          image: `https://api.dicebear.com/7.x/shapes/svg?seed=${badge.id}&backgroundColor=1f2937&textColor=ffffff`,
          rarity: badge.rarity,
          category: badge.category
        })
      }
    }

    return badges
  } catch (error) {
    console.error('Erro ao buscar metadados dos badges:', error)
    return []
  }
}

/**
 * Busca informações completas do usuário (membership + badges)
 * @param userAddress - Endereço público da carteira do usuário
 * @returns Promise<object> - Informações completas do usuário
 */
export async function getUserProfile(userAddress: string) {
  try {
    const [membershipNFT, badges] = await Promise.all([
      getMembershipNFTMetadata(userAddress),
      getUserBadgesMetadata(userAddress)
    ])

    return {
      hasMembership: !!membershipNFT,
      membershipNFT,
      badges,
      totalBadges: badges.length
    }
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error)
    return {
      hasMembership: false,
      membershipNFT: null,
      badges: [],
      totalBadges: 0
    }
  }
}
