import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoadMore } from './LoadMore'

describe('LoadMore', () => {
  it('não aparece quando não sobra nada', () => {
    const { container } = render(<LoadMore remaining={0} onClick={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('mostra quantas faltam e chama onClick', async () => {
    const onClick = vi.fn()
    render(<LoadMore remaining={40} onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: /40 restantes/ }))
    expect(onClick).toHaveBeenCalled()
  })
})
