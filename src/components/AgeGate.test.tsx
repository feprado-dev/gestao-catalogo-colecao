import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AgeGate } from './AgeGate'

describe('AgeGate', () => {
  it('aparece na primeira visita e prende o foco no botão de confirmar', () => {
    render(<AgeGate />)
    expect(screen.getByRole('dialog', { name: /18 anos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tenho 18 anos/i })).toHaveFocus()
  })

  it('some e lembra da escolha depois de confirmar', async () => {
    render(<AgeGate />)
    await userEvent.click(screen.getByRole('button', { name: /tenho 18 anos/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem('idade-confirmada')).toBe('sim')
  })

  it('não aparece para quem já confirmou', () => {
    localStorage.setItem('idade-confirmada', 'sim')
    render(<AgeGate />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('o Tab não escapa da janela (volta ao primeiro item)', async () => {
    render(<AgeGate />)
    const confirmar = screen.getByRole('button', { name: /tenho 18 anos/i })
    const sair = screen.getByRole('link', { name: /sair/i })
    await userEvent.tab()
    expect(sair).toHaveFocus()
    await userEvent.tab()
    expect(confirmar).toHaveFocus()
  })
})
