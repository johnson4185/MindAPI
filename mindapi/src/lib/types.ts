export type Environment = 'Production' | 'Staging' | 'Development'
export type APIStatus = 'Active' | 'Draft' | 'Deprecated' | 'Inactive'
export type ConsumerStatus = 'Active' | 'Suspended'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
export type UserRole = 'Owner' | 'Admin' | 'Developer' | 'Viewer' | 'Billing'

export interface API {
  id: string
  name: string
  version: string
  environment: Environment
  owner: string
  status: APIStatus
  requests24h: string
  security: string[]
  updatedAt: string
  description: string
  basePath: string
  backendUrl: string
  tags: string[]
}

export interface Consumer {
  id: string
  name: string
  email: string
  apiKeys: number
  subscribed: number
  requests7d: string
  status: ConsumerStatus
  createdAt: string
}

export interface ConsumerKey {
  id: string
  consumerId: string
  name: string
  value: string
  createdAt: string
  lastUsed: string
  status: 'Active' | 'Revoked'
}

export interface ConsumerSubscription {
  id: string
  consumerId: string
  apiId: string
  apiName: string
  plan: 'Free' | 'Pro' | 'Enterprise' | 'Sandbox'
  status: 'Active' | 'Pending' | 'Suspended'
  quota: string
  used: string
}

export interface LogEntry {
  id: string
  timestamp: string
  api: string
  method: HttpMethod
  path: string
  status: number
  latency: string
  consumer: string
  ip: string
}

export interface GovernancePolicy {
  id: string
  name: string
  description: string
  violations: number
  severity: 'Critical' | 'Warning' | 'Passing'
  compliance: number
  failedApis?: string[]
}

export interface DashboardSnapshot {
  totals: {
    apis: number
    published: number
    drafts: number
    consumers: number
    requests24h: string
  }
  recentApis: API[]
  alerts: Array<{
    id: string
    title: string
    message: string
    severity: 'Critical' | 'Warning' | 'Info'
    href: string
  }>
}

export interface AnalyticsSnapshot {
  totals: {
    requests: string
    errorRate: string
    avgLatency: string
    activeConsumers: number
  }
  apiPerformance: Array<{
    api: string
    requests: string
    errors: string
    latency: string
    consumers: string
  }>
  consumerSegments: Array<{
    segment: string
    share: string
    note: string
  }>
  hourlyTraffic: Array<{
    hour: string
    requests: number
  }>
}

export interface PortalSnapshot {
  plans: Array<{
    name: 'Free' | 'Pro' | 'Enterprise'
    quota: string
    audience: string
    auth: string
    price: string
  }>
  publishedApis: API[]
  recentApps: Array<{
    name: string
    owner: string
    plan: string
    status: 'Active' | 'Sandbox' | 'Pending'
  }>
}

export interface WorkspaceSnapshot {
  roles: Array<{
    role: 'Admin' | 'Developer' | 'Viewer'
    access: string
    seats: number
  }>
  environments: Array<{
    name: Environment
    description: string
    status: 'Protected' | 'Controlled' | 'Open'
  }>
  billing: Array<{
    item: string
    note: string
    value: string
  }>
  currentPlan?: 'Free' | 'Starter' | 'Growth' | 'Enterprise'
  monthlySpend?: string
  projectedOverage?: string
  usage?: {
    apis: { used: number; limit: number | null }
    requests: { used: number; limit: number | null; period: string }
    seats: { used: number; limit: number | null }
  }
  invoices?: Array<{
    id: string
    date: string
    amount: string
    status: 'Paid' | 'Open' | 'Failed'
  }>
}

export interface BillingSnapshot {
  currentPlan: 'Free' | 'Starter' | 'Growth' | 'Enterprise'
  monthlySpend: string
  projectedOverage: string
  usage: {
    apis: { used: number; limit: number | null }
    requests: { used: number; limit: number | null; period: string }
    seats: { used: number; limit: number | null }
  }
  invoices: Array<{
    id: string
    date: string
    amount: string
    status: 'Paid' | 'Open' | 'Failed'
  }>
}

export interface TenantWorkspace {
  id: string
  slug: string
  name: string
  plan: 'Free' | 'Starter' | 'Growth' | 'Enterprise'
}

export interface PlatformUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  secret: string
  status: 'Active' | 'Disabled' | 'Failing'
  lastDelivery: string
  successRate: number
  createdAt: string
}

export interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  url: string
  status: number
  responseTime: string
  timestamp: string
  success: boolean
}

export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: string
  threshold: number
  duration: string
  severity: 'Critical' | 'Warning' | 'Info'
  channels: string[]
  enabled: boolean
  lastTriggered: string | null
}

export interface ServiceHealth {
  id: string
  name: string
  status: 'Healthy' | 'Degraded' | 'Down' | 'Maintenance'
  uptime: string
  latency: string
  lastIncident: string
  region: string
}

export interface MonitoringSnapshot {
  services: ServiceHealth[]
  summary: {
    total: number
    healthy: number
    degraded: number
    down: number
  }
}
