import { useState } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'

const STORAGE_KEY = 'idade-confirmada'

// localStorage pode lançar erro (navegação anônima, bloqueio de cookies): sempre dentro de try/catch.
function alreadyConfirmed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'sim'
  } catch {
    return false
  }
}

// Aviso de conteúdo adulto na primeira visita. É um AVISO, não uma verificação de idade:
// quem quiser mentir consegue. Serve para deixar claro o tipo de conteúdo e registrar a escolha.
export function AgeGate() {
  const [confirmed, setConfirmed] = useState(alreadyConfirmed) // passar a função (sem chamar) = roda só na 1ª vez

  if (confirmed) return null

  function confirm() {
    try {
      localStorage.setItem(STORAGE_KEY, 'sim')
    } catch {
      /* sem armazenamento: o aviso volta na próxima visita, sem problema */
    }
    setConfirmed(true)
  }

  return <AgeGateBox onConfirm={confirm} />
}

// Separado para o foco do teclado ficar preso aqui dentro enquanto o aviso estiver aberto.
function AgeGateBox({ onConfirm }: { onConfirm: () => void }) {
  const boxRef = useFocusTrap<HTMLDivElement>()

  return (
    <div className="agegate" role="dialog" aria-modal="true" aria-labelledby="agegate-title">
      <div className="agegate__box" ref={boxRef}>
        <p className="eyebrow">Conteúdo adulto</p>
        <h2 id="agegate-title">Você tem 18 anos ou mais?</h2>
        <p className="agegate__text">
          Este site exibe capas de revistas com nudez artística. O acesso é destinado a maiores de 18 anos.
        </p>
        <div className="dialog__actions">
          <button autoFocus onClick={onConfirm}>Tenho 18 anos ou mais</button>
          <a className="btn" href="https://www.google.com">Sair</a>
        </div>
      </div>
    </div>
  )
}
