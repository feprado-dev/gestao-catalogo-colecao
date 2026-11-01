import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Magazine } from '../types'
import { CoverLightbox } from './CoverLightbox'

const make = (id: string, title: string, cover: string | null = `https://x/${id}.png`): Magazine => ({
  id,
  title,
  year: 1999,
  month: 3,
  condition: null,
  acquired: true,
  is_public: true,
  cover_image_url: cover,
})
const a = make('a', 'Edição A')
const b = make('b', 'Edição B')
const semCapa = make('s', 'Sem capa', null)
const c = make('c', 'Edição C')

describe('CoverLightbox', () => {
  it('mostra a capa com legenda e posição', () => {
    render(<CoverLightbox magazine={b} magazines={[a, b, c]} onChange={() => {}} onClose={() => {}} />)
    expect(screen.getByRole('img', { name: 'Capa de Edição B' })).toBeInTheDocument()
    expect(screen.getByText(/Edição B · 03\/1999/)).toBeInTheDocument()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('anda com as setas do teclado e fecha com Esc', async () => {
    const onChange = vi.fn()
    const onClose = vi.fn()
    render(<CoverLightbox magazine={b} magazines={[a, b, c]} onChange={onChange} onClose={onClose} />)
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith(c)
    await userEvent.keyboard('{ArrowLeft}')
    expect(onChange).toHaveBeenLastCalledWith(a)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('pula revistas sem capa e desativa o botão nas pontas', async () => {
    const onChange = vi.fn()
    render(<CoverLightbox magazine={a} magazines={[a, semCapa, c]} onChange={onChange} onClose={() => {}} />)
    expect(screen.getByRole('button', { name: 'Capa anterior' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Próxima capa' }))
    expect(onChange).toHaveBeenCalledWith(c)
  })
})
