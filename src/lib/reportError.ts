import type { ErrorInfo } from 'react'

// Ponto único para ligar um serviço de monitoramento (Sentry etc.) no futuro.
export function reportError(error: Error, info?: ErrorInfo) {
  console.error('Erro na interface:', error, info?.componentStack)
}
