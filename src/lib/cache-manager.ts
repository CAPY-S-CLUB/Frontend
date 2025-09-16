import { LRUCache } from 'lru-cache'

// Tipos de cache
export enum CacheType {
  BLOCKCHAIN_DATA = 'blockchain_data',
  USER_DATA = 'user_data',
  NETWORK_STATUS = 'network_status',
  TRANSACTION_HISTORY = 'transaction_history',
  CONTRACT_DATA = 'contract_data',
  WALLET_INFO = 'wallet_info'
}

// Interface para itens do cache
export interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
  key: string
  type: CacheType
}

// Configurações de cache por tipo
const CACHE_CONFIGS = {
  [CacheType.BLOCKCHAIN_DATA]: {
    max: 100,
    ttl: 5 * 60 * 1000, // 5 minutos
    staleWhileRevalidate: 2 * 60 * 1000 // 2 minutos
  },
  [CacheType.USER_DATA]: {
    max: 50,
    ttl: 10 * 60 * 1000, // 10 minutos
    staleWhileRevalidate: 5 * 60 * 1000
  },
  [CacheType.NETWORK_STATUS]: {
    max: 10,
    ttl: 30 * 1000, // 30 segundos
    staleWhileRevalidate: 15 * 1000
  },
  [CacheType.TRANSACTION_HISTORY]: {
    max: 200,
    ttl: 2 * 60 * 1000, // 2 minutos
    staleWhileRevalidate: 1 * 60 * 1000
  },
  [CacheType.CONTRACT_DATA]: {
    max: 75,
    ttl: 15 * 60 * 1000, // 15 minutos
    staleWhileRevalidate: 7 * 60 * 1000
  },
  [CacheType.WALLET_INFO]: {
    max: 25,
    ttl: 1 * 60 * 1000, // 1 minuto
    staleWhileRevalidate: 30 * 1000
  }
}

// Classe principal do gerenciador de cache
export class CacheManager {
  private caches: Map<CacheType, LRUCache<string, CacheItem>>
  private memoryCache: Map<string, any>
  private persistentStorage: boolean

  constructor(options: { persistentStorage?: boolean } = {}) {
    this.caches = new Map()
    this.memoryCache = new Map()
    this.persistentStorage = options.persistentStorage ?? true
    this.initializeCaches()
  }

  private initializeCaches(): void {
    Object.entries(CACHE_CONFIGS).forEach(([type, config]) => {
      const cache = new LRUCache<string, CacheItem>({
        max: config.max,
        ttl: config.ttl,
        allowStale: true,
        updateAgeOnGet: true,
        updateAgeOnHas: true
      })
      
      this.caches.set(type as CacheType, cache)
    })
  }

  // Método para definir um item no cache
  async set<T>(
    key: string,
    data: T,
    type: CacheType,
    customTtl?: number
  ): Promise<void> {
    const cache = this.caches.get(type)
    if (!cache) {
      throw new Error(`Cache type ${type} not found`)
    }

    const config = CACHE_CONFIGS[type]
    const ttl = customTtl || config.ttl
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
      type
    }

    // Armazenar no cache LRU
    cache.set(key, cacheItem)

    // Armazenar no cache de memória para acesso rápido
    this.memoryCache.set(`${type}:${key}`, data)

    // Persistir no localStorage se habilitado
    if (this.persistentStorage && typeof window !== 'undefined') {
      try {
        const storageKey = `cache_${type}_${key}`
        localStorage.setItem(storageKey, JSON.stringify(cacheItem))
      } catch (error) {
        console.warn('Failed to persist cache item:', error)
      }
    }
  }

  // Método para obter um item do cache
  async get<T>(
    key: string,
    type: CacheType,
    fallbackFn?: () => Promise<T>
  ): Promise<T | null> {
    const cache = this.caches.get(type)
    if (!cache) {
      throw new Error(`Cache type ${type} not found`)
    }

    // Verificar cache de memória primeiro
    const memoryKey = `${type}:${key}`
    if (this.memoryCache.has(memoryKey)) {
      return this.memoryCache.get(memoryKey)
    }

    // Verificar cache LRU
    const cacheItem = cache.get(key)
    if (cacheItem && this.isValid(cacheItem)) {
      this.memoryCache.set(memoryKey, cacheItem.data)
      return cacheItem.data
    }

    // Verificar localStorage
    if (this.persistentStorage && typeof window !== 'undefined') {
      try {
        const storageKey = `cache_${type}_${key}`
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsedItem: CacheItem<T> = JSON.parse(stored)
          if (this.isValid(parsedItem)) {
            await this.set(key, parsedItem.data, type)
            return parsedItem.data
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve from localStorage:', error)
      }
    }

    // Executar função de fallback se fornecida
    if (fallbackFn) {
      try {
        const data = await fallbackFn()
        await this.set(key, data, type)
        return data
      } catch (error) {
        console.error('Fallback function failed:', error)
        return null
      }
    }

    return null
  }

  // Verificar se um item do cache é válido
  private isValid(item: CacheItem): boolean {
    const now = Date.now()
    const age = now - item.timestamp
    return age < item.ttl
  }

  // Verificar se um item está obsoleto mas ainda utilizável
  isStale(key: string, type: CacheType): boolean {
    const cache = this.caches.get(type)
    if (!cache) return true

    const item = cache.get(key)
    if (!item) return true

    const config = CACHE_CONFIGS[type]
    const age = Date.now() - item.timestamp
    return age > config.staleWhileRevalidate
  }

  // Invalidar um item específico
  async invalidate(key: string, type: CacheType): Promise<void> {
    const cache = this.caches.get(type)
    if (cache) {
      cache.delete(key)
    }

    const memoryKey = `${type}:${key}`
    this.memoryCache.delete(memoryKey)

    if (this.persistentStorage && typeof window !== 'undefined') {
      try {
        const storageKey = `cache_${type}_${key}`
        localStorage.removeItem(storageKey)
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error)
      }
    }
  }

  // Invalidar todos os itens de um tipo
  async invalidateType(type: CacheType): Promise<void> {
    const cache = this.caches.get(type)
    if (cache) {
      cache.clear()
    }

    // Limpar do cache de memória
    const keysToDelete = Array.from(this.memoryCache.keys())
      .filter(key => key.startsWith(`${type}:`))
    
    keysToDelete.forEach(key => this.memoryCache.delete(key))

    // Limpar do localStorage
    if (this.persistentStorage && typeof window !== 'undefined') {
      try {
        const keysToRemove = Object.keys(localStorage)
          .filter(key => key.startsWith(`cache_${type}_`))
        
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    }
  }

  // Limpar todo o cache
  async clear(): Promise<void> {
    this.caches.forEach(cache => cache.clear())
    this.memoryCache.clear()

    if (this.persistentStorage && typeof window !== 'undefined') {
      try {
        const keysToRemove = Object.keys(localStorage)
          .filter(key => key.startsWith('cache_'))
        
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    }
  }

  // Obter estatísticas do cache
  getStats(): Record<CacheType, { size: number; maxSize: number; hitRatio: number }> {
    const stats: any = {}
    
    this.caches.forEach((cache, type) => {
      const size = cache.size
      const maxSize = cache.max || 0
      
      stats[type] = {
        size,
        maxSize,
        hitRatio: cache.calculatedSize > 0 ? (cache.size / cache.calculatedSize) : 0
      }
    })

    return stats
  }

  // Pré-aquecer o cache com dados essenciais
  async warmup(data: Array<{ key: string; data: any; type: CacheType }>): Promise<void> {
    const promises = data.map(item => 
      this.set(item.key, item.data, item.type)
    )
    
    await Promise.allSettled(promises)
  }
}

// Instância singleton do gerenciador de cache
export const cacheManager = new CacheManager({ persistentStorage: true })

// Hook para usar o cache em componentes React
export function useCache() {
  return {
    get: cacheManager.get.bind(cacheManager),
    set: cacheManager.set.bind(cacheManager),
    invalidate: cacheManager.invalidate.bind(cacheManager),
    invalidateType: cacheManager.invalidateType.bind(cacheManager),
    clear: cacheManager.clear.bind(cacheManager),
    isStale: cacheManager.isStale.bind(cacheManager),
    getStats: cacheManager.getStats.bind(cacheManager)
  }
}

// Utilitários para cache específico de blockchain
export const blockchainCache = {
  // Cache para dados de conta
  async getAccountData(accountId: string) {
    return cacheManager.get(
      `account_${accountId}`,
      CacheType.BLOCKCHAIN_DATA
    )
  },

  async setAccountData(accountId: string, data: any) {
    return cacheManager.set(
      `account_${accountId}`,
      data,
      CacheType.BLOCKCHAIN_DATA
    )
  },

  // Cache para histórico de transações
  async getTransactionHistory(accountId: string) {
    return cacheManager.get(
      `tx_history_${accountId}`,
      CacheType.TRANSACTION_HISTORY
    )
  },

  async setTransactionHistory(accountId: string, history: any[]) {
    return cacheManager.set(
      `tx_history_${accountId}`,
      history,
      CacheType.TRANSACTION_HISTORY
    )
  },

  // Cache para status da rede
  async getNetworkStatus() {
    return cacheManager.get(
      'network_status',
      CacheType.NETWORK_STATUS
    )
  },

  async setNetworkStatus(status: any) {
    return cacheManager.set(
      'network_status',
      status,
      CacheType.NETWORK_STATUS
    )
  },

  // Invalidar cache relacionado a uma conta
  async invalidateAccount(accountId: string) {
    await Promise.all([
      cacheManager.invalidate(`account_${accountId}`, CacheType.BLOCKCHAIN_DATA),
      cacheManager.invalidate(`tx_history_${accountId}`, CacheType.TRANSACTION_HISTORY),
      cacheManager.invalidate(`wallet_${accountId}`, CacheType.WALLET_INFO)
    ])
  }
}