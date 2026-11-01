import { supabase } from './supabase'
import type { Magazine } from '../types'

export type NewMagazine = Omit<Magazine, 'id'>

// Este arquivo é a ÚNICA parte do app que conversa com a tabela "magazines".
// Se um dia trocarmos de banco, só ele muda.
// Cada função lança (throw) o erro se algo falhar: quem chamou decide o que mostrar.

// Só as revistas DO USUÁRIO. Sem o .eq(), a política de leitura pública faria
// as revistas públicas de outras pessoas aparecerem na coleção de quem está logado.
export async function listMyMagazines(userId: string): Promise<Magazine[]> {
  const { data, error } = await supabase
    .from('magazines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }) // mais novas primeiro

  if (error) throw error
  return data
}

export async function addMagazine(magazine: NewMagazine, userId: string): Promise<Magazine> {
  // O banco exige user_id (a regra do RLS confere se é o seu).
  // .select().single() pede de volta a linha criada, já com id gerado pelo banco.
  const { data, error } = await supabase
    .from('magazines')
    .insert({ ...magazine, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

const BUCKET = 'magazine-covers'

// Sobe a imagem para a pasta do usuário e devolve o endereço público dela.
// A pasta TEM de ser o user_id: é o que a regra de segurança do Storage confere.
export async function uploadCover(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}` // nome único: nunca sobrescreve outra capa

  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// A URL pública tem o formato .../object/public/magazine-covers/<caminho>.
// Para APAGAR o arquivo precisamos só do <caminho>, então cortamos o começo.
function pathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`
  const index = url.indexOf(marker)
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length))
}

export async function removeCover(url: string): Promise<void> {
  const path = pathFromUrl(url)
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}

// Atualiza só os campos enviados em "changes" e devolve a linha já atualizada.
export async function updateMagazine(id: string, changes: Partial<NewMagazine>): Promise<Magazine> {
  const { data, error } = await supabase.from('magazines').update(changes).eq('id', id).select().single()

  if (error) throw error
  return data
}

export async function deleteMagazine(magazine: Magazine): Promise<void> {
  const { error } = await supabase.from('magazines').delete().eq('id', magazine.id)
  if (error) throw error

  // Linha apagada com sucesso: agora limpamos a imagem para não deixar lixo no Storage.
  // Se isto falhar, a revista já se foi: não vale a pena mostrar erro por um arquivo órfão.
  if (magazine.cover_image_url) {
    await removeCover(magazine.cover_image_url).catch(() => {})
  }
}

// Para o catálogo público: funciona SEM login, o RLS já limita a is_public = true.
// Lê da VIEW public_magazines, que não expõe user_id nem notas privadas.
// (a view já filtra is_public = true, então não repetimos o filtro aqui)
export async function listPublicMagazines(): Promise<Magazine[]> {
  const { data, error } = await supabase.from('public_magazines').select('*').order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function setMagazinePublic(id: string, isPublic: boolean): Promise<void> {
  const { error } = await supabase.from('magazines').update({ is_public: isPublic }).eq('id', id)
  if (error) throw error
}
