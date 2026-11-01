import { describe, expect, it } from 'vitest'
import { applyFilters, defaultFilters, type Filters } from './filters'
import type { Magazine } from '../types'

// Fábrica de revistas de teste: cada teste só informa o que IMPORTA para ele.
// O resto recebe valores padrão. Assim os testes ficam curtos e fáceis de ler.
function makeMagazine(overrides: Partial<Magazine> = {}): Magazine {
  return {
    id: crypto.randomUUID(),
    title: 'Revista',
    year: 2000,
    month: 1,
    condition: 'Bom',
    acquired: true,
    is_public: false,
    ...overrides,
  }
}

// Atalho: usa os filtros padrão e troca só o que o teste quer.
function filters(overrides: Partial<Filters>): Filters {
  return { ...defaultFilters, ...overrides }
}

const titles = (list: Magazine[]) => list.map((m) => m.title)

describe('applyFilters', () => {
  describe('sem filtros', () => {
    it('devolve todas as revistas, na mesma ordem', () => {
      const list = [makeMagazine({ title: 'A' }), makeMagazine({ title: 'B' })]
      expect(titles(applyFilters(list, defaultFilters))).toEqual(['A', 'B'])
    })

    it('funciona com lista vazia', () => {
      expect(applyFilters([], defaultFilters)).toEqual([])
    })
  })

  describe('busca por texto', () => {
    const list = [
      makeMagazine({ title: 'Edição de Verão', cover_model: 'Ana Souza' }),
      makeMagazine({ title: 'Especial de Inverno', cover_model: null }),
    ]

    it('encontra pelo título', () => {
      expect(titles(applyFilters(list, filters({ search: 'verão' })))).toEqual(['Edição de Verão'])
    })

    it('ignora acentos e maiúsculas', () => {
      expect(titles(applyFilters(list, filters({ search: 'EDICAO' })))).toEqual(['Edição de Verão'])
    })

    it('encontra pelo modelo da capa', () => {
      expect(titles(applyFilters(list, filters({ search: 'souza' })))).toEqual(['Edição de Verão'])
    })

    it('não quebra quando o modelo da capa é null', () => {
      expect(applyFilters(list, filters({ search: 'inverno' }))).toHaveLength(1)
    })

    it('ignora espaços nas pontas', () => {
      expect(applyFilters(list, filters({ search: '  verão  ' }))).toHaveLength(1)
    })

    it('devolve vazio quando nada combina', () => {
      expect(applyFilters(list, filters({ search: 'xyz' }))).toEqual([])
    })
  })

  describe('filtro de condição', () => {
    it('mantém só a condição escolhida', () => {
      const list = [
        makeMagazine({ title: 'A', condition: 'Excelente' }),
        makeMagazine({ title: 'B', condition: 'Ruim' }),
      ]
      expect(titles(applyFilters(list, filters({ condition: 'Ruim' })))).toEqual(['B'])
    })
  })

  describe('filtro de status', () => {
    const list = [makeMagazine({ title: 'Tenho', acquired: true }), makeMagazine({ title: 'Procuro', acquired: false })]

    it('"colecao" mostra só as que eu tenho', () => {
      expect(titles(applyFilters(list, filters({ status: 'colecao' })))).toEqual(['Tenho'])
    })

    it('"procurando" mostra só as que faltam', () => {
      expect(titles(applyFilters(list, filters({ status: 'procurando' })))).toEqual(['Procuro'])
    })
  })

  describe('filtros combinados', () => {
    it('aplica todos ao mesmo tempo (E, não OU)', () => {
      const list = [
        makeMagazine({ title: 'Verão Bom', condition: 'Bom', acquired: true }),
        makeMagazine({ title: 'Verão Ruim', condition: 'Ruim', acquired: true }),
        makeMagazine({ title: 'Inverno Bom', condition: 'Bom', acquired: true }),
      ]
      const result = applyFilters(list, filters({ search: 'verão', condition: 'Bom' }))
      expect(titles(result)).toEqual(['Verão Bom'])
    })
  })

  describe('ordenação', () => {
    const list = [
      makeMagazine({ title: 'Banana', year: 1990, month: 5 }),
      makeMagazine({ title: 'Abacaxi', year: 2010, month: 2 }),
      makeMagazine({ title: 'Cereja', year: 1990, month: 11 }),
    ]

    it('por ano, mais novas primeiro', () => {
      expect(titles(applyFilters(list, filters({ sort: 'ano-desc' })))).toEqual(['Abacaxi', 'Cereja', 'Banana'])
    })

    it('por ano, mais antigas primeiro; no mesmo ano, desempata pelo mês', () => {
      expect(titles(applyFilters(list, filters({ sort: 'ano-asc' })))).toEqual(['Banana', 'Cereja', 'Abacaxi'])
    })

    it('por título, em ordem alfabética', () => {
      expect(titles(applyFilters(list, filters({ sort: 'titulo' })))).toEqual(['Abacaxi', 'Banana', 'Cereja'])
    })

    it('ordena títulos com acento corretamente (pt-BR)', () => {
      const accents = [
        makeMagazine({ title: 'Zebra' }),
        makeMagazine({ title: 'Édice' }),
        makeMagazine({ title: 'Ave' }),
      ]
      expect(titles(applyFilters(accents, filters({ sort: 'titulo' })))).toEqual(['Ave', 'Édice', 'Zebra'])
    })
  })

  describe('revistas sem ano', () => {
    const list = [
      makeMagazine({ title: 'Sem ano', year: null, month: null }),
      makeMagazine({ title: 'Antiga', year: 1990, month: 3 }),
      makeMagazine({ title: 'Nova', year: 2010, month: 6 }),
    ]

    it('vão para o fim ao ordenar por ano, mais novas primeiro', () => {
      expect(titles(applyFilters(list, filters({ sort: 'ano-desc' })))).toEqual(['Nova', 'Antiga', 'Sem ano'])
    })

    it('vão para o fim também ao ordenar por ano, mais antigas primeiro', () => {
      expect(titles(applyFilters(list, filters({ sort: 'ano-asc' })))).toEqual(['Antiga', 'Nova', 'Sem ano'])
    })
  })

  describe('imutabilidade', () => {
    it('não altera a lista original ao ordenar', () => {
      const list = [makeMagazine({ title: 'B', year: 2000 }), makeMagazine({ title: 'A', year: 1990 })]
      const before = titles(list)

      applyFilters(list, filters({ sort: 'ano-asc' }))

      expect(titles(list)).toEqual(before) // continua B, A
    })
  })
})
