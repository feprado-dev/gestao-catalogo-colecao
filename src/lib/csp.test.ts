import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// O index.html tem um script inline (aplica o tema antes de desenhar a página).
// A CSP do vercel.json só deixa ele rodar pelo hash SHA-256 do conteúdo exato.
// Se alguém editar esse script e esquecer de atualizar o hash, o tema quebra em produção:
// este teste avisa antes.
describe('CSP do vercel.json', () => {
  const raiz = resolve(__dirname, '../..')
  const html = readFileSync(resolve(raiz, 'index.html'), 'utf8')
  const vercel = JSON.parse(readFileSync(resolve(raiz, 'vercel.json'), 'utf8')) as {
    headers: { headers: { key: string; value: string }[] }[]
  }
  const csp = vercel.headers.flatMap((h) => h.headers).find((h) => h.key === 'Content-Security-Policy')?.value

  it('tem uma política de segurança de conteúdo', () => {
    expect(csp).toBeDefined()
  })

  it('libera o script inline do tema pelo hash correto', () => {
    const inline = html.match(/<script>([\s\S]*?)<\/script>/)
    expect(inline).not.toBeNull()
    const hash = createHash('sha256').update(inline![1]).digest('base64')
    expect(csp).toContain(`'sha256-${hash}'`)
  })

  it('não libera scripts inline em geral', () => {
    const scriptSrc = csp!.split(';').find((d) => d.trim().startsWith('script-src'))
    expect(scriptSrc).not.toContain("'unsafe-inline'")
  })

  it('deixa o portfólio mostrar o site numa prévia, e só ele', () => {
    expect(csp).toContain("frame-ancestors 'self' https://felipepradowww.vercel.app")
  })
})
