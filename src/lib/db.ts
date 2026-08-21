import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Build a serverless-safe DATABASE_URL.
 * In Vercel serverless, each function instance handles one request at a time,
 * so a single connection per instance is optimal. This prevents pool exhaustion
 * when Vercel spins up multiple concurrent instances.
 */
function buildDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL || ''
  if (!raw) return raw

  // In production (Vercel), force connection_limit=1 to avoid pool exhaustion
  if (process.env.NODE_ENV === 'production') {
    try {
      const url = new URL(raw)
      // Strip any existing connection_limit or pool_size params
      url.searchParams.delete('connection_limit')
      url.searchParams.delete('pool_size')
      url.searchParams.set('connection_limit', '1')
      return url.toString()
    } catch {
      // If URL parsing fails, append as query param
      const sep = raw.includes('?') ? '&' : '?'
      return raw.replace(/[?&]connection_limit=\d+/, '') + sep + 'connection_limit=1'
    }
  }

  return raw
}

function createPrismaClient() {
  const databaseUrl = buildDatabaseUrl()
  if (!databaseUrl) {
    console.error('[DB] DATABASE_URL is not set!')
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

/**
 * Execute a Prisma query with automatic retry on connection errors.
 * In serverless, connections can drop between warm invocations.
 * This helper transparently reconnects and retries once.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err: any) {
      const isConnectionError =
        err?.code === 'P1001' || // Connection refused
        err?.code === 'P1008' || // Timeout
        err?.code === 'P1009' || // Database already exists (connection reset)
        err?.code === 'P1017' || // Server closed connection
        err?.message?.includes('Connection') ||
        err?.message?.includes('ECONNREFUSED') ||
        err?.message?.includes('ETIMEDOUT') ||
        err?.message?.includes('socket hang up')

      if (isConnectionError && attempt < retries) {
        console.warn(`[DB] Connection error (attempt ${attempt + 1}/${retries + 1}), reconnecting...`, err?.code || err?.message)
        try { await db.$connect() } catch { /* ignore reconnect error, retry will handle it */ }
        continue
      }
      throw err
    }
  }
  throw new Error('withRetry: unexpected fallthrough')
}

// Graceful shutdown in non-serverless environments
if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await db.$disconnect()
  })
}
