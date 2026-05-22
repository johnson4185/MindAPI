export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

/** Map common API lifecycle statuses to semantic StatusBadge variants. */
export function apiStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'Active': return 'success'
    case 'Draft': return 'neutral'
    case 'Deprecated':
    case 'Suspended': return 'error'
    default: return 'neutral'
  }
}

/** Generic fallback — returns success for truthy, neutral for falsy. */
export function booleanVariant(value: boolean): StatusVariant {
  return value ? 'success' : 'neutral'
}
