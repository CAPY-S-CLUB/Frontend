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

// Função para obter configurações do Soroban com validação
export const getSorobanConfig = () => {
  const config = {
    rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || SOROBAN_CONFIG.RPC_URL,
    horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || SOROBAN_CONFIG.HORIZON_URL,
    networkPassphrase: process.env.NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE || SOROBAN_CONFIG.NETWORK_PASSPHRASE,
    baseFee: process.env.NEXT_PUBLIC_BASE_FEE || SOROBAN_CONFIG.BASE_FEE,
    transactionTimeout: parseInt(process.env.NEXT_PUBLIC_TRANSACTION_TIMEOUT || SOROBAN_CONFIG.TRANSACTION_TIMEOUT.toString()),
    contracts: {
      membership: process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID || SOROBAN_CONFIG.CONTRACTS.MEMBERSHIP,
      badges: process.env.NEXT_PUBLIC_BADGES_CONTRACT || ''
    },
    metadata: SOROBAN_CONFIG.METADATA,
    cache: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_CACHE === 'true',
      duration: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300000')
    },
    debug: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'
  }
  
  // Validação básica
  if (!config.rpcUrl || !config.networkPassphrase) {
    throw new Error('Configurações do Soroban incompletas')
  }
  
  return config
}

// Função para validar se o RPC do Soroban está disponível
export const validateSorobanRPC = async () => {
  try {
    const config = getSorobanConfig()
    const response = await fetch(config.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getHealth'
      })
    })
    return response.ok
  } catch (error) {
    console.error('Erro ao validar RPC do Soroban:', error)
    return false
  }
}

// Função para obter informações do contrato
export const getContractInfo = (contractType: 'membership' | 'badges') => {
  const config = getSorobanConfig()
  return {
    contractId: config.contracts[contractType],
    rpcUrl: config.rpcUrl,
    networkPassphrase: config.networkPassphrase
  }
}


