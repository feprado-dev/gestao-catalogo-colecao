import { useState } from 'react'

// Mostra a lista aos poucos ("Mostrar mais") em vez de desenhar centenas de cards de uma vez.
// Quando "resetKey" muda (por exemplo, os filtros), volta para a primeira página.
export function useVisibleCount(resetKey: unknown, pageSize = 24) {
  const [state, setState] = useState({ key: resetKey, count: pageSize })
  let count = state.count

  // Ajuste de estado durante o desenho: padrão recomendado pelo React no lugar de um useEffect.
  if (state.key !== resetKey) {
    setState({ key: resetKey, count: pageSize })
    count = pageSize
  }

  const showMore = () => setState((s) => ({ ...s, count: s.count + pageSize }))
  return [count, showMore] as const
}
