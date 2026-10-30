import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Só login: o cadastro de novas contas está fechado no Supabase
// (Authentication → Sign In / Providers → "Allow new users to sign up").
// Quem só quer ver o acervo usa o catálogo público, que não precisa de conta.
export function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false) // evita clicar duas vezes enquanto espera

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) setMessage(error.message)
    // Se deu certo não precisamos fazer nada: o useSession percebe sozinho
    // que há uma sessão nova e a tela troca.
    setBusy(false)
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Entrar</h2>

      <label>
        Email
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label>
        Senha
        <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>

      {message && <p className="form__error" role="alert">{message}</p>}

      <button type="submit" disabled={busy}>{busy ? 'Aguarde...' : 'Entrar'}</button>

      {/* LGPD: diz para que serve o dado pedido, no momento em que ele é pedido */}
      <p className="form__note">
        Usamos seu e-mail e senha apenas para autenticar o acesso. Veja a <Link to="/privacidade">Política de Privacidade</Link>.
      </p>
    </form>
  )
}
