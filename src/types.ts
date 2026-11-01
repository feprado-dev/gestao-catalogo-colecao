// As condições que o usuário pode ESCOLHER (nos filtros e no formulário).
export type Condition = 'Excelente' | 'Bom' | 'Regular' | 'Ruim'

// Descreve o "formato" de uma revista.
// O TypeScript usa isso para avisar se esquecermos um campo ou errarmos um nome.
export interface Magazine {
  id: string
  title: string
  issue?: string | null // número da edição, ex.: "293"
  notes?: string | null // anotações privadas (a view pública não envia este campo)
  year: number | null // null = não sei o ano
  month: number | null // 1 a 12, ou null
  cover_model?: string | null // o "?" significa que o campo é opcional
  condition: Condition | null // null = condição não informada (o acervo importado não tem)
  acquired: boolean
  is_public: boolean // true = aparece no catálogo público
  cover_image_url?: string | null // endereço da imagem da capa (o banco devolve null se não houver)
}
