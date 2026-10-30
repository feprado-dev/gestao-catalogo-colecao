import { useEffect, useState } from 'react'
import { MagazineCard } from '../components/MagazineCard'
import { CatalogFilters } from '../components/CatalogFilters'
import { MagazineGallery } from '../components/MagazineGallery'
import { CoverLightbox } from '../components/CoverLightbox'
import { ViewModeToggle } from '../components/ViewModeToggle'
import { useViewMode } from '../hooks/useViewMode'
import { listPublicMagazines } from '../lib/magazineService'
import { applyFilters, defaultFilters, type Filters } from '../lib/filters'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import type { Magazine } from '../types'

// Página aberta a qualquer visitante: não usa useSession, não pede login.
export function PublicCatalog() {
  useDocumentTitle('Catálogo público')
  const [magazines, setMagazines] = useState<Magazine[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [viewMode, setViewMode] = useViewMode()
  const [zoomed, setZoomed] = useState<Magazine | null>(null) // capa aberta em tamanho grande
  const visibleMagazines = applyFilters(magazines, filters)

  useEffect(() => {
    listPublicMagazines()
      .then(setMagazines)
      .catch((e: Error) => setError(e.message))
  }, [])

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Acervo aberto</p>
        {/* sr-only: continua invisível na tela, mas leitores de tela têm o título da página */}
        <h1 className="sr-only">Catálogo público</h1>
      </header>

      <p className="subtitle">{visibleMagazines.length} de {magazines.length} revistas públicas</p>
      {error && <p className="form__error">Erro: {error}</p>}
      <div className="toolbar">
        <CatalogFilters filters={filters} onChange={setFilters} showStatus={false} />
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {magazines.length === 0 && !error && <p className="subtitle">Nenhuma revista pública ainda.</p>}

      <MagazineGallery mode={viewMode}>
        {/* sem onDelete nem onTogglePublic: o card aparece só para leitura */}
        {visibleMagazines.map((m) => <MagazineCard key={m.id} magazine={m} onOpenCover={viewMode === 'mosaico' ? setZoomed : undefined} />)}
      </MagazineGallery>

      {zoomed && <CoverLightbox magazine={zoomed} magazines={visibleMagazines} onChange={setZoomed} onClose={() => setZoomed(null)} />}
    </div>
  )
}
