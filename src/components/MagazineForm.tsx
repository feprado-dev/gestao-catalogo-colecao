import { useEffect, useRef, useState } from 'react'
import type { Condition, Magazine } from '../types'
import type { NewMagazine } from '../lib/magazineService'

const MAX_COVER_MB = 5
const COVER_TYPES = 'image/png,image/jpeg,image/webp,image/avif' // os mesmos tipos aceitos pelo bucket

interface MagazineFormProps {
  // O formulário não sabe SALVAR. Ele só avisa o pai: "o usuário quer adicionar isto".
  // Devolve uma Promise<boolean>: true = salvou (podemos limpar os campos), false = falhou.
  onSubmit: (magazine: NewMagazine, cover: File | null) => Promise<boolean>
  // Se vier uma revista, o formulário está em modo EDIÇÃO (campos já preenchidos).
  initial?: Magazine
  onCancel?: () => void
}

const conditions: Condition[] = ['Excelente', 'Bom', 'Regular', 'Ruim']

export function MagazineForm({ onSubmit, initial, onCancel }: MagazineFormProps) {
  // Cada campo do formulário é um estado: quando muda, a tela é redesenhada.
  const [title, setTitle] = useState(initial?.title ?? '')
  const [year, setYear] = useState(initial?.year?.toString() ?? '')
  const [month, setMonth] = useState(initial?.month?.toString() ?? '')
  const [coverModel, setCoverModel] = useState(initial?.cover_model ?? '')
  const [issue, setIssue] = useState(initial?.issue ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  // '' = condição não informada. Antes, abrir uma revista sem condição e salvar gravava 'Bom' sem ninguém pedir.
  const [condition, setCondition] = useState<Condition | ''>(initial?.condition ?? '')
  const [acquired, setAcquired] = useState(initial?.acquired ?? true)
  const [isPublic, setIsPublic] = useState(initial?.is_public ?? true) // revista nova já entra no catálogo público
  const [cover, setCover] = useState<File | null>(null)
  const [coverError, setCoverError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0) // trocar a key "zera" o campo de arquivo
  const [saving, setSaving] = useState(false)

  // Endereço temporário para mostrar a imagem escolhida ANTES de enviar.
  // Fica num ref para podermos liberá-lo (revokeObjectURL) ao trocar de imagem e ao sair da tela.
  const previewUrl = useRef<string | null>(null)

  function pickCover(file: File | null) {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    previewUrl.current = file ? URL.createObjectURL(file) : null
    setCover(file)
    setPreview(previewUrl.current)
  }

  useEffect(() => {
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    }
  }, [])

  function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setCoverError(null)

    // Validação no navegador: dá resposta rápida, mas NÃO é segurança (o usuário pode burlar).
    if (file && !file.type.startsWith('image/')) {
      setCoverError('O arquivo precisa ser uma imagem.')
      pickCover(null)
      return
    }
    if (file && file.size > MAX_COVER_MB * 1024 * 1024) {
      setCoverError(`A imagem passa de ${MAX_COVER_MB} MB.`)
      pickCover(null)
      return
    }
    pickCover(file)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault() // impede o navegador de recarregar a página

    if (title.trim() === '') return // não aceita título vazio

    setSaving(true)
    const saved = await onSubmit(
      {
        title: title.trim(),
        // Campo vazio vira null ("não sei"); caso contrário, o número digitado.
        year: year === '' ? null : Number(year),
        month: month === '' ? null : Number(month),
        // null (e não undefined) para o banco LIMPAR o campo ao editar:
        // undefined some do envio, e o valor antigo ficaria no banco.
        cover_model: coverModel.trim() || null,
        issue: issue.trim() || null,
        notes: notes.trim() || null,
        condition: condition || null,
        acquired,
        is_public: isPublic,
      },
      cover,
    )
    setSaving(false)

    if (saved && !initial) {
      // limpa os campos para o próximo cadastro (se falhou, mantém: nada se perde)
      setTitle('')
      setIssue('')
      setNotes('')
      setCoverModel('')
      pickCover(null)
      setFileInputKey(fileInputKey + 1)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{initial ? 'Editar revista' : 'Nova revista'}</h2>

      <label>
        Título
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label>
        Edição (opcional)
        <input value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="ex.: 293" />
      </label>

      <div className="form__row">
        <label>
          Mês (opcional)
          <input type="number" min={1} max={12} value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
        <label>
          Ano (opcional)
          <input type="number" min={1953} max={2100} value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
      </div>

      <label>
        Modelo da capa (opcional)
        <input value={coverModel} onChange={(e) => setCoverModel(e.target.value)} />
      </label>

      <label>
        Capa (imagem, até {MAX_COVER_MB} MB)
        <input key={fileInputKey} type="file" accept={COVER_TYPES} onChange={handleCoverChange} />
      </label>
      {coverError && <p className="form__error">{coverError}</p>}
      {(preview ?? initial?.cover_image_url) && (
        <img className="form__preview" src={preview ?? initial?.cover_image_url ?? undefined} alt="Prévia da capa" />
      )}

      <label>
        Condição
        <select value={condition} onChange={(e) => setCondition(e.target.value as Condition | '')}>
          <option value="">Não informada</option>
          {conditions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        Notas (opcional, privadas)
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <label className="form__check">
        <input type="checkbox" checked={acquired} onChange={(e) => setAcquired(e.target.checked)} />
        Já tenho esta revista
      </label>

      <label className="form__check">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
        Mostrar no catálogo público (visível para qualquer pessoa)
      </label>

      <button type="submit" disabled={saving}>
        {saving ? 'Salvando...' : initial ? 'Salvar' : 'Adicionar'}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      )}
    </form>
  )
}
