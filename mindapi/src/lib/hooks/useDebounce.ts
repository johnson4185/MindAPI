import { useEffect, useState } from 'react'

/**
 * Debounces a value by the given delay (ms).
 * Prevents expensive operations (filter, search) on every keystroke.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(search, 200)
 *   // use debouncedSearch for filtering, search for the input value
 */
export function useDebounce<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
