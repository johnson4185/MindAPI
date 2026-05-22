'use client'
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { API, Consumer, PlatformUser, TenantWorkspace, UserRole } from './types'
import { fetchJson } from './api-client'

function clonePlugin(plugin: PluginConfig): PluginConfig {
  return { ...plugin, config: { ...plugin.config } }
}

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  message: string
  type: ToastType
  visible: boolean
}

export interface PluginConfig {
  name: string
  desc: string
  enabled: boolean
  config: Record<string, string | boolean>
  category?: string
  scope?: 'global' | 'service' | 'route' | 'consumer' | 'consumer-group'
  source?: 'bundled' | 'custom'
  protocols?: string[]
}

export interface AppNotification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  href?: string
}

const DEFAULT_PLUGIN_SET: PluginConfig[] = [
  {
    name: 'API Key Authentication',
    desc: 'Validates API keys in X-API-Key header',
    enabled: true,
    config: { headerName: 'X-API-Key', hideCredentials: true },
    category: 'Authentication',
    scope: 'service',
    source: 'bundled',
    protocols: ['http', 'https'],
  },
  {
    name: 'Rate Limiting',
    desc: '1000 req/min per consumer',
    enabled: true,
    config: { limit: '1000', window: '60', policy: 'consumer' },
    category: 'Traffic Control',
    scope: 'service',
    source: 'bundled',
    protocols: ['http', 'https', 'grpc'],
  },
  {
    name: 'Prometheus Metrics',
    desc: 'Exposes /metrics endpoint for Prometheus scraping',
    enabled: true,
    config: { metricsPath: '/metrics', serviceDiscovery: true },
    category: 'Analytics & Monitoring',
    scope: 'global',
    source: 'bundled',
    protocols: ['http', 'https'],
  },
  {
    name: 'CORS Headers',
    desc: 'Adds browser-friendly CORS response headers',
    enabled: false,
    config: { allowOrigin: '*', allowMethods: 'GET,POST,PUT,PATCH,DELETE', allowCredentials: false },
    category: 'Transformations',
    scope: 'route',
    source: 'bundled',
    protocols: ['http', 'https'],
  },
]

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Governance Alert',
    message: 'notification-svc is missing an authentication policy.',
    time: '15 min ago',
    read: false,
    href: '/governance',
  },
  {
    id: 'notif-2',
    title: 'Portal Activity',
    message: 'Three new developer applications are waiting for approval.',
    time: '42 min ago',
    read: false,
    href: '/portal',
  },
]

interface StoreCtx {
  toast: Toast
  apis: API[]
  consumers: Consumer[]
  apiPlugins: Record<string, PluginConfig[]>
  pluginTemplates: PluginConfig[]
  notifications: AppNotification[]
  commandPaletteOpen: boolean
  loadingApis: boolean
  loadingConsumers: boolean
  currentTenant: TenantWorkspace
  tenants: TenantWorkspace[]
  currentUser: PlatformUser
  setCurrentRole: (role: UserRole) => void
  setCurrentTenant: (tenantId: string) => void
  setCurrentTenantBySlug: (slug: string) => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
  showToast: (message: string, type?: ToastType) => void
  refreshApis: () => Promise<void>
  refreshConsumers: () => Promise<void>
  addApi: (api: API, plugins?: PluginConfig[]) => Promise<void>
  removeApi: (apiId: string) => Promise<void>
  addConsumer: (consumer: Consumer) => Promise<void>
  updateConsumer: (id: string, patch: Partial<Consumer>) => Promise<void>
  updateApiPlugins: (apiId: string, plugins: PluginConfig[]) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  pushNotification: (notification: Omit<AppNotification, 'id' | 'time' | 'read'> & { time?: string }) => void
}

const Store = createContext<StoreCtx | null>(null)

const DEFAULT_TENANTS: TenantWorkspace[] = [
  { id: 'tenant-acme', slug: 'acme', name: 'Acme Corp', plan: 'Growth' },
  { id: 'tenant-orbit', slug: 'orbit', name: 'Orbit Finance', plan: 'Enterprise' },
  { id: 'tenant-sample', slug: 'sample', name: 'Sample Workspace', plan: 'Starter' },
]

const DEFAULT_USER: PlatformUser = {
  id: 'usr-ava',
  name: 'Ava Kim',
  email: 'ava.kim@mindapi.dev',
  role: 'Owner',
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast>({ message: '', type: 'success', visible: false })
  const [apis, setApis] = useState<API[]>([])
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [pluginTemplates] = useState<PluginConfig[]>(DEFAULT_PLUGIN_SET.map(clonePlugin))
  const [apiPlugins, setApiPlugins] = useState<Record<string, PluginConfig[]>>({})
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [loadingApis, setLoadingApis] = useState(true)
  const [loadingConsumers, setLoadingConsumers] = useState(true)
  const [tenants] = useState<TenantWorkspace[]>(DEFAULT_TENANTS)
  const [currentTenantId, setCurrentTenantId] = useState(DEFAULT_TENANTS[0].id)
  const [currentUser, setCurrentUser] = useState<PlatformUser>(DEFAULT_USER)

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), [])
  const closeCommandPalette = useCallback(() => setCommandPaletteOpen(false), [])

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true })
    setTimeout(() => setToast((current) => ({ ...current, visible: false })), 3000)
  }, [])

  const setCurrentRole = useCallback((role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }))
    showToast(`Role switched to ${role}`, 'info')
  }, [showToast])

  const setCurrentTenant = useCallback((tenantId: string) => {
    setCurrentTenantId(tenantId)
    const tenant = tenants.find((entry) => entry.id === tenantId)
    if (tenant) showToast(`Workspace switched to ${tenant.name}`, 'info')
  }, [showToast, tenants])

  const setCurrentTenantBySlug = useCallback((slug: string) => {
    const tenant = tenants.find((entry) => entry.slug === slug)
    if (!tenant || tenant.id === currentTenantId) return
    setCurrentTenantId(tenant.id)
  }, [currentTenantId, tenants])

  const refreshApis = useCallback(async () => {
    setLoadingApis(true)
    try {
      const data = await fetchJson<API[]>('/api/mock/apis')
      setApis(data)
      setApiPlugins((prev) => {
        const next = { ...prev }
        for (const api of data) {
          if (!next[api.id]) next[api.id] = pluginTemplates.map(clonePlugin)
        }
        return next
      })
    } catch {
      showToast('Could not load APIs from mock API', 'error')
    } finally {
      setLoadingApis(false)
    }
  }, [pluginTemplates, showToast])

  const refreshConsumers = useCallback(async () => {
    setLoadingConsumers(true)
    try {
      const data = await fetchJson<Consumer[]>('/api/mock/consumers')
      setConsumers(data)
    } catch {
      showToast('Could not load consumers from mock API', 'error')
    } finally {
      setLoadingConsumers(false)
    }
  }, [showToast])

  useEffect(() => {
    void refreshApis()
    void refreshConsumers()
  }, [refreshApis, refreshConsumers])

  const pushNotification = useCallback((notification: Omit<AppNotification, 'id' | 'time' | 'read'> & { time?: string }) => {
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: notification.title,
        message: notification.message,
        href: notification.href,
        time: notification.time || 'Just now',
        read: false,
      },
      ...prev,
    ])
  }, [])

  const addApi = useCallback(async (api: API, plugins?: PluginConfig[]) => {
    await fetchJson<API>('/api/mock/apis', { method: 'POST', body: JSON.stringify(api) })
    setApiPlugins((prev) => ({
      ...prev,
      [api.id]: (plugins || pluginTemplates).map(clonePlugin),
    }))
    await refreshApis()
    pushNotification({
      title: 'API Added',
      message: `${api.name} is now available in the catalog.`,
      href: `/apis/${api.id}`,
    })
  }, [pluginTemplates, pushNotification, refreshApis])

  const removeApi = useCallback(async (apiId: string) => {
    await fetchJson<{ ok: true }>(`/api/mock/apis/${apiId}`, { method: 'DELETE' })
    setApiPlugins((prev) => {
      const next = { ...prev }
      delete next[apiId]
      return next
    })
    await refreshApis()
  }, [refreshApis])

  const addConsumer = useCallback(async (consumer: Consumer) => {
    await fetchJson<Consumer>('/api/mock/consumers', { method: 'POST', body: JSON.stringify(consumer) })
    await refreshConsumers()
  }, [refreshConsumers])

  const updateConsumerRecord = useCallback(async (id: string, patch: Partial<Consumer>) => {
    await fetchJson<Consumer>(`/api/mock/consumers/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    await refreshConsumers()
  }, [refreshConsumers])

  const updateApiPlugins = useCallback((apiId: string, plugins: PluginConfig[]) => {
    setApiPlugins((prev) => ({
      ...prev,
      [apiId]: plugins.map(clonePlugin),
    }))
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }, [])

  return (
    <Store.Provider
      value={{
        toast,
        apis,
        consumers,
        apiPlugins,
        pluginTemplates,
        notifications,
        commandPaletteOpen,
        loadingApis,
        loadingConsumers,
        currentTenant: tenants.find((tenant) => tenant.id === currentTenantId) || tenants[0],
        tenants,
        currentUser,
        setCurrentRole,
        setCurrentTenant,
        setCurrentTenantBySlug,
        openCommandPalette,
        closeCommandPalette,
        showToast,
        refreshApis,
        refreshConsumers,
        addApi,
        removeApi,
        addConsumer,
        updateConsumer: updateConsumerRecord,
        updateApiPlugins,
        markNotificationRead,
        markAllNotificationsRead,
        pushNotification,
      }}
    >
      {children}
    </Store.Provider>
  )
}

export function useStore() {
  const ctx = useContext(Store)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
