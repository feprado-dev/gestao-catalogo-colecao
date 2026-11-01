import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from '../lib/reportError'

// Se algo quebrar durante o desenho de uma tela, o usuário vê esta mensagem em vez de uma página em branco.
// Error boundaries ainda precisam ser classes: não existe versão com hooks.
interface State {
  failed: boolean
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, info)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="container" role="alert">
        <h1>Algo deu errado</h1>
        <p className="subtitle">Não foi possível mostrar esta página.</p>
        <button type="button" onClick={() => window.location.reload()}>
          Recarregar
        </button>
      </div>
    )
  }
}
