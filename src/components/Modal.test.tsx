import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('fecha com Esc', async () => {
    const onClose = vi.fn()
    render(<Modal onClose={onClose}>conteúdo</Modal>)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('fecha ao clicar no fundo, mas não ao clicar dentro da caixa', async () => {
    const onClose = vi.fn()
    const { container } = render(<Modal onClose={onClose}>conteúdo</Modal>)
    await userEvent.click(screen.getByText('conteúdo'))
    expect(onClose).not.toHaveBeenCalled()
    await userEvent.click(container.querySelector('.overlay')!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('mantém o Tab dentro da janela', async () => {
    render(
      <Modal onClose={() => {}}>
        <button>A</button>
        <button>B</button>
      </Modal>,
    )
    expect(screen.getByRole('button', { name: 'A' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'A' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'B' })).toHaveFocus()
  })
})
