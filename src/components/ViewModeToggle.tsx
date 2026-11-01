import type { ViewMode } from '../hooks/useViewMode'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

// Ícones em SVG: desenhos feitos de linhas, que herdam a cor do texto (currentColor)
// e ficam nítidos em qualquer tamanho. Cada um mostra o que o modo faz.
// O viewBox "0 0 24 24" é a "folha" onde desenhamos, em coordenadas de 0 a 24.
const ICONS: Record<ViewMode, React.ReactNode> = {
  // uma capa alta com setas para cima e para baixo
  vertical: (
    <>
      <rect x="4" y="3" width="11" height="18" rx="1.5" />
      <path d="M19.5 9V4M17.5 6l2-2 2 2" />
      <path d="M19.5 15v5M17.5 18l2 2 2-2" />
    </>
  ),
  // duas capas lado a lado com seta para os dois lados
  horizontal: (
    <>
      <rect x="3" y="3" width="7" height="12" rx="1.5" />
      <rect x="14" y="3" width="7" height="12" rx="1.5" />
      <path d="M4 20h16M7 18l-3 2 3 2M17 18l3 2-3 2" />
    </>
  ),
  // nove quadradinhos: o mosaico
  mosaico: (
    <>
      {[3, 10, 17].flatMap((y) =>
        [3, 10, 17].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="0.8" />),
      )}
    </>
  ),
}

const OPTIONS: { mode: ViewMode; label: string }[] = [
  { mode: 'vertical', label: 'Rolagem vertical' },
  { mode: 'horizontal', label: 'Rolagem horizontal' },
  { mode: 'mosaico', label: 'Mosaico' },
]

// Controle segmentado só com símbolos. Sem texto visível, então o aria-label (leitores de tela)
// e o title (dica ao passar o mouse) são obrigatórios: eles dizem o que cada botão faz.
export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="segmented" role="group" aria-label="Modo de visualização">
      {OPTIONS.map(({ mode: option, label }) => (
        <button
          key={option}
          type="button"
          aria-label={label}
          title={label}
          aria-pressed={mode === option}
          onClick={() => onChange(option)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {ICONS[option]}
          </svg>
        </button>
      ))}
    </div>
  )
}
