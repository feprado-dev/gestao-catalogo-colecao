interface LoadMoreProps {
  remaining: number
  onClick: () => void
}

export function LoadMore({ remaining, onClick }: LoadMoreProps) {
  if (remaining <= 0) return null
  return (
    <div className="load-more">
      <button type="button" onClick={onClick}>
        Mostrar mais ({remaining} restantes)
      </button>
    </div>
  )
}
