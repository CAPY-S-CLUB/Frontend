// Configurações do Soroban
export const SOROBAN_CONFIG = {
  // URLs da rede
  RPC_URL: 'https://soroban-testnet.stellar.org',
  HORIZON_URL: 'https://horizon-testnet.stellar.org',
  
  // Configurações da rede
  NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
  
  // Taxa base para transações
  BASE_FEE: '1000000', // 0.01 XLM
  
  // Timeout para transações (em segundos)
  TRANSACTION_TIMEOUT: 30,
  
  // Endereços dos contratos
  CONTRACTS: {
    // Endereço do contrato de membership (exemplo)
    MEMBERSHIP: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHXCN3A3M',
    
    // Outros contratos podem ser adicionados aqui
    // BADGES: 'CONTRACT_ADDRESS_FOR_BADGES',
    // REWARDS: 'CONTRACT_ADDRESS_FOR_REWARDS',
  },
  
  // Configurações de metadados
  METADATA: {
    // Base URL para imagens de fallback
    IMAGE_BASE_URL: 'https://api.dicebear.com/7.x',
    
    // Configurações padrão para NFTs
    DEFAULT_NFT: {
      TIER: 'VIP',
      RARITY: 'Legendary',
      CATEGORY: 'Membership'
    },
    
    // Configurações padrão para badges
    DEFAULT_BADGE: {
      RARITY: 'Rare',
      CATEGORY: 'Achievement'
    }
  }
}

// Função para obter configurações baseadas no ambiente
export const getSorobanConfig = () => {
  return {
    rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || SOROBAN_CONFIG.RPC_URL,
    horizonUrl: process.env.NEXT_PUBLIC_HORIZON_URL || SOROBAN_CONFIG.HORIZON_URL,
    networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || SOROBAN_CONFIG.NETWORK_PASSPHRASE,
    baseFee: process.env.NEXT_PUBLIC_BASE_FEE || SOROBAN_CONFIG.BASE_FEE,
    membershipContractId: process.env.NEXT_PUBLIC_MEMBERSHIP_CONTRACT || SOROBAN_CONFIG.CONTRACTS.MEMBERSHIP,
    badgesContractId: process.env.NEXT_PUBLIC_BADGES_CONTRACT || 'CBADGES_CONTRACT_ID_PLACEHOLDER',
    adminSecretKey: process.env.ADMIN_SECRET_KEY || 'SADMIN_SECRET_KEY_PLACEHOLDER'
  }
}


