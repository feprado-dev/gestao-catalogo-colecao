import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { Magazine } from '../types'
import { MagazineForm } from './MagazineForm'

beforeAll(() => {
  // jsdom não implementa estas duas funções
  URL.createObjectURL = vi.fn(() => 'blob:teste')
  URL.revokeObjectURL = vi.fn()
})

const semCondicao: Magazine = {
  id: '1',
  title: 'Edição sem condição',
  issue: null,
  year: 1999,
  month: null,
  condition: null,
  notes: null,
  acquired: true,
  is_public: true,
}

describe('MagazineForm', () => {
  it('REGRESSÃO: editar uma revista sem condição e salvar mantém a condição vazia (não vira "Bom")', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(<MagazineForm initial={semCondicao} onSubmit={onSubmit} />)
    expect(screen.getByLabelText('Condição')).toHaveValue('')
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ condition: null })
  })

  it('envia edição e notas, e transforma campos vazios em null', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(<MagazineForm onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Título'), '  Minha revista ')
    await userEvent.type(screen.getByLabelText(/Edição/), '293')
    await userEvent.type(screen.getByLabelText(/Notas/), 'Capa com dobra')
    await userEvent.selectOptions(screen.getByLabelText('Condição'), 'Regular')
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'Minha revista',
      issue: '293',
      notes: 'Capa com dobra',
      condition: 'Regular',
      year: null,
      month: null,
      cover_model: null,
    })
  })

  it('não envia com o título vazio', async () => {
    const onSubmit = vi.fn()
    render(<MagazineForm onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('recusa arquivo que não é imagem', async () => {
    render(<MagazineForm onSubmit={vi.fn()} />)
    const input = screen.getByLabelText(/Capa \(imagem/) as HTMLInputElement
    const texto = new File(['oi'], 'nota.txt', { type: 'text/plain' })
    await userEvent.upload(input, texto, { applyAccept: false })
    expect(screen.getByText('O arquivo precisa ser uma imagem.')).toBeInTheDocument()
  })
})
