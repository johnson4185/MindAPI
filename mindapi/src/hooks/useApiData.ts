import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchJson } from '@/lib/api-client'

export interface UseApiDataOptions<T> {
  onError?: (error: Error) => void
  onSuccess?: (data: T) => void
  retry?: number
  retryDelay?: number
  enabled?: boolean
}

export function useApiData<T>(
  url: string,
  options?: UseApiDataOptions<T>
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retries, setRetries] = useState(0)
  const [mounted, setMounted] = useState(false)

  const maxRetries = options?.retry ?? 3
  const retryDelay = options?.retryDelay ?? 1000
  const enabled = options?.enabled !== false

  // Keep callbacks in refs so they don't destabilize useCallback deps
  const onErrorRef = useRef(options?.onError)
  const onSuccessRef = useRef(options?.onSuccess)
  useEffect(() => {
    onErrorRef.current = options?.onError
    onSuccessRef.current = options?.onSuccess
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const refetch = useCallback(async () => {
    if (!enabled || !mounted) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchJson<T>(url)
      setData(result)
      setError(null)
      onSuccessRef.current?.(result)
      setRetries(0)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))

      if (retries < maxRetries) {
        setTimeout(() => {
          setRetries((prev) => prev + 1)
        }, retryDelay * Math.pow(2, retries))
      } else {
        setError(error)
        onErrorRef.current?.(error)
      }
    } finally {
      setLoading(false)
    }
  }, [url, enabled, retries, maxRetries, retryDelay, mounted])

  useEffect(() => {
    if (mounted) {
      void refetch()
    }
  }, [refetch, mounted])

  return {
    data,
    loading,
    error,
    refetch,
    isError: error !== null,
  }
}
