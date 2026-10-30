import { useEffect } from 'react'

// Num site de uma página só (SPA) o título da aba não muda sozinho.
// Leitores de tela e o histórico do navegador usam o título para dizer "onde estou".
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · PLAYBOY` : 'PLAYBOY'
  }, [title])
}
