import type { PagesFunction as CloudflarePagesFunction } from '@cloudflare/workers-types'

declare global {
  type PagesFunction<Env = unknown> = CloudflarePagesFunction<Env>
}

export {}
