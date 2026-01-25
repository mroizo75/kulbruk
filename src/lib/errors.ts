export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export function sanitizeErrorForClient(error: unknown): { code: string; message: string } {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('ECONNREFUSED')) {
      return {
        code: 'CONNECTION_ERROR',
        message: 'Kunne ikke koble til tjenesten. Prøv igjen senere.',
      }
    }

    if (error.message.includes('timeout')) {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'Forespørselen tok for lang tid. Prøv igjen.',
      }
    }
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'En intern feil oppstod. Prøv igjen senere.',
  }
}

export function logError(error: unknown, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString()
  
  if (error instanceof AppError) {
    console.error(`[${timestamp}] AppError [${error.code}]:`, {
      message: error.message,
      statusCode: error.statusCode,
      ...context,
    })
  } else if (error instanceof Error) {
    console.error(`[${timestamp}] Error:`, {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      ...context,
    })
  } else {
    console.error(`[${timestamp}] Unknown error:`, error, context)
  }
}
