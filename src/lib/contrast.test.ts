// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Lê as cores direto do index.css e confere o contraste mínimo de texto do WCAG AA (4,5:1).
// Se alguém trocar uma cor e piorar a legibilidade, este teste falha.
const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8')

function tokens(selector: string): Record<string, string> {
  const block = css.split(selector)[1].split('}')[0]
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]))
}

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const themes = { escuro: tokens(':root {'), claro: tokens(":root[data-theme='light'] {") }

describe.each(Object.entries(themes))('tema %s', (_name, t) => {
  for (const fg of ['text', 'muted', 'accent', 'danger-text']) {
    for (const bg of ['bg', 'surface', 'surface-2']) {
      it(`${fg} sobre ${bg} tem contraste mínimo de 4,5:1`, () => {
        expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
