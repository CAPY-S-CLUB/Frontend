// Configurações padrão da rede Stellar
export const STELLAR_CONFIG = {
  // Rede (testnet para desenvolvimento, mainnet para produção)
  NETWORK: 'testnet',
  
  // URL do servidor Horizon
  HORIZON_URL: 'https://horizon-testnet.stellar.org',
  
  // Configurações do ativo de membership NFT
  MEMBERSHIP_ASSET: {
    CODE: 'CAPYS',
    ISSUER: 'GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6Q4D46B4MBFS' // Exemplo de issuer
  },
  
  // Configurações dos badges
  BADGES: {
    ACHIEVEMENT_1: 'BADGE1',
    ACHIEVEMENT_2: 'BADGE2', 
    ACHIEVEMENT_3: 'BADGE3'
  },
  
  // Configurações de timeout e retry
  TIMEOUT: {
    CONNECTION: 10000, // 10 segundos
    TRANSACTION: 30000 // 30 segundos
  },
  
  // Configurações de retry
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000 // 1 segundo
  }
}

// Função para obter configurações do Stellar com validação
export const getStellarConfig = () => {
  const config = {
    network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || STELLAR_CONFIG.NETWORK,
    horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || STELLAR_CONFIG.HORIZON_URL,
    membershipAsset: {
      code: process.env.NEXT_PUBLIC_MEMBERSHIP_ASSET_CODE || STELLAR_CONFIG.MEMBERSHIP_ASSET.CODE,
      issuer: process.env.NEXT_PUBLIC_MEMBERSHIP_ASSET_ISSUER || STELLAR_CONFIG.MEMBERSHIP_ASSET.ISSUER
    },
    timeout: {
      connection: parseInt(process.env.NEXT_PUBLIC_CONNECTION_TIMEOUT || STELLAR_CONFIG.TIMEOUT.CONNECTION.toString()),
      transaction: parseInt(process.env.NEXT_PUBLIC_TRANSACTION_TIMEOUT || STELLAR_CONFIG.TIMEOUT.TRANSACTION.toString())
    },
    retry: {
      maxAttempts: parseInt(process.env.NEXT_PUBLIC_MAX_RETRY_ATTEMPTS || STELLAR_CONFIG.RETRY.MAX_ATTEMPTS.toString()),
      delay: parseInt(process.env.NEXT_PUBLIC_RETRY_DELAY || STELLAR_CONFIG.RETRY.DELAY.toString())
    },
    cache: {
      enabled: process.env.NEXT_PUBLIC_ENABLE_CACHE === 'true',
      duration: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300000')
    },
    debug: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'
  }
  
  // Validação básica
  if (!config.horizonUrl || !config.network) {
    throw new Error('Configurações do Stellar incompletas')
  }
  
  return config
}

// Função para validar se a rede está disponível
export const validateStellarNetwork = async () => {
  try {
    const config = getStellarConfig()
    const response = await fetch(`${config.horizonUrl}/`, {
      method: 'GET',
      timeout: config.timeout.connection
    })
    return response.ok
  } catch (error) {
    console.error('Erro ao validar rede Stellar:', error)
    return false
  }
}


