import { Link } from 'react-router-dom'
import { SITE } from '../config/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <nav aria-label="Informações legais">
        <Link to="/privacidade">Privacidade e cookies</Link>
        <Link to="/termos">Termos de uso</Link>
        <Link to="/direitos-autorais">Direitos autorais</Link>
      </nav>
      <p>
        {SITE.responsible}. Contato: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        Sem vínculo com os titulares da marca e das capas exibidas.
      </p>
    </footer>
  )
}
