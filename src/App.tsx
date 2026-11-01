import { lazy, Suspense } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SiteFooter } from './components/SiteFooter'
import { StorageNotice } from './components/StorageNotice'
import { AgeGate } from './components/AgeGate'
import { useTheme } from './hooks/useTheme'
import './App.css'

// Cada tela vira um arquivo separado, baixado só quando a pessoa entra nela.
// Assim a página inicial não carrega o Supabase, o formulário nem os textos legais.
const Catalog = lazy(() => import('./pages/Catalog').then((m) => ({ default: m.Catalog })))
const PublicCatalog = lazy(() => import('./pages/PublicCatalog').then((m) => ({ default: m.PublicCatalog })))
const Privacy = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Privacy })))
const Terms = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Terms })))
const Copyright = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Copyright })))

function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <BrowserRouter>
      <AgeGate />
      {/* Primeiro item ao apertar Tab: pula o menu e vai direto ao conteúdo (teclado e leitores de tela) */}
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <Link to="/" className="brand">
          Vault Keeper
        </Link>
        <nav className="nav" aria-label="Principal">
          {/* "end": sem isto, o link "/" ficaria ativo em TODAS as páginas */}
          <NavLink to="/" end>
            HOME
          </NavLink>
          <NavLink to="/catalog">Minha coleção</NavLink>
          <NavLink to="/public">Catálogo Público</NavLink>
        </nav>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>

      <main id="conteudo" tabIndex={-1}>
        {/* Só UMA destas é desenhada, conforme o endereço do navegador */}
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="container">
                <p className="subtitle">Carregando...</p>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/public" element={<PublicCatalog />} />
              <Route path="/privacidade" element={<Privacy />} />
              <Route path="/termos" element={<Terms />} />
              <Route path="/direitos-autorais" element={<Copyright />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <SiteFooter />
      <StorageNotice />
    </BrowserRouter>
  )
}

export default App
