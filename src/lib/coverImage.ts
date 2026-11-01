// As capas originais têm até 640 kB e o mosaico mostra dezenas de uma vez.
// Em produção, a Vercel redimensiona a imagem na hora (e guarda em cache) pelo endereço
// /_vercel/image. Os tamanhos permitidos ficam em vercel.json ("images.sizes").
// Fora de produção (npm run dev) esse serviço não existe: usamos a imagem original.

export const COVER_WIDTHS = [200, 400, 800] as const

const STORAGE_MARKER = '/storage/v1/object/public/magazine-covers/'

export function optimizedCover(url: string, width: number): string {
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=${width}&q=75`
}

// Só otimiza capas do nosso bucket e só quando "enabled" (produção).
export function coverSrcSet(url: string, enabled: boolean): { src: string; srcSet?: string } {
  if (!enabled || !url.includes(STORAGE_MARKER)) return { src: url }
  return {
    src: optimizedCover(url, 400),
    srcSet: COVER_WIDTHS.map((w) => `${optimizedCover(url, w)} ${w}w`).join(', '),
  }
}
