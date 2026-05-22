export interface NavRoute {
  href: string
  label: string
  caption: string
  keywords: string
  section: 'Operate' | 'Engage' | 'Control'
  requiresManageWorkspace?: boolean
  requiresBilling?: boolean
  sidebarMatch?: string[]
}

export const NAV_ROUTES: NavRoute[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    caption: 'Platform health and metrics',
    keywords: 'overview metrics dashboard',
    section: 'Operate',
    sidebarMatch: ['/dashboard'],
  },
  {
    href: '/apis',
    label: 'API Catalog',
    caption: 'Publish, version, and manage',
    keywords: 'catalog publish gateway apis',
    section: 'Operate',
    sidebarMatch: ['/apis'],
  },
  {
    href: '/analytics',
    label: 'Analytics',
    caption: 'Traffic, errors, and latency',
    keywords: 'charts latency errors traffic analytics',
    section: 'Operate',
    sidebarMatch: ['/analytics', '/logs'],
  },
  {
    href: '/monitoring',
    label: 'Monitoring',
    caption: 'Health, alerts, and uptime',
    keywords: 'health uptime monitoring alerts incidents',
    section: 'Operate',
    sidebarMatch: ['/monitoring'],
  },
  {
    href: '/portal',
    label: 'Developer Portal',
    caption: 'Docs, plans, and webhooks',
    keywords: 'docs plans portal developer webhooks',
    section: 'Engage',
    sidebarMatch: ['/portal'],
  },
  {
    href: '/consumers',
    label: 'Consumers',
    caption: 'Apps, keys, and access',
    keywords: 'apps subscriptions keys consumers',
    section: 'Engage',
    sidebarMatch: ['/consumers'],
  },
  {
    href: '/governance',
    label: 'Governance',
    caption: 'Policies and compliance',
    keywords: 'policies compliance audit controls governance',
    section: 'Control',
    sidebarMatch: ['/governance'],
  },
  {
    href: '/settings',
    label: 'Workspace',
    caption: 'Roles, billing, and settings',
    keywords: 'settings rbac environments workspace billing',
    section: 'Control',
    sidebarMatch: ['/settings'],
    requiresManageWorkspace: true,
  },
]

export const NAV_SECTIONS = ['Operate', 'Engage', 'Control'] as const
