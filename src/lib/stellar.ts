// Mock temporário do stellar.ts devido a problemas de compatibilidade do stellar-sdk
// TODO: Implementar versão real quando o stellar-sdk for corrigido

// Mock temporário das configurações
const config = {
  horizonUrl: 'https://horizon-testnet.stellar.org',
  membershipAsset: {
    code: 'CAPYS',
    issuer: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
  }
}

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
    // Mock temporário - sempre retorna true para desenvolvimento
    console.log('Mock: Verificando membership para:', userAddress)
    return true
  } catch (error) {
    console.error('Erro ao verificar membership:', error)
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
    // Mock temporário - retorna true para alguns badges
    console.log('Mock: Verificando badge', badgeId, 'para:', userAddress)
    return Math.random() > 0.5 // Simula alguns badges
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
    // Mock temporário
    console.log('Mock: Obtendo informações da conta:', userAddress)
    return {
      id: userAddress,
      sequence: '123456789',
      balances: []
    }
  } catch (error) {
    console.error('Erro ao obter informações da conta:', error)
    throw error
  }
}

/**
 * Obtém metadados do NFT de membership do usuário
 * @param userAddress - Endereço público da carteira do usuário
 * @returns Promise<NFTMetadata | null> - Metadados do NFT ou null se não possuir
 */
export async function getMembershipNFTMetadata(userAddress: string): Promise<NFTMetadata | null> {
  try {
    // Mock temporário
    console.log('Mock: Obtendo metadados do NFT de membership para:', userAddress)
    
    return {
      name: 'Capys Club Membership #1234',
      description: 'Exclusive membership NFT for Capys Club members',
      image: `https://api.dicebear.com/7.x/big-smile/svg?seed=${userAddress}&backgroundColor=1f2937&textColor=ffffff`,
      attributes: [
        { trait_type: 'Membership Level', value: 'Gold' },
        { trait_type: 'Join Date', value: '2024-01-15' },
        { trait_type: 'Member ID', value: '1234' },
        { trait_type: 'Status', value: 'Active' }
      ]
    }
  } catch (error) {
    console.error('Erro ao obter metadados do NFT de membership:', error)
    return null
  }
}

/**
 * Obtém metadados dos badges do usuário
 * @param userAddress - Endereço público da carteira do usuário
 * @returns Promise<BadgeMetadata[]> - Array de metadados dos badges
 */
export async function getUserBadgesMetadata(userAddress: string): Promise<BadgeMetadata[]> {
  try {
    // Mock temporário
    console.log('Mock: Obtendo badges para:', userAddress)
    
    const mockBadges: BadgeMetadata[] = [
      {
        name: 'Early Adopter',
        description: 'One of the first members to join Capys Club',
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=early-adopter&backgroundColor=1f2937&textColor=ffffff`,
        rarity: 'Rare',
        category: 'Membership'
      },
      {
        name: 'Community Builder',
        description: 'Helped grow the Capys Club community',
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=community-builder&backgroundColor=1f2937&textColor=ffffff`,
        rarity: 'Epic',
        category: 'Community'
      },
      {
        name: 'Event Participant',
        description: 'Participated in a Capys Club event',
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=event-participant&backgroundColor=1f2937&textColor=ffffff`,
        rarity: 'Common',
        category: 'Events'
      }
    ]
    
    // Retorna badges aleatórios para simular
    return mockBadges.filter(() => Math.random() > 0.3)
  } catch (error) {
    console.error('Erro ao obter badges do usuário:', error)
    return []
  }
}

/**
 * Obtém perfil completo do usuário
 * @param userAddress - Endereço público da carteira do usuário
 * @returns Promise<object> - Perfil completo do usuário
 */
export async function getUserProfile(userAddress: string) {
  try {
    console.log('Mock: Obtendo perfil completo para:', userAddress)
    
    const hasMembership = await checkMembership(userAddress)
    const membershipNFT = hasMembership ? await getMembershipNFTMetadata(userAddress) : null
    const badges = await getUserBadgesMetadata(userAddress)
    
    return {
      hasMembership,
      membershipNFT,
      badges,
      totalBadges: badges.length
    }
  } catch (error) {
    console.error('Erro ao obter perfil do usuário:', error)
    throw error
  }
}
