import { useState, useCallback } from 'react'

export type ValidationRules<T> = {
  [K in keyof T]?: (value: T[K], values: T) => string | undefined
}

export interface UseFormOptions<T> {
  onSubmit: (values: T) => Promise<void> | void
  validate?: ValidationRules<T>
  onError?: (error: Error) => void
}

/**
 * Custom hook for form state management and validation
 * Eliminates repetitive form validation logic across multiple forms
 * 
 * @example
 * const { values, errors, handleChange, handleSubmit } = useForm(
 *   { name: '', email: '' },
 *   {
 *     validate: {
 *       name: (v) => !v.trim() ? 'Required' : undefined,
 *       email: (v) => !v.includes('@') ? 'Invalid email' : undefined,
 *     },
 *     onSubmit: async (values) => {
 *       await api.post('/consumers', values)
 *     },
 *   }
 * )
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  options: UseFormOptions<T>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      const rule = options.validate?.[name]
      if (rule) {
        const error = rule(value, values)
        return error
      }
      return undefined
    },
    [options.validate, values]
  )

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value, type } = e.target
      const fieldValue =
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

      setValues((prev) => ({ ...prev, [name]: fieldValue }))

      // Validate on change after first submission
      if (isSubmitted) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = validateField(name as keyof T, fieldValue as any)
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }))
      }
    },
    [isSubmitted, validateField]
  )

  const validateAll = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {}

    Object.keys(values).forEach((key) => {
      const error = validateField(key as keyof T, values[key as keyof T])
      if (error) {
        newErrors[key as keyof T] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values, validateField])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitted(true)

      if (!validateAll()) {
        return
      }

      try {
        setIsSubmitting(true)
        await options.onSubmit(values)
        setValues(initialValues)
        setErrors({})
        setIsSubmitted(false)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        options.onError?.(err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateAll, options, initialValues, values]
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setIsSubmitted(false)
  }, [initialValues])

  const setFieldValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const setFieldError = useCallback((name: keyof T, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [name]: error }))
  }, [])

  return {
    values,
    errors,
    isSubmitting,
    isSubmitted,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    touched: isSubmitted,
  }
}
