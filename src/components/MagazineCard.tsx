import type { Magazine } from '../types'
import { CoverImage } from './CoverImage'

// "Props" são os dados que o componente recebe de fora.
// Aqui, cada card recebe UMA revista e só se preocupa em mostrá-la.
interface MagazineCardProps {
  magazine: Magazine
  // Opcionais: no catálogo público o visitante só LÊ, então não passamos as ações.
  onDelete?: (id: string) => void
  onEdit?: (magazine: Magazine) => void
  onTogglePublic?: (magazine: Magazine) => void
  // Se vier, clicar na capa chama esta função (usada no mosaico para abrir a foto inteira).
  onOpenCover?: (magazine: Magazine) => void
}

export function MagazineCard({ magazine, onDelete, onEdit, onTogglePublic, onOpenCover }: MagazineCardProps) {
  const isOwnerView = Boolean(onTogglePublic || onEdit || onDelete)

  const date = magazine.year
    ? `${magazine.month ? `${String(magazine.month).padStart(2, '0')}/` : ''}${magazine.year}`
    : null
  const meta = [magazine.issue && `Nº ${magazine.issue}`, date].filter(Boolean).join(' · ')

  return (
    <article className={magazine.acquired ? 'card' : 'card card--missing'}>
      <div className="card__media">
        {magazine.cover_image_url ? (
          // CoverImage: tamanho certo por tela + loading="lazy" (só baixa quando está perto de aparecer)
          onOpenCover ? (
            // <button>: dá para focar com Tab e abrir com Enter, não só com o mouse
            <button
              type="button"
              className="card__zoom"
              aria-label={`Ver a capa inteira de ${magazine.title}`}
              onClick={() => onOpenCover(magazine)}
            >
              <CoverImage url={magazine.cover_image_url} alt="" />
            </button>
          ) : (
            <CoverImage url={magazine.cover_image_url} alt={`Capa de ${magazine.title}`} />
          )
        ) : (
          <div className="card__placeholder">Sem capa</div>
        )}
      </div>

      <div className="card__info">
        <h2 className="card__title">{magazine.title}</h2>
        {meta && <p className="card__meta">{meta}</p>}
        {magazine.cover_model && <p className="card__meta">Capa: {magazine.cover_model}</p>}
        {magazine.condition && <p className="card__meta">Condição: {magazine.condition}</p>}

        {/* Só mostra etiqueta quando ela INFORMA algo: "Procurando" e, para o dono, "Pública". */}
        {(!magazine.acquired || (isOwnerView && magazine.is_public)) && (
          <p className="card__tags">
            {!magazine.acquired && <span className="tag">Procurando</span>}
            {isOwnerView && magazine.is_public && <span className="tag tag--accent">Pública</span>}
          </p>
        )}

        {isOwnerView && (
          <div className="card__actions">
            {onTogglePublic && (
              <button onClick={() => onTogglePublic(magazine)}>
                {magazine.is_public ? 'Tornar privada' : 'Tornar pública'}
              </button>
            )}
            {onEdit && <button onClick={() => onEdit(magazine)}>Editar</button>}
            {onDelete && (
              <button className="btn--danger" onClick={() => onDelete(magazine.id)}>
                Deletar
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
