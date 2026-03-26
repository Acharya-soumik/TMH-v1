import { useState, useEffect } from "react"

interface CacheEntry {
  data: unknown
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 60_000

export function useCmsConfig<T = Record<string, unknown>>(page: string): {
  data: T | null
  isLoading: boolean
  error: string | null
} {
  const url = `/api/page-config/${page}`
  return useFetchJson<T>(url)
}

export function useSiteSettings<T = Record<string, unknown>>(): {
  data: T | null
  isLoading: boolean
  error: string | null
} {
  return useFetchJson<T>("/api/site-settings")
}

export function useLiveCounts(): {
  data: { debates: number; predictions: number; pulseTopics: number; voices: number; totalVotes: number } | null
  isLoading: boolean
  error: string | null
} {
  return useFetchJson("/api/live-counts")
}

export function useHomepageConfig<T = Record<string, unknown>>(): {
  data: T | null
  isLoading: boolean
  error: string | null
} {
  return useFetchJson<T>("/api/homepage")
}

export function usePublicPredictions<T = unknown[]>(): {
  data: T | null
  isLoading: boolean
  error: string | null
} {
  return useFetchJson<T>("/api/predictions")
}

export function usePublicPulseTopics<T = unknown[]>(): {
  data: T | null
  isLoading: boolean
  error: string | null
} {
  return useFetchJson<T>("/api/pulse-topics")
}

function useFetchJson<T>(url: string): {
  data: T | null
  isLoading: boolean
  error: string | null
} {
  const [data, setData] = useState<T | null>(() => {
    const cached = cache.get(url)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(!data)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cached = cache.get(url)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setData(cached.data as T)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(json => {
        if (cancelled) return
        cache.set(url, { data: json, timestamp: Date.now() })
        setData(json as T)
        setIsLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
        setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [url])

  return { data, isLoading, error }
}
