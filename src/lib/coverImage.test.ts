import { describe, expect, it } from 'vitest'
import { COVER_WIDTHS, coverSrcSet, optimizedCover } from './coverImage'

const URL_OK = 'https://abc.supabase.co/storage/v1/object/public/magazine-covers/u1/a b.png'

describe('coverSrcSet', () => {
  it('fora de produção devolve a imagem original, sem srcSet', () => {
    expect(coverSrcSet(URL_OK, false)).toEqual({ src: URL_OK })
  })

  it('em produção monta um srcSet com todos os tamanhos', () => {
    const { src, srcSet } = coverSrcSet(URL_OK, true)
    expect(src).toBe(optimizedCover(URL_OK, 400))
    for (const w of COVER_WIDTHS) expect(srcSet).toContain(` ${w}w`)
  })

  it('codifica o endereço original (espaços e símbolos) dentro do parâmetro url', () => {
    expect(optimizedCover(URL_OK, 200)).toContain(encodeURIComponent(URL_OK))
  })

  it('não mexe em imagens de fora do bucket de capas', () => {
    const outra = 'https://exemplo.com/foto.png'
    expect(coverSrcSet(outra, true)).toEqual({ src: outra })
  })
})
