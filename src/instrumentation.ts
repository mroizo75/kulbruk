import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Capture errors from nested React Server Components
export function onRequestError(
  err: Error,
  request: {
    path: string
    headers: Headers
    method: string
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'
    routePath?: string
  }
) {
  Sentry.captureRequestError(err, {
    request: {
      url: request.path,
      headers: Object.fromEntries(request.headers.entries()),
      method: request.method,
    },
    contexts: {
      nextjs: {
        routerKind: context.routerKind,
        routePath: context.routePath,
      },
    },
  })
}

