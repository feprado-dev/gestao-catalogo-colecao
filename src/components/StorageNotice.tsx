import { useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'aviso-armazenamento'

function alreadySeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'sim'
  } catch {
    return false
  }
}

// Aviso informativo: o site NÃO usa cookies de publicidade nem de rastreamento.
// Só guarda no navegador o que faz o site funcionar (tema, modo de visualização, confirmação de idade, login do dono).
// Como não há o que aceitar ou recusar, o botão apenas dispensa o aviso.
export function StorageNotice() {
  const [seen, setSeen] = useState(alreadySeen)
  if (seen) return null

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, 'sim')
    } catch {
      /* sem armazenamento: o aviso volta na próxima visita */
    }
    setSeen(true)
  }

  return (
    <div className="storage-notice" role="region" aria-label="Aviso sobre dados no navegador">
      <p>
        Este site não usa cookies de publicidade nem de rastreamento. Guardamos apenas preferências essenciais
        (tema, modo de visualização, confirmação de idade). <Link to="/privacidade">Saiba mais</Link>.
      </p>
      <button type="button" onClick={dismiss}>Entendi</button>
    </div>
  )
}
