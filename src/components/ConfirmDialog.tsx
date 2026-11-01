import { Modal } from './Modal'

// Uma janela de confirmação reutilizável.
// Ela não sabe NADA sobre revistas: só mostra uma mensagem e dois botões.
interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal onClose={onCancel}>
      <p>{message}</p>
      <div className="dialog__actions">
        <button onClick={onCancel}>Cancelar</button>
        <button className="dialog__danger" onClick={onConfirm}>
          Apagar
        </button>
      </div>
    </Modal>
  )
}
