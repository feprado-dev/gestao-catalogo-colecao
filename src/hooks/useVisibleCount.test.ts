import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useVisibleCount } from './useVisibleCount'

describe('useVisibleCount', () => {
  it('começa com uma página e cresce a cada "mostrar mais"', () => {
    const { result } = renderHook(() => useVisibleCount('a', 10))
    expect(result.current[0]).toBe(10)
    act(() => result.current[1]())
    expect(result.current[0]).toBe(20)
  })

  it('volta à primeira página quando a chave (filtros) muda', () => {
    const { result, rerender } = renderHook(({ k }) => useVisibleCount(k, 10), { initialProps: { k: 'a' } })
    act(() => result.current[1]())
    expect(result.current[0]).toBe(20)
    rerender({ k: 'b' })
    expect(result.current[0]).toBe(10)
  })
})
