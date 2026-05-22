import {
  API,
  AlertRule,
  AnalyticsSnapshot,
  BillingSnapshot,
  Consumer,
  ConsumerKey,
  ConsumerSubscription,
  DashboardSnapshot,
  GovernancePolicy,
  LogEntry,
  PortalSnapshot,
  ServiceHealth,
  WebhookDelivery,
  WebhookEndpoint,
  WorkspaceSnapshot,
} from './types'

export const MOCK_APIS: API[] = [
  { id: 'payments-api', name: 'payments-api', version: 'v2.3.1', environment: 'Production', owner: 'Platform Team', status: 'Active', requests24h: '842K', security: ['API Key', 'JWT'], updatedAt: 'Apr 1, 2026', description: 'Payment processing and transaction management', basePath: '/payments/v2', backendUrl: 'https://payments-svc.internal:8080', tags: ['payments', 'finance'] },
  { id: 'user-service', name: 'user-service', version: 'v1.8.0', environment: 'Production', owner: 'Identity Team', status: 'Active', requests24h: '510K', security: ['OAuth 2.0'], updatedAt: 'Apr 1, 2026', description: 'User identity and profile management', basePath: '/users/v1', backendUrl: 'https://users-svc.internal:8080', tags: ['identity', 'users'] },
  { id: 'inventory-api', name: 'inventory-api', version: 'v3.1.0', environment: 'Staging', owner: 'Commerce Team', status: 'Active', requests24h: '214K', security: ['API Key'], updatedAt: 'Mar 31, 2026', description: 'Product inventory and warehouse management', basePath: '/inventory/v3', backendUrl: 'https://inventory-svc.internal:8080', tags: ['commerce', 'inventory'] },
  { id: 'notification-svc', name: 'notification-svc', version: 'v0.9.2', environment: 'Production', owner: 'Platform Team', status: 'Active', requests24h: '89K', security: [], updatedAt: 'Mar 30, 2026', description: 'Multi-channel notification delivery service', basePath: '/notifications/v1', backendUrl: 'https://notif-svc.internal:8080', tags: ['notifications'] },
  { id: 'analytics-api', name: 'analytics-api', version: 'v1.2.0', environment: 'Development', owner: 'Data Team', status: 'Draft', requests24h: '12K', security: [], updatedAt: 'Mar 28, 2026', description: 'Business analytics and reporting endpoints', basePath: '/analytics/v1', backendUrl: 'https://analytics-svc.internal:8080', tags: ['analytics', 'data'] },
]

export const MOCK_CONSUMERS: Consumer[] = [
  { id: 'acme-corp', name: 'Acme Corp', email: 'dev@acme.com', apiKeys: 3, subscribed: 2, requests7d: '1.2M', status: 'Active', createdAt: 'Jan 12, 2024' },
  { id: 'techinnovate', name: 'TechInnovate', email: 'api@techinnovate.io', apiKeys: 1, subscribed: 2, requests7d: '450K', status: 'Active', createdAt: 'Mar 5, 2024' },
  { id: 'megalogistics', name: 'MegaLogistics', email: 'it@megalogistics.net', apiKeys: 2, subscribed: 1, requests7d: '0', status: 'Suspended', createdAt: 'Nov 20, 2023' },
  { id: 'startupco', name: 'StartupCo', email: 'dev@startup.co', apiKeys: 1, subscribed: 1, requests7d: '28K', status: 'Active', createdAt: 'Jun 1, 2024' },
]

export const MOCK_CONSUMER_KEYS: ConsumerKey[] = [
  { id: 'key-1', consumerId: 'acme-corp', name: 'Production Key', value: 'ak_live_acme_prod_123456789', createdAt: 'Jan 12, 2024', lastUsed: '5 min ago', status: 'Active' },
  { id: 'key-2', consumerId: 'acme-corp', name: 'Staging Key', value: 'ak_test_acme_stage_1234567', createdAt: 'Feb 3, 2024', lastUsed: '2 hours ago', status: 'Active' },
  { id: 'key-3', consumerId: 'techinnovate', name: 'Partner Key', value: 'ak_live_tech_123456789012', createdAt: 'Mar 5, 2024', lastUsed: '18 min ago', status: 'Active' },
  { id: 'key-4', consumerId: 'megalogistics', name: 'Legacy Integration', value: 'ak_live_legacy_987654321', createdAt: 'Nov 20, 2023', lastUsed: 'Never', status: 'Revoked' },
]

export const MOCK_SUBSCRIPTIONS: ConsumerSubscription[] = [
  { id: 'sub-1', consumerId: 'acme-corp', apiId: 'payments-api', apiName: 'payments-api', plan: 'Enterprise', status: 'Active', quota: '10M req / month', used: '7.2M' },
  { id: 'sub-2', consumerId: 'acme-corp', apiId: 'user-service', apiName: 'user-service', plan: 'Pro', status: 'Active', quota: '2M req / month', used: '1.1M' },
  { id: 'sub-3', consumerId: 'techinnovate', apiId: 'user-service', apiName: 'user-service', plan: 'Pro', status: 'Active', quota: '2M req / month', used: '640K' },
  { id: 'sub-4', consumerId: 'startupco', apiId: 'analytics-api', apiName: 'analytics-api', plan: 'Sandbox', status: 'Pending', quota: '100K req / month', used: '18K' },
]

export const MOCK_LOGS: LogEntry[] = [
  { id: '1', timestamp: '14:32:01.442', api: 'payments-api', method: 'POST', path: '/payments/v2/charge', status: 201, latency: '142ms', consumer: 'Acme Corp', ip: '10.0.12.45' },
  { id: '2', timestamp: '14:32:00.881', api: 'user-service', method: 'GET', path: '/users/v1/profile/u_8821', status: 200, latency: '38ms', consumer: 'TechInnovate', ip: '10.0.9.12' },
  { id: '3', timestamp: '14:31:59.210', api: 'inventory-api', method: 'GET', path: '/inventory/v3/items/SKU-9921', status: 404, latency: '22ms', consumer: 'StartupCo', ip: '10.0.8.7' },
  { id: '4', timestamp: '14:31:58.004', api: 'payments-api', method: 'POST', path: '/payments/v2/refund', status: 500, latency: '3201ms', consumer: 'Acme Corp', ip: '10.0.12.45' },
  { id: '5', timestamp: '14:31:57.331', api: 'notification-svc', method: 'POST', path: '/notifications/v1/send', status: 429, latency: '8ms', consumer: 'MegaLogistics', ip: '10.0.7.2' },
  { id: '6', timestamp: '14:31:56.112', api: 'user-service', method: 'GET', path: '/users/v1/list', status: 200, latency: '91ms', consumer: 'TechInnovate', ip: '10.0.9.12' },
]

export const MOCK_GOVERNANCE: GovernancePolicy[] = [
  { id: 'auth-required', name: 'Authentication Required', description: 'All production APIs must have at least one authentication plugin enabled.', violations: 2, severity: 'Critical', compliance: 96, failedApis: ['notification-svc', 'analytics-api'] },
  { id: 'rate-limiting', name: 'Rate Limiting Enforced', description: 'Draft and production APIs must expose a quota policy.', violations: 3, severity: 'Warning', compliance: 91, failedApis: ['analytics-api', 'notification-svc', 'inventory-api'] },
  { id: 'observability', name: 'Observability Required', description: 'All APIs must emit metrics and logs.', violations: 0, severity: 'Passing', compliance: 100 },
]

export const MOCK_DASHBOARD: DashboardSnapshot = {
  totals: {
    apis: 42,
    published: 31,
    drafts: 7,
    consumers: 126,
    requests24h: '4.2M',
  },
  recentApis: MOCK_APIS,
  alerts: [
    { id: 'alert-1', title: 'Payments API latency above target', message: 'P95 rose to 482ms after the latest rollout.', severity: 'Critical', href: '/analytics' },
    { id: 'alert-2', title: 'Analytics API still draft-only', message: 'No public docs or consumer plan is attached yet.', severity: 'Warning', href: '/apis/analytics-api' },
    { id: 'alert-3', title: 'Partner traffic trending above plan quota', message: 'Three partner apps may exceed current monthly quota by Friday.', severity: 'Info', href: '/portal' },
  ],
}

export const MOCK_ANALYTICS: AnalyticsSnapshot = {
  totals: {
    requests: '4.2M',
    errorRate: '1.1%',
    avgLatency: '128ms',
    activeConsumers: 126,
  },
  apiPerformance: [
    { api: 'payments-api', requests: '1.8M', errors: '1.2%', latency: '182ms', consumers: '34 apps' },
    { api: 'user-service', requests: '980K', errors: '0.4%', latency: '64ms', consumers: '19 apps' },
    { api: 'inventory-api', requests: '420K', errors: '2.3%', latency: '244ms', consumers: '11 apps' },
  ],
  consumerSegments: [
    { segment: 'Enterprise', share: '54%', note: 'Highest request volume and lowest churn risk' },
    { segment: 'Pro', share: '29%', note: 'Most likely to upgrade based on current traffic' },
    { segment: 'Free', share: '17%', note: 'Strong conversion and abuse-monitoring segment' },
  ],
  hourlyTraffic: Array.from({ length: 24 }, (_, index) => ({
    hour: `${String(index).padStart(2, '0')}:00`,
    requests: [310, 280, 195, 150, 130, 165, 240, 410, 580, 720, 810, 840, 790, 760, 820, 880, 910, 870, 950, 1020, 980, 1100, 1050, 1080][index],
  })),
}

export const MOCK_PORTAL: PortalSnapshot = {
  plans: [
    { name: 'Free', quota: '25K requests / month', audience: 'Evaluation and docs exploration', auth: 'API Key', price: '$0' },
    { name: 'Pro', quota: '2M requests / month', audience: 'Digital product teams', auth: 'API Key + JWT', price: '$499' },
    { name: 'Enterprise', quota: 'Custom quota + support', audience: 'Partners and high-volume integrators', auth: 'OAuth + dedicated keys', price: 'Custom' },
  ],
  publishedApis: MOCK_APIS.filter((api) => api.status === 'Active'),
  recentApps: [
    { name: 'Acme Checkout', owner: 'Acme Corp', plan: 'Enterprise', status: 'Active' },
    { name: 'Growth Sandbox', owner: 'StartupCo', plan: 'Free', status: 'Sandbox' },
    { name: 'Partner Fulfillment', owner: 'Northwind Labs', plan: 'Pro', status: 'Pending' },
  ],
}

export const MOCK_WORKSPACE: WorkspaceSnapshot = {
  roles: [
    { role: 'Admin', access: 'Workspace settings, billing, policies, and environments', seats: 4 },
    { role: 'Developer', access: 'Create APIs, run tests, manage docs and products', seats: 21 },
    { role: 'Viewer', access: 'Read-only analytics, logs, docs, and catalog', seats: 18 },
  ],
  environments: [
    { name: 'Production', description: 'Customer-facing gateway and live plans', status: 'Protected' },
    { name: 'Staging', description: 'Release validation and partner testing', status: 'Controlled' },
    { name: 'Development', description: 'Internal iteration and mock services', status: 'Open' },
  ],
  billing: [
    { item: 'Free plan overage', note: 'Usage threshold messaging only', value: '$0' },
    { item: 'Pro subscriptions', note: 'Recurring monthly contracts', value: '$11,970' },
    { item: 'Enterprise contracts', note: 'Committed annual billing', value: '$84,000 ARR' },
  ],
}

export const PRICING = [
  { name: 'Free', monthly: 0, apiLimit: 3, requests: '100K', seats: 3 },
  { name: 'Starter', monthly: 99, apiLimit: 25, requests: '1M', seats: 10 },
  { name: 'Growth', monthly: 499, apiLimit: 150, requests: '20M', seats: 50 },
  { name: 'Enterprise', monthly: 2500, apiLimit: 'Unlimited', requests: 'Custom', seats: 'Unlimited' },
]

export const MOCK_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'webhook-1',
    name: 'Payment Events',
    url: 'https://hooks.acme.com/payments',
    events: ['payment.completed', 'payment.failed', 'payment.refunded'],
    secret: 'whsec_abc123...',
    status: 'Active',
    lastDelivery: '2 min ago',
    successRate: 99.2,
    createdAt: 'Jan 15, 2024',
  },
  {
    id: 'webhook-2',
    name: 'User Provisioning',
    url: 'https://hooks.techinnovate.io/users',
    events: ['user.created', 'user.updated', 'user.deleted'],
    secret: 'whsec_def456...',
    status: 'Active',
    lastDelivery: '18 min ago',
    successRate: 97.8,
    createdAt: 'Mar 8, 2024',
  },
  {
    id: 'webhook-3',
    name: 'Inventory Alerts',
    url: 'https://hooks.megalogistics.net/stock',
    events: ['stock.low', 'stock.out'],
    secret: 'whsec_ghi789...',
    status: 'Failing',
    lastDelivery: '2 hours ago',
    successRate: 72.4,
    createdAt: 'Nov 22, 2023',
  },
  {
    id: 'webhook-4',
    name: 'Analytics Export',
    url: 'https://hooks.startup.co/reports',
    events: ['report.generated', 'report.failed'],
    secret: 'whsec_jkl012...',
    status: 'Disabled',
    lastDelivery: 'Never',
    successRate: 100,
    createdAt: 'Jun 5, 2024',
  },
]

export const MOCK_WEBHOOK_DELIVERIES: WebhookDelivery[] = [
  { id: 'del-1', webhookId: 'webhook-1', event: 'payment.completed', url: 'https://hooks.acme.com/payments', status: 200, responseTime: '234ms', timestamp: '14:32:01', success: true },
  { id: 'del-2', webhookId: 'webhook-1', event: 'payment.failed', url: 'https://hooks.acme.com/payments', status: 200, responseTime: '187ms', timestamp: '14:28:44', success: true },
  { id: 'del-3', webhookId: 'webhook-3', event: 'stock.low', url: 'https://hooks.megalogistics.net/stock', status: 502, responseTime: '5200ms', timestamp: '12:15:10', success: false },
  { id: 'del-4', webhookId: 'webhook-2', event: 'user.created', url: 'https://hooks.techinnovate.io/users', status: 200, responseTime: '92ms', timestamp: '14:15:03', success: true },
  { id: 'del-5', webhookId: 'webhook-3', event: 'stock.out', url: 'https://hooks.megalogistics.net/stock', status: 504, responseTime: '12001ms', timestamp: '11:48:32', success: false },
]

export const MOCK_ALERT_RULES: AlertRule[] = [
  { id: 'alert-rule-1', name: 'High Error Rate', metric: 'error_rate', condition: '>', threshold: 5, duration: '5m', severity: 'Critical', channels: ['email', 'pagerduty', 'slack'], enabled: true, lastTriggered: '2 hours ago' },
  { id: 'alert-rule-2', name: 'Latency Spike', metric: 'p95_latency', condition: '>', threshold: 500, duration: '10m', severity: 'Warning', channels: ['email', 'slack'], enabled: true, lastTriggered: '1 day ago' },
  { id: 'alert-rule-3', name: 'Traffic Anomaly', metric: 'request_rate', condition: '+/-', threshold: 50, duration: '5m', severity: 'Info', channels: ['slack'], enabled: false, lastTriggered: null },
  { id: 'alert-rule-4', name: 'Quota Exceeded', metric: 'usage_percent', condition: '>', threshold: 90, duration: '1h', severity: 'Warning', channels: ['email'], enabled: true, lastTriggered: '3 days ago' },
]

export const MOCK_SERVICES: ServiceHealth[] = [
  { id: 'svc-payments', name: 'payments-api', status: 'Healthy', uptime: '99.98%', latency: '128ms', lastIncident: '12 days ago', region: 'us-east-1' },
  { id: 'svc-users', name: 'user-service', status: 'Healthy', uptime: '99.99%', latency: '42ms', lastIncident: '34 days ago', region: 'us-east-1' },
  { id: 'svc-inventory', name: 'inventory-api', status: 'Degraded', uptime: '98.72%', latency: '312ms', lastIncident: '2 hours ago', region: 'us-west-2' },
  { id: 'svc-notifications', name: 'notification-svc', status: 'Healthy', uptime: '99.94%', latency: '86ms', lastIncident: '8 days ago', region: 'eu-west-1' },
  { id: 'svc-analytics', name: 'analytics-api', status: 'Maintenance', uptime: '97.12%', latency: '—', lastIncident: 'Ongoing', region: 'us-east-1' },
  { id: 'svc-gateway', name: 'api-gateway', status: 'Healthy', uptime: '99.97%', latency: '12ms', lastIncident: '5 days ago', region: 'global' },
]

export const MOCK_BILLING: BillingSnapshot = {
  currentPlan: 'Growth',
  monthlySpend: '$499.00',
  projectedOverage: '$24.00',
  usage: {
    apis: { used: 68, limit: 150 },
    requests: { used: 13800000, limit: 20000000, period: 'Apr 2026' },
    seats: { used: 27, limit: 50 },
  },
  invoices: [
    { id: 'inv_0426_01', date: 'Apr 01, 2026', amount: '$499.00', status: 'Paid' },
    { id: 'inv_0326_01', date: 'Mar 01, 2026', amount: '$499.00', status: 'Paid' },
    { id: 'inv_0226_01', date: 'Feb 01, 2026', amount: '$499.00', status: 'Paid' },
  ],
}
