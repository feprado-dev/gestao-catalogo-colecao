import { useEffect, useRef } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import type { Magazine } from '../types'

interface CoverLightboxProps {
  magazine: Magazine // a capa aberta agora
  magazines: Magazine[] // a lista atual (já filtrada), para poder andar entre as capas
  onChange: (magazine: Magazine) => void // pede para mostrar outra capa
  onClose: () => void
}

// Mostra a capa INTEIRA sobre um "vidro" que deixa o mosaico aparecer desfocado atrás.
// Dá para andar para os lados com as setas do teclado, os botões ou deslizando o dedo.
export function CoverLightbox({ magazine, magazines, onChange, onClose }: CoverLightboxProps) {
  // Só as revistas COM capa entram na navegação.
  const dialogRef = useFocusTrap<HTMLDivElement>()
  const withCover = magazines.filter((m) => m.cover_image_url)
  const index = withCover.findIndex((m) => m.id === magazine.id)
  const previous = index > 0 ? withCover[index - 1] : null
  const next = index >= 0 && index < withCover.length - 1 ? withCover[index + 1] : null

  // O ouvinte do teclado precisa enxergar sempre a capa anterior/seguinte ATUAIS.
  // Guardamos tudo num "ref" para ligar o ouvinte uma vez só.
  const latest = useRef({ previous, next, onChange, onClose })
  useEffect(() => {
    latest.current = { previous, next, onChange, onClose }
  })

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const { previous, next, onChange, onClose } = latest.current
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowLeft' && previous) onChange(previous)
      else if (event.key === 'ArrowRight' && next) onChange(next)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Deslizar o dedo no celular: guarda onde o toque começou e compara com onde terminou.
  const touchStartX = useRef<number | null>(null)
  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return
    const distance = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (distance > 50 && previous) onChange(previous)
    if (distance < -50 && next) onChange(next)
  }

  if (!magazine.cover_image_url) return null

  const date = magazine.year
    ? `${magazine.month ? `${String(magazine.month).padStart(2, '0')}/` : ''}${magazine.year}`
    : null
  const caption = [magazine.title, date].filter(Boolean).join(' · ')

  return (
    // Clicar no fundo fecha; clicar na imagem ou nas setas não (não "vazam" o clique).
    <div
      className="lightbox"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Capa de ${magazine.title}`}
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX
      }}
      onTouchEnd={handleTouchEnd}
    >
      {/* autoFocus: o foco do teclado vai para o botão de fechar ao abrir */}
      <button type="button" className="lightbox__close" aria-label="Fechar" autoFocus onClick={onClose}>
        ✕
      </button>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        aria-label="Capa anterior"
        disabled={!previous}
        onClick={(e) => {
          e.stopPropagation()
          if (previous) onChange(previous)
        }}
      >
        ‹
      </button>

      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        <img className="lightbox__img" src={magazine.cover_image_url} alt={`Capa de ${magazine.title}`} />
        <figcaption className="lightbox__caption">
          {caption}{' '}
          <span>
            {index + 1} / {withCover.length}
          </span>
        </figcaption>
      </figure>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        aria-label="Próxima capa"
        disabled={!next}
        onClick={(e) => {
          e.stopPropagation()
          if (next) onChange(next)
        }}
      >
        ›
      </button>

      {/* Baixa em segundo plano a capa vizinha, para a troca ser instantânea. */}
      {next?.cover_image_url && <link rel="preload" as="image" href={next.cover_image_url} />}
    </div>
  )
}
