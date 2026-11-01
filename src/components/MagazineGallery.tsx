import { useEffect, useRef } from 'react'
import type { ViewMode } from '../hooks/useViewMode'

interface MagazineGalleryProps {
  mode: ViewMode
  children: React.ReactNode // os cards
}

export function MagazineGallery({ mode, children }: MagazineGalleryProps) {
  const scroller = useRef<HTMLDivElement>(null)

  // Modo horizontal: a roda do mouse (que gira para cima/baixo) passa a rolar para os lados.
  // Precisa ser um ouvinte "nativo" com passive:false, senão o navegador não deixa cancelar a rolagem normal.
  useEffect(() => {
    const el = scroller.current
    if (!el) return // no modo vertical não há scroller

    function onWheel(event: WheelEvent) {
      if (!el || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return // já é gesto horizontal: deixa quieto
      const max = el.scrollWidth - el.clientWidth
      const next = el.scrollLeft + event.deltaY
      // Chegou numa ponta? Libera a rolagem normal da página, para ninguém ficar "preso".
      if ((next < 0 && el.scrollLeft <= 0) || (next > max && el.scrollLeft >= max)) return
      event.preventDefault()
      el.scrollLeft = Math.max(0, Math.min(max, next))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [mode])

  function scrollByPage(direction: 1 | -1) {
    const el = scroller.current
    if (!el) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  if (mode === 'vertical' || mode === 'mosaico') {
    // Os dois são grades que rolam para baixo: mudam só as classes de CSS (colunas e tamanho das capas).
    return <div className={`gallery gallery--${mode}`}>{children}</div>
  }

  return (
    <div className="gallery gallery--horizontal">
      <div className="gallery__nav">
        <button type="button" aria-label="Voltar" onClick={() => scrollByPage(-1)}>
          ←
        </button>
        <button type="button" aria-label="Avançar" onClick={() => scrollByPage(1)}>
          →
        </button>
      </div>
      {/* tabIndex=0: dá para focar com Tab e rolar com as setas do teclado */}
      <div
        className="gallery__scroller"
        ref={scroller}
        tabIndex={0}
        role="region"
        aria-label="Capas, rolagem horizontal"
      >
        {children}
      </div>
    </div>
  )
}
