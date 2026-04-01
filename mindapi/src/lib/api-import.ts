import { API, HttpMethod } from './types'

export interface ImportedApiOperation {
  id: string
  method: HttpMethod
  path: string
  summary: string
  description?: string
}

export interface ImportedApiCandidate extends API {
  sourceLabel: string
  displayName: string
  operations: ImportedApiOperation[]
  servers: string[]
}

type LooseRecord = Record<string, unknown>

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function asRecord(value: unknown): LooseRecord {
  return value && typeof value === 'object' ? (value as LooseRecord) : {}
}

function asRecordArray(value: unknown): LooseRecord[] {
  return Array.isArray(value) ? value.map((entry) => asRecord(entry)) : []
}

function normalizeMethod(value: string): HttpMethod | null {
  const normalized = value.toUpperCase()
  return HTTP_METHODS.includes(normalized as HttpMethod) ? (normalized as HttpMethod) : null
}

function extractServers(spec: LooseRecord): string[] {
  const serverList = asRecordArray(spec.servers)
    .map((server) => String(server.url || '').trim())
    .filter(Boolean)

  const directUrl = String(spec.url || '').trim()
  if (directUrl) serverList.unshift(directUrl)

  return serverList.filter((value, index, array) => array.indexOf(value) === index)
}

function extractOperationsFromPaths(paths: LooseRecord): ImportedApiOperation[] {
  const operations: ImportedApiOperation[] = []

  for (const [path, node] of Object.entries(paths)) {
    const pathNode = asRecord(node)
    for (const [methodKey, operationNode] of Object.entries(pathNode)) {
      const method = normalizeMethod(methodKey)
      if (!method) continue
      const operation = asRecord(operationNode)
      const summary = String(operation.summary || operation.operationId || `${method} ${path}`)
      operations.push({
        id: `${method.toLowerCase()}-${slugify(path) || 'root'}`,
        method,
        path,
        summary,
        description: String(operation.description || '').trim() || undefined,
      })
    }
  }

  return operations
}

function inferBasePath(backendUrl: string, operations: ImportedApiOperation[]) {
  let basePath = '/imported-api'

  try {
    const parsed = new URL(backendUrl)
    if (parsed.pathname && parsed.pathname !== '/') basePath = parsed.pathname
  } catch {
    if (backendUrl.startsWith('/')) basePath = backendUrl
  }

  if (operations.length > 0) {
    const firstOperation = operations[0].path
    const firstSegment = `/${firstOperation.split('/').filter(Boolean).slice(0, 2).join('/')}`
    if (firstSegment !== '/') basePath = firstSegment
  }

  return basePath
}

function deriveSecurity(spec: LooseRecord) {
  const components = asRecord(spec.components)
  const securitySchemes = asRecord(components.securitySchemes)
  return [
    ...Object.keys(securitySchemes),
    ...asRecordArray(spec.security).flatMap((entry) => Object.keys(entry)),
  ].filter((value, index, array) => value && array.indexOf(value) === index)
}

function extractFromSpec(spec: LooseRecord, index = 0): ImportedApiCandidate {
  const info = asRecord(spec.info)
  const title = String(info.title || spec.name || `Imported API ${index + 1}`)
  const id = slugify(title) || `imported-${Date.now()}-${index}`
  const version = String(info.version || spec.version || 'v1.0.0')
  const description = String(info.description || spec.description || 'Imported from API collection')
  const servers = extractServers(spec)
  const backendUrl = servers[0] || 'https://backend.internal'
  const operations = extractOperationsFromPaths(asRecord(spec.paths))
  const basePath = inferBasePath(backendUrl, operations)
  const security = deriveSecurity(spec)
  const tags = asRecordArray(spec.tags).map((tag) => String(tag.name || '')).filter(Boolean)

  return {
    id,
    name: id,
    displayName: title,
    version,
    environment: 'Development',
    owner: 'Imported API',
    status: 'Draft',
    requests24h: '0',
    security: security.length ? security : ['API Key'],
    updatedAt: 'Just now',
    description,
    basePath,
    backendUrl,
    tags: tags.length ? tags : ['imported'],
    sourceLabel: spec.openapi ? 'OpenAPI' : spec.swagger ? 'Swagger' : spec.item ? 'Collection' : 'Imported',
    operations,
    servers,
  }
}

function extractPostmanCollection(collection: LooseRecord): ImportedApiCandidate[] {
  const info = asRecord(collection.info)
  const collectionName = String(info.name || 'Postman Collection')
  const items = asRecordArray(collection.item)
  const grouped = new Map<string, ImportedApiOperation[]>()

  items.forEach((item, index) => {
    const request = asRecord(item.request)
    const rawMethod = String(request.method || 'GET')
    const method = normalizeMethod(rawMethod) || 'GET'
    const rawUrl = request.url
    const rawUrlRecord = asRecord(rawUrl)
    const resolvedUrl =
      typeof rawUrl === 'string'
        ? rawUrl
        : String(rawUrlRecord.raw || `https://backend.internal/${slugify(String(item.name || `api-${index + 1}`))}`)

    let backendUrl = 'https://backend.internal'
    let path = `/${slugify(String(item.name || `operation-${index + 1}`))}`

    try {
      const parsed = new URL(resolvedUrl)
      backendUrl = `${parsed.protocol}//${parsed.host}`
      path = parsed.pathname || path
    } catch {
      if (resolvedUrl.startsWith('/')) path = resolvedUrl
    }

    const key = backendUrl
    const existing = grouped.get(key) || []
    existing.push({
      id: `${method.toLowerCase()}-${slugify(path) || index.toString()}`,
      method,
      path,
      summary: String(item.name || `${method} ${path}`),
      description: String(request.description || '').trim() || undefined,
    })
    grouped.set(key, existing)
  })

  return Array.from(grouped.entries()).map(([backendUrl, operations], index) => {
    const title = grouped.size === 1 ? collectionName : `${collectionName} ${index + 1}`
    const candidate = extractFromSpec(
      {
        info: { title, version: 'v1.0.0', description: String(info.description || 'Imported from Postman collection') },
        servers: [{ url: backendUrl }],
        paths: operations.reduce<LooseRecord>((acc, operation) => {
          const pathNode = asRecord(acc[operation.path])
          acc[operation.path] = {
            ...pathNode,
            [operation.method.toLowerCase()]: {
              summary: operation.summary,
              description: operation.description,
            },
          }
          return acc
        }, {}),
        tags: [{ name: 'postman' }],
      },
      index,
    )

    return {
      ...candidate,
      sourceLabel: 'Postman Collection',
      operations,
      servers: [backendUrl],
    }
  })
}

export function parseApiCollection(source: string): ImportedApiCandidate[] {
  const input = source.trim()
  if (!input) throw new Error('Paste an OpenAPI or collection document first.')

  try {
    const parsed: unknown = JSON.parse(input)
    if (Array.isArray(parsed)) return parsed.map((entry, index) => extractFromSpec(asRecord(entry), index))
    const parsedRecord = asRecord(parsed)
    if (Array.isArray(parsedRecord.apis)) return asRecordArray(parsedRecord.apis).map((entry, index) => extractFromSpec(entry, index))
    if (Array.isArray(parsedRecord.items)) return asRecordArray(parsedRecord.items).map((entry, index) => extractFromSpec(entry, index))
    if (Array.isArray(parsedRecord.item)) return extractPostmanCollection(parsedRecord)
    return [extractFromSpec(parsedRecord, 0)]
  } catch {
    const title = input.match(/title:\s*(.+)/i)?.[1]?.trim() || input.match(/name:\s*(.+)/i)?.[1]?.trim() || 'Imported API'
    const version = input.match(/version:\s*(.+)/i)?.[1]?.trim() || 'v1.0.0'
    const description = input.match(/description:\s*(.+)/i)?.[1]?.trim() || 'Imported from YAML document'
    const urls = Array.from(input.matchAll(/url:\s*(https?:\/\/[^\s]+)/gi)).map((match) => match[1].trim())
    const backendUrl = urls[0] || 'https://backend.internal'

    const operations: ImportedApiOperation[] = []
    const pathEntries = Array.from(input.matchAll(/^\s{0,4}(\/[A-Za-z0-9/_\-{}]+):\s*$/gm))
    for (const match of pathEntries) {
      const path = match[1]
      const startIndex = match.index ?? 0
      const nextStart = pathEntries.find((entry) => (entry.index ?? 0) > startIndex)?.index ?? input.length
      const block = input.slice(startIndex, nextStart)
      for (const method of HTTP_METHODS) {
        const methodRegex = new RegExp(`^\\s{2,}${method.toLowerCase()}:\\s*$`, 'm')
        if (methodRegex.test(block)) {
          operations.push({
            id: `${method.toLowerCase()}-${slugify(path)}`,
            method,
            path,
            summary: `${method} ${path}`,
          })
        }
      }
    }

    const basePath = inferBasePath(backendUrl, operations)
    return [
      {
        id: slugify(title) || `imported-${Date.now()}`,
        name: slugify(title) || 'imported-api',
        displayName: title,
        version,
        environment: 'Development',
        owner: 'Imported API',
        status: 'Draft',
        requests24h: '0',
        security: ['API Key'],
        updatedAt: 'Just now',
        description,
        basePath,
        backendUrl,
        tags: ['imported'],
        sourceLabel: 'YAML',
        operations,
        servers: urls,
      },
    ]
  }
}
