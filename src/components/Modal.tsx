import { useEffect } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'

interface ModalProps {
  onClose: () => void
  children: React.ReactNode // "children" = o que for escrito ENTRE <Modal> e </Modal>
}

// A moldura de qualquer janela: fundo escuro + caixa centralizada.
// Não sabe o que há dentro: serve para confirmações, formulários, o que vier.
export function Modal({ onClose, children }: ModalProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>() // o Tab não escapa da janela
  // Fecha com a tecla Esc. O useEffect liga o "ouvinte" e a função de retorno o desliga.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose}>
      {/* stopPropagation: clicar na caixa NÃO deve "vazar" para o fundo e fechar */}
      <div className="dialog" role="dialog" aria-modal="true" tabIndex={-1} ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
