import { defaultFilters, type Filters } from '../lib/filters'

interface CatalogFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
  showStatus?: boolean // "Na coleção / Procurando" só faz sentido na coleção pessoal
}

export function CatalogFilters({ filters, onChange, showStatus = true }: CatalogFiltersProps) {
  // Copia os filtros atuais e troca só o campo que mudou: { ...filters, campo: valor }
  return (
    <div className="filters">
      <input
        type="search"
        aria-label="Buscar por título ou modelo"
        placeholder="Buscar por título ou modelo..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />

      <select
        aria-label="Filtrar por condição"
        value={filters.condition}
        onChange={(e) => onChange({ ...filters, condition: e.target.value as Filters['condition'] })}
      >
        <option value="todas">Todas as condições</option>
        <option value="Excelente">Excelente</option>
        <option value="Bom">Bom</option>
        <option value="Regular">Regular</option>
        <option value="Ruim">Ruim</option>
      </select>

      {showStatus && (
        <select
          aria-label="Filtrar por situação"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as Filters['status'] })}
        >
          <option value="todas">Todas</option>
          <option value="colecao">Na coleção</option>
          <option value="procurando">Procurando</option>
        </select>
      )}

      <select
        aria-label="Ordenar por"
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value as Filters['sort'] })}
      >
        <option value="recentes">Mais recentes adicionadas</option>
        <option value="ano-desc">Ano (novas primeiro)</option>
        <option value="ano-asc">Ano (antigas primeiro)</option>
        <option value="titulo">Título (A-Z)</option>
      </select>

      <button type="button" onClick={() => onChange(defaultFilters)}>
        Limpar
      </button>
    </div>
  )
}
