import { useState } from 'react'
import { coverSrcSet } from '../lib/coverImage'

interface CoverImageProps {
  url: string
  alt: string
}

// Capa em miniatura: pede ao navegador o tamanho certo para a tela (srcSet) e,
// se o redimensionador falhar por qualquer motivo, volta sozinha para a imagem original.
export function CoverImage({ url, alt }: CoverImageProps) {
  const [failed, setFailed] = useState(false)
  const { src, srcSet } = coverSrcSet(url, import.meta.env.PROD && !failed)

  return (
    <img
      className="card__cover"
      src={src}
      srcSet={srcSet}
      sizes="(max-width: 820px) 50vw, 25vw"
      width={300}
      height={400} // as capas são 3:4: reserva o espaço e evita o "pulo" do layout
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
