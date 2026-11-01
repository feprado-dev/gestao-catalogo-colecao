import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function Home() {
  useDocumentTitle()
  return (
    <section className="hero">
      <p className="hero__eyebrow">Coleção de revistas</p>
      <h1 className="hero__title">Vault Keeper</h1>
      <p className="hero__text">Um catálogo para organizar e preservar a sua coleção, edição por edição.</p>
      <div className="hero__actions">
        {/* Link é o <a> do React Router: navega sem recarregar a página */}
        <Link to="/catalog" className="btn">
          {' '}
          Acessar <span aria-hidden="true"></span>
        </Link>
        <Link to="/public" className="btn">
          Catálogo público
        </Link>
      </div>
    </section>
  )
}
