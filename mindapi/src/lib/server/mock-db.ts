import 'server-only'

import {
  MOCK_ANALYTICS,
  MOCK_APIS,
  MOCK_CONSUMERS,
  MOCK_CONSUMER_KEYS,
  MOCK_DASHBOARD,
  MOCK_LOGS,
  MOCK_PORTAL,
  MOCK_SUBSCRIPTIONS,
  MOCK_WORKSPACE,
} from '@/lib/mock-data'
import {
  API,
  AnalyticsSnapshot,
  Consumer,
  ConsumerKey,
  ConsumerSubscription,
  DashboardSnapshot,
  LogEntry,
  PortalSnapshot,
  WorkspaceSnapshot,
} from '@/lib/types'

type MockState = {
  apis: API[]
  consumers: Consumer[]
  consumerKeys: ConsumerKey[]
  subscriptions: ConsumerSubscription[]
  logs: LogEntry[]
  analytics: AnalyticsSnapshot
  dashboard: DashboardSnapshot
  portal: PortalSnapshot
  workspace: WorkspaceSnapshot
}

declare global {
  var __mindapiMockState: MockState | undefined
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function seedState(): MockState {
  return {
    apis: clone(MOCK_APIS),
    consumers: clone(MOCK_CONSUMERS),
    consumerKeys: clone(MOCK_CONSUMER_KEYS),
    subscriptions: clone(MOCK_SUBSCRIPTIONS),
    logs: clone(MOCK_LOGS),
    analytics: clone(MOCK_ANALYTICS),
    dashboard: clone(MOCK_DASHBOARD),
    portal: clone(MOCK_PORTAL),
    workspace: clone(MOCK_WORKSPACE),
  }
}

function getState() {
  if (!global.__mindapiMockState) global.__mindapiMockState = seedState()
  return global.__mindapiMockState
}

export function listApis() {
  return getState().apis
}

export function getApi(id: string) {
  return getState().apis.find((api) => api.id === id)
}

export function createApi(api: API) {
  const state = getState()
  state.apis = [api, ...state.apis.filter((item) => item.id !== api.id)]
  state.dashboard.recentApis = state.apis.slice(0, 5)
  state.portal.publishedApis = state.apis.filter((item) => item.status === 'Active')
  return api
}

export function updateApi(id: string, patch: Partial<API>) {
  const state = getState()
  const api = state.apis.find((item) => item.id === id)
  if (!api) return null
  Object.assign(api, patch)
  state.portal.publishedApis = state.apis.filter((item) => item.status === 'Active')
  return api
}

export function deleteApi(id: string) {
  const state = getState()
  const before = state.apis.length
  state.apis = state.apis.filter((api) => api.id !== id)
  state.subscriptions = state.subscriptions.filter((subscription) => subscription.apiId !== id)
  state.portal.publishedApis = state.apis.filter((item) => item.status === 'Active')
  return before !== state.apis.length
}

export function listConsumers() {
  const state = getState()
  return state.consumers.map((consumer) => ({
    ...consumer,
    apiKeys: state.consumerKeys.filter((key) => key.consumerId === consumer.id && key.status === 'Active').length,
    subscribed: state.subscriptions.filter((subscription) => subscription.consumerId === consumer.id && subscription.status !== 'Suspended').length,
  }))
}

export function getConsumer(id: string) {
  return listConsumers().find((consumer) => consumer.id === id)
}

export function createConsumer(consumer: Consumer) {
  const state = getState()
  state.consumers = [consumer, ...state.consumers.filter((item) => item.id !== consumer.id)]
  return consumer
}

export function updateConsumer(id: string, patch: Partial<Consumer>) {
  const state = getState()
  const consumer = state.consumers.find((item) => item.id === id)
  if (!consumer) return null
  Object.assign(consumer, patch)
  return getConsumer(id) || null
}

export function listConsumerKeys(consumerId: string) {
  return getState().consumerKeys.filter((key) => key.consumerId === consumerId)
}

export function createConsumerKey(key: ConsumerKey) {
  const state = getState()
  state.consumerKeys = [key, ...state.consumerKeys]
  return key
}

export function revokeConsumerKey(consumerId: string, keyId: string) {
  const key = getState().consumerKeys.find((item) => item.consumerId === consumerId && item.id === keyId)
  if (!key) return null
  key.status = 'Revoked'
  return key
}

export function listSubscriptions(consumerId?: string) {
  const state = getState()
  return consumerId ? state.subscriptions.filter((subscription) => subscription.consumerId === consumerId) : state.subscriptions
}

export function getDashboardSnapshot() {
  const state = getState()
  return {
    ...state.dashboard,
    totals: {
      ...state.dashboard.totals,
      published: state.apis.filter((api) => api.status === 'Active').length,
      drafts: state.apis.filter((api) => api.status === 'Draft').length,
      consumers: state.consumers.length,
      apis: state.apis.length,
    },
    recentApis: state.apis.slice(0, 5),
  }
}

export function getAnalyticsSnapshot() {
  const state = getState()
  return {
    ...state.analytics,
    totals: {
      ...state.analytics.totals,
      activeConsumers: state.consumers.filter((consumer) => consumer.status === 'Active').length,
    },
  }
}

export function getPortalSnapshot() {
  const state = getState()
  return {
    ...state.portal,
    publishedApis: state.apis.filter((api) => api.status === 'Active'),
  }
}

export function getWorkspaceSnapshot() {
  return getState().workspace
}

export function listLogs() {
  return getState().logs
}
