import { useEffect, useRef, useState } from 'react'
import { parseCoverFilename } from '../lib/parseCoverFilename'
import { addMagazine, removeCover, uploadCover } from '../lib/magazineService'
import type { Magazine } from '../types'

const MAX_COVER_MB = 5

type Status = 'pendente' | 'enviando' | 'ok' | 'erro' | 'duplicada'

interface Item {
  id: string
  file: File
  preview: string // endereço temporário da imagem, só para mostrar a miniatura
  title: string
  issue: string | null
  year: number | null
  month: number | null
  status: Status
  error?: string
}

const STATUS_LABEL: Record<Status, string> = {
  pendente: 'Pronta',
  enviando: 'Enviando...',
  ok: 'Enviada',
  erro: 'Erro',
  duplicada: 'Já existe',
}

interface BulkImportProps {
  userId: string
  existing: Magazine[] // para detectar edições que já estão cadastradas
  onImported: (created: Magazine[]) => void
}

export function BulkImport({ userId, existing, onImported }: BulkImportProps) {
  const [items, setItems] = useState<Item[]>([])
  const [running, setRunning] = useState(false)
  const [skipped, setSkipped] = useState<string[]>([]) // arquivos recusados na escolha
  const [inputKey, setInputKey] = useState(0)
  const previews = useRef<string[]>([]) // guarda os endereços temporários para liberá-los depois

  // Ao sair da tela, libera a memória das miniaturas.
  useEffect(() => {
    const urls = previews.current
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  function update(id: string, changes: Partial<Item>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)))
  }

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    const refused: string[] = []

    // Edições que já existem no catálogo ou que já apareceram neste mesmo lote.
    const knownIssues = new Set([
      ...existing.map((m) => m.issue).filter(Boolean),
      ...items.map((i) => i.issue).filter(Boolean),
    ])

    const created: Item[] = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        refused.push(`${file.name} (não é imagem)`)
        continue
      }
      if (file.size > MAX_COVER_MB * 1024 * 1024) {
        refused.push(`${file.name} (passa de ${MAX_COVER_MB} MB)`)
        continue
      }

      const parsed = parseCoverFilename(file.name)
      const duplicate = parsed.issue !== null && knownIssues.has(parsed.issue)
      if (parsed.issue) knownIssues.add(parsed.issue)

      const preview = URL.createObjectURL(file)
      previews.current.push(preview)
      created.push({ id: crypto.randomUUID(), file, preview, ...parsed, status: duplicate ? 'duplicada' : 'pendente' })
    }

    setItems([...items, ...created])
    setSkipped(refused)
    setInputKey(inputKey + 1) // zera o campo, para poder escolher os mesmos arquivos de novo se quiser
  }

  function clearAll() {
    previews.current.forEach((url) => URL.revokeObjectURL(url))
    previews.current = []
    setItems([])
    setSkipped([])
  }

  async function runImport() {
    setRunning(true)
    const imported: Magazine[] = []

    // Uma de cada vez (sequencial): mais lento, mas simples de acompanhar e não sobrecarrega o servidor.
    for (const item of items) {
      if (item.status !== 'pendente' && item.status !== 'erro') continue

      update(item.id, { status: 'enviando', error: undefined })
      let coverUrl: string | undefined
      try {
        coverUrl = await uploadCover(item.file, userId) // 1º a imagem...
        const magazine = await addMagazine(
          {
            title: item.title.trim() || 'Sem título',
            issue: item.issue,
            year: item.year,
            month: item.month,
            condition: null,
            cover_model: null,
            acquired: true,
            is_public: true, // revista nova já entra no catálogo público
            cover_image_url: coverUrl,
          },
          userId,
        ) // 2º a linha no banco
        imported.push(magazine)
        update(item.id, { status: 'ok' })
      } catch (e) {
        if (coverUrl) await removeCover(coverUrl).catch(() => {}) // desfaz a imagem órfã
        update(item.id, { status: 'erro', error: (e as Error).message })
      }
    }

    if (imported.length > 0) onImported(imported)
    setRunning(false)
  }

  const pending = items.filter((i) => i.status === 'pendente' || i.status === 'erro').length
  const done = items.filter((i) => i.status === 'ok').length

  return (
    <div className="bulk">
      <label>
        Escolha várias capas (imagens, até {MAX_COVER_MB} MB cada)
        <input
          key={inputKey}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          multiple
          disabled={running}
          onChange={handleFiles}
        />
      </label>
      <p className="card__meta">
        Dica: nomeie assim e o app preenche tudo: <code>99__12__Playboy-No-293-Joana-Prado.jpg</code> (ano, mês, edição
        e nome).
      </p>

      {skipped.length > 0 && <p className="form__error">Não incluídas: {skipped.join('; ')}</p>}

      {items.length > 0 && (
        <>
          <ul className="bulk__list">
            {items.map((item) => (
              <li key={item.id} className={`bulk__row bulk__row--${item.status}`}>
                <img className="bulk__thumb" src={item.preview} alt="" />
                <div className="bulk__fields">
                  <input
                    aria-label={`Título de ${item.file.name}`}
                    value={item.title}
                    disabled={running || item.status === 'ok'}
                    onChange={(e) => update(item.id, { title: e.target.value })}
                  />
                  <span className="card__meta">
                    {[
                      item.issue && `Nº ${item.issue}`,
                      item.year && `${item.month ? `${String(item.month).padStart(2, '0')}/` : ''}${item.year}`,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'sem edição nem data'}
                  </span>
                  {item.error && <span className="form__error">{item.error}</span>}
                </div>
                <span className={item.status === 'erro' ? 'tag tag--accent' : 'tag'}>{STATUS_LABEL[item.status]}</span>
              </li>
            ))}
          </ul>

          <div className="bulk__actions">
            <button type="button" onClick={runImport} disabled={running || pending === 0}>
              {running
                ? `Enviando... (${done}/${items.length})`
                : `Importar ${pending} ${pending === 1 ? 'revista' : 'revistas'}`}
            </button>
            <button type="button" onClick={clearAll} disabled={running}>
              Limpar lista
            </button>
            {items.some((i) => i.status === 'duplicada') && (
              <span className="card__meta">As marcadas como "Já existe" não serão enviadas.</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
