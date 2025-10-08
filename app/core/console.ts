import pino from 'pino'

export function initializeConsole(level: 'info' | 'debug' | 'error' = 'info') {
  return pino({
    level,
    transport: process.env.NODE_ENV === 'production' ? undefined : {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'SYS:standard' }
    }
  })
}

