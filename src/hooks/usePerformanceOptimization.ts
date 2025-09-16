import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { debounce, throttle } from 'lodash'
import { cacheManager, CacheType } from '@/lib/cache-manager'

// Hook para debounce de valores
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook para throttle de funções
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  const throttledFn = useMemo(
    () => throttle(fn, delay, { leading: true, trailing: true }),
    [fn, delay]
  )

  useEffect(() => {
    return () => {
      throttledFn.cancel()
    }
  }, [throttledFn])

  return throttledFn as T
}

// Hook para memoização com cache personalizado
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList,
  cacheKey?: string
): T {
  const memoizedValue = useMemo(() => {
    if (cacheKey) {
      // Tentar obter do cache primeiro
      const cached = cacheManager.get(cacheKey, CacheType.USER_DATA)
      if (cached) {
        return cached as T
      }
    }
    
    const value = factory()
    
    if (cacheKey) {
      // Armazenar no cache
      cacheManager.set(cacheKey, value, CacheType.USER_DATA)
    }
    
    return value
  }, deps)

  return memoizedValue
}

// Hook para lazy loading de componentes
export function useLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  const [Component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const loadComponent = useCallback(async () => {
    if (Component || loading) return

    setLoading(true)
    setError(null)

    try {
      const module = await importFn()
      if (mountedRef.current) {
        setComponent(() => module.default)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [importFn, Component, loading])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return { Component, loading, error, loadComponent }
}

// Hook para intersection observer (lazy loading de elementos)
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting
        setIsIntersecting(isCurrentlyIntersecting)
        
        if (isCurrentlyIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observerRef.current.observe(target)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasIntersected, options])

  return { targetRef, isIntersecting, hasIntersected }
}

// Hook para otimização de listas virtualizadas
export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}: {
  items: T[]
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  }, [items, startIndex, endIndex])

  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useThrottle((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, 16) // ~60fps

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll
  }
}

// Hook para otimização de performance de formulários
export function useOptimizedForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit
}: {
  initialValues: T
  validationSchema?: (values: T) => Record<string, string>
  onSubmit: (values: T) => Promise<void> | void
}) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const validationTimeoutRef = useRef<NodeJS.Timeout>()

  // Debounced validation
  const debouncedValidation = useCallback(
    debounce((values: T) => {
      if (validationSchema) {
        const newErrors = validationSchema(values)
        setErrors(newErrors)
      }
    }, 300),
    [validationSchema]
  )

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Clear timeout and set new one for validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current)
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      debouncedValidation({ ...values, [name]: value })
    }, 100)
  }, [values, debouncedValidation])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Validate before submit
      if (validationSchema) {
        const validationErrors = validationSchema(values)
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors)
          return
        }
      }
      
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validationSchema, onSubmit, isSubmitting])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
      debouncedValidation.cancel()
    }
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    handleSubmit,
    reset
  }
}

// Hook para otimização de queries com cache
export function useOptimizedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: {
    cacheType?: CacheType
    staleTime?: number
    refetchOnWindowFocus?: boolean
    enabled?: boolean
  } = {}
) {
  const {
    cacheType = CacheType.USER_DATA,
    staleTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = true,
    enabled = true
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async (force = false) => {
    if (!enabled || (!force && loading)) return

    // Check if data is still fresh
    if (!force && data && Date.now() - lastFetch < staleTime) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Try to get from cache first
      const cachedData = await cacheManager.get(queryKey, cacheType)
      if (cachedData && !force) {
        if (mountedRef.current) {
          setData(cachedData as T)
          setLastFetch(Date.now())
        }
        return
      }

      // Fetch fresh data
      const freshData = await queryFn()
      
      if (mountedRef.current) {
        setData(freshData)
        setLastFetch(Date.now())
        
        // Cache the result
        await cacheManager.set(queryKey, freshData, cacheType)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err as Error)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [queryKey, queryFn, cacheType, enabled, loading, data, lastFetch, staleTime])

  const refetch = useCallback(() => fetchData(true), [fetchData])

  const invalidate = useCallback(async () => {
    await cacheManager.invalidate(queryKey, cacheType)
    setData(null)
    setLastFetch(0)
  }, [queryKey, cacheType])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData()
    }
  }, [enabled, fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      if (data && Date.now() - lastFetch > staleTime) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, data, lastFetch, staleTime, fetchData])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    isStale: data ? Date.now() - lastFetch > staleTime : true
  }
}

// Hook para monitoramento de performance
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0)
  const mountTimeRef = useRef<number>(0)
  const lastRenderTimeRef = useRef<number>(0)

  useEffect(() => {
    mountTimeRef.current = performance.now()
    
    return () => {
      const unmountTime = performance.now()
      const totalTime = unmountTime - mountTimeRef.current
      
      console.log(`[Performance] ${componentName}:`, {
        totalMountTime: totalTime,
        renderCount: renderCountRef.current,
        avgRenderTime: totalTime / renderCountRef.current
      })
    }
  }, [])

  useEffect(() => {
    renderCountRef.current += 1
    lastRenderTimeRef.current = performance.now()
  })

  return {
    renderCount: renderCountRef.current,
    markRender: () => {
      console.log(`[Performance] ${componentName} rendered at:`, performance.now())
    }
  }
}