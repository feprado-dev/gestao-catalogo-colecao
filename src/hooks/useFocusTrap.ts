import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// "Prende" o foco do teclado dentro de uma janela: Tab no último elemento volta ao primeiro
// (e Shift+Tab no primeiro vai ao último). Ao fechar, devolve o foco a quem o tinha antes.
export function useFocusTrap<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    const previouslyFocused = document.activeElement as HTMLElement | null

    function items() {
      return [...container!.querySelectorAll<HTMLElement>(FOCUSABLE)]
    }

    // Se nada dentro da janela recebeu foco sozinho (autoFocus), foca no primeiro item.
    if (!container.contains(document.activeElement)) (items()[0] ?? container).focus()

    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const list = items()
      if (list.length === 0) return event.preventDefault()
      const first = list[0]
      const last = list[list.length - 1]
      const inside = container!.contains(document.activeElement)
      if (event.shiftKey && (!inside || document.activeElement === first)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (!inside || document.activeElement === last)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [])

  return ref
}
