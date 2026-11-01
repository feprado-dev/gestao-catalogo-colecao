import type { Condition, Magazine } from '../types'

// Os filtros escolhidos pelo usuário. É SÓ isto que guardamos em estado.
export interface Filters {
  search: string
  condition: 'todas' | Condition
  status: 'todas' | 'colecao' | 'procurando'
  sort: 'recentes' | 'ano-desc' | 'ano-asc' | 'titulo'
}

export const defaultFilters: Filters = { search: '', condition: 'todas', status: 'todas', sort: 'recentes' }

// Remove acentos e põe em minúsculas: "Edição" e "edicao" passam a ser iguais na busca.
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

// FUNÇÃO PURA: mesma entrada → sempre a mesma saída, e não altera nada fora dela.
// Isso a torna fácil de testar (veremos nos testes) e de reaproveitar.
export function applyFilters(magazines: Magazine[], filters: Filters): Magazine[] {
  const term = normalize(filters.search.trim())

  const filtered = magazines.filter((m) => {
    if (filters.condition !== 'todas' && m.condition !== filters.condition) return false
    if (filters.status === 'colecao' && !m.acquired) return false
    if (filters.status === 'procurando' && m.acquired) return false
    if (term === '') return true
    return normalize(`${m.title} ${m.cover_model ?? ''}`).includes(term)
  })

  // .filter() já devolveu uma lista NOVA, então ordenar aqui não mexe na original.
  switch (filters.sort) {
    // "?? 0" e "?? 9999" mandam as revistas sem ano para o fim da lista, nas duas direções.
    case 'ano-desc':
      return filtered.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || (b.month ?? 0) - (a.month ?? 0))
    case 'ano-asc':
      return filtered.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || (a.month ?? 99) - (b.month ?? 99))
    case 'titulo':
      return filtered.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
    default:
      return filtered // 'recentes': mantém a ordem que veio do banco
  }
}
