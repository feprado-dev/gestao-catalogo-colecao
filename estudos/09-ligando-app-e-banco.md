# 09. Ligando o app ao banco

## Objetivo
Entender, linha por linha, como o frontend conversa com o Supabase: o cliente, a camada de serviço, o CRUD, o
tratamento de erros, o upload de imagens e, principalmente, **como manter tudo consistente quando duas operações
precisam andar juntas**.

---

## 1. O cliente do Supabase

📁 `src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('Faltam VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY no .env.local')
}

export const supabase = createClient(url, key)
```

`createClient` devolve **um objeto** com tudo que o app precisa: `supabase.auth` (login), `supabase.from(...)`
(tabelas), `supabase.storage` (arquivos). Criamos **um só**, no app inteiro, e todo mundo o importa.

Por que um só? Cada cliente guarda a sessão do usuário. Dois clientes "não se conheceriam".

---

## 2. A forma de toda resposta: `{ data, error }`

O `supabase-js` **não lança erro** quando o banco recusa algo. Ele devolve um objeto com **dois campos**, e
você decide:

```ts
const { data, error } = await supabase.from('magazines').select('*')

if (error) { /* deu errado: error.message explica */ }
else       { /* deu certo: data tem o resultado */ }
```

Memorize o padrão: **depois de todo `await` do Supabase, olhe o `error` primeiro.**

---

## 3. A camada de serviço: `magazineService.ts`

📁 `src/lib/magazineService.ts` é **o único arquivo** que conversa com a tabela `magazines` e com o bucket.

Por que concentrar tudo ali?
- **Trocar de banco** mexe em um arquivo só.
- As telas ficam **limpas**: chamam `addMagazine(...)`, sem saber **como** isso é feito.
- Fica fácil achar "onde isso acontece?".

### O padrão das funções do serviço
```ts
export async function listMyMagazines(userId: string): Promise<Magazine[]> {
  const { data, error } = await supabase
    .from('magazines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error      // ← converte "erro devolvido" em "erro lançado"
  return data
}
```

**Convertemos o `error` devolvido em `throw`.** Resultado: quem chama usa o `try/catch` normal, e o serviço
**não decide** o que mostrar ao usuário. Cada camada faz uma coisa:

| Camada | Responsabilidade |
|---|---|
| `magazineService.ts` | Falar com o banco; lançar erro se falhar |
| `Catalog.tsx` | Capturar o erro e decidir o que mostrar (`setError(...)`) |

### A cadeia de métodos (*query builder*)
```ts
supabase
  .from('magazines')          // qual tabela
  .select('*')                // quais colunas (* = todas)
  .eq('user_id', userId)      // WHERE user_id = userId
  .order('created_at', { ascending: false })   // ORDER BY created_at DESC
```
É SQL escrito como chamadas de função.

| Método | SQL |
|---|---|
| `.eq(col, v)` | `where col = v` |
| `.select()` | `select` |
| `.insert({...})` | `insert` |
| `.update({...})` | `update ... set` |
| `.delete()` | `delete` |
| `.order(col, {ascending})` | `order by` |
| `.single()` | "espero **exatamente uma** linha" |

### `insert(...).select().single()`
```ts
.insert({ ...magazine, user_id: userId })
.select()          // devolva a linha que acabou de criar
.single()          // como UM objeto, não uma lista de um item
```
O `insert` sozinho não devolve a linha. Com `.select()`, ela volta **já com o `id`** que o banco gerou, o que
precisamos para colocar o card novo na tela.

### Por que `listMyMagazines` filtra com `.eq('user_id', userId)` se o RLS já protege?
Nesse momento da história, o RLS deixava o visitante ler **as públicas de qualquer um**. Um usuário logado
leria as **suas** *mais* as públicas dos outros, e a "Minha coleção" ia misturar revistas alheias. **O RLS decide
o que *pode* ser lido; o filtro decide o que *você quer* ver.** As duas camadas se complementam. Hoje, com a
política pública removida, o filtro continua sendo uma boa defesa em profundidade.

---

## 4. O fluxo de uma tela: carregar dados

📁 `Catalog.tsx`:
```tsx
const [magazines, setMagazines] = useState<Magazine[]>([])
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  if (!userId) { setMagazines([]); return }
  let cancelled = false
  listMyMagazines(userId)
    .then((data) => { if (!cancelled) setMagazines(data) })
    .catch((e: Error) => { if (!cancelled) setError(e.message) })
  return () => { cancelled = true }
}, [userId])
```

Leia como uma história:
1. **Sem usuário?** Limpa a lista e sai.
2. **Com usuário:** pede as revistas ao serviço.
3. **Chegou?** Guarda no estado (a tela redesenha com os cards).
4. **Falhou?** Guarda a mensagem de erro (a tela mostra em vermelho).
5. **Saiu da tela antes de chegar?** O `cancelled` descarta a resposta atrasada (capítulo 05).

### Os três estados de qualquer tela que carrega dados
Toda tela que busca dados precisa tratar **três** situações, não só o "deu certo":

| Estado | No projeto |
|---|---|
| **Carregando** | `useSession` tem `loading`; `Catalog` mostra "Carregando..." |
| **Erro** | `error` vira `<p className="form__error">` |
| **Vazio / sucesso** | Lista vazia mostra uma mensagem; senão, os cards |

> Um app amador só trata o sucesso. Um app profissional trata os três.

---

## 5. A regra "espere o banco antes de mudar a tela"

📁 `Catalog.tsx`:
```tsx
async function confirmDelete() {
  if (!pendingMagazine) return
  try {
    setError(null)
    await deleteMagazine(pendingMagazine)                           // 1º o banco confirma
    setMagazines(magazines.filter((m) => m.id !== pendingDeleteId)) // 2º só então a tela muda
  } catch (e) {
    setError((e as Error).message)                                  // se falhou, a tela NÃO mudou
  }
  setPendingDeleteId(null)
}
```

Se o `await` falhar, o código **pula** para o `catch`, e o `setMagazines` **nunca roda**. A revista continua
na tela, porque continua no banco. **A tela nunca mente sobre o que está salvo.**

### O contrário: "atualização otimista"
Há outra filosofia: mudar a tela **imediatamente** e desfazer se o banco recusar. Dá sensação de velocidade, mas
é mais complexa (você precisa desfazer, tratar falhas, sincronizar). Para um app pequeno, a abordagem simples
(esperar) é mais segura e fácil de manter. Conhecer as duas é parte de saber escolher.

---

## 6. ⭐ Duas operações que precisam andar juntas: upload + gravação

Adicionar uma revista com capa são **dois passos em lugares diferentes**:
1. Enviar a imagem ao **Storage**;
2. Gravar a linha no **Postgres** com o endereço dessa imagem.

📁 `Catalog.tsx`:
```tsx
async function handleAdd(newMagazine: NewMagazine, cover: File | null): Promise<boolean> {
  if (!userId) return false
  let coverUrl: string | undefined
  try {
    setError(null)
    if (cover) coverUrl = await uploadCover(cover, userId)                                   // 1º a imagem...
    const created = await addMagazine({ ...newMagazine, cover_image_url: coverUrl }, userId) // 2º a linha
    setMagazines([created, ...magazines])
    return true
  } catch (e) {
    // Se a imagem subiu mas a linha falhou, a imagem ficaria órfã: desfazemos.
    if (coverUrl) await removeCover(coverUrl).catch(() => {})
    setError((e as Error).message)
    return false
  }
}
```

### O que pode dar errado, e o que o código faz

| Falha em... | Estado do mundo | O que o código faz |
|---|---|---|
| Passo 1 (upload) | Nada foi gravado | O `catch` mostra o erro. Nada a desfazer |
| Passo 2 (gravação), **após** o 1 | Há uma imagem no Storage **sem revista** | O `catch` apaga a imagem (`removeCover`) |
| Os dois deram certo | Tudo consistente | Atualiza a tela |

Esse padrão, **"se o segundo passo falhar, desfaça o primeiro"**, chama-se **compensação**. É a versão simples de
uma *transação* quando os passos moram em sistemas diferentes (Storage e Postgres não fazem parte da mesma
transação).

### O `.catch(() => {})` no `removeCover`
```ts
await removeCover(coverUrl).catch(() => {})
```
Aqui estamos **já dentro** do tratamento de um erro. Se a limpeza também falhar, não vamos mostrar um segundo
erro ao usuário: ele já viu o principal. O `catch` vazio é **intencional** e **comentado**. Nunca use um `catch`
vazio sem saber por quê.

### E na hora de **apagar**? A ordem inverte
📁 `magazineService.ts`:
```ts
export async function deleteMagazine(magazine: Magazine): Promise<void> {
  const { error } = await supabase.from('magazines').delete().eq('id', magazine.id)
  if (error) throw error                       // 1º a linha

  if (magazine.cover_image_url) {
    await removeCover(magazine.cover_image_url).catch(() => {})   // 2º o arquivo
  }
}
```
**Linha primeiro, arquivo depois.** Por quê? Se fosse o contrário e a remoção da linha falhasse, você teria uma
revista **sem capa** (pior: um dado visível quebrado). Do jeito certo, o pior caso é um **arquivo sobrando no
Storage** (lixo invisível). **Escolha sempre a ordem cujo pior caso é o menos ruim.**

### Na edição: trocar a capa
`handleUpdate`: sobe a capa nova → atualiza a linha → só então apaga a capa **antiga**. Se algo falhar no meio,
desfaz a nova.

---

## 7. Upload: o que acontece com um arquivo

📁 `magazineService.ts`:
```ts
export async function uploadCover(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
```

Passo a passo:
1. `file` é um objeto **`File`** do navegador (vem do `<input type="file">`).
2. `file.name.split('.').pop()` pega a **extensão** (`'capa.JPG'` → `'JPG'`).
3. `path` = `<id do usuário>/<id único>.<extensão>`.
4. `upload(path, file)` envia. O RLS do Storage confere se a pasta é a do usuário.
5. `getPublicUrl(path)` monta o endereço público (não faz pedido de rede; só monta o texto).

### Antes do upload: prévia e validação (`MagazineForm.tsx`)

```tsx
useEffect(() => {
  if (!cover) { setPreview(null); return }
  const url = URL.createObjectURL(cover)        // endereço TEMPORÁRIO, só no seu navegador
  setPreview(url)
  return () => URL.revokeObjectURL(url)         // libera a memória
}, [cover])
```
`URL.createObjectURL` cria um endereço (`blob:...`) para mostrar a imagem escolhida **sem enviar nada**.

```tsx
if (file && !file.type.startsWith('image/')) { setCoverError('O arquivo precisa ser uma imagem.'); ... }
if (file && file.size > MAX_COVER_MB * 1024 * 1024) { setCoverError(`A imagem passa de ${MAX_COVER_MB} MB.`); ... }
```
⚠️ **Isto é conforto, não segurança.** Quem fala direto com a API pula essas checagens. A proteção real precisa
estar no servidor (limites do bucket, capítulo 08).

---

## 8. Edição: atualizar só o que mudou

```ts
export async function updateMagazine(id: string, changes: Partial<NewMagazine>): Promise<Magazine> {
  const { data, error } = await supabase.from('magazines').update(changes).eq('id', id).select().single()
  if (error) throw error
  return data
}
```
`Partial<NewMagazine>` (capítulo 03): você pode enviar só alguns campos.

### ⚠️ O bug sutil: `undefined` × `null` ao editar
```tsx
cover_model: coverModel.trim() || null     // ✅
cover_model: coverModel.trim() || undefined // ❌ ao EDITAR
```
O JavaScript **descarta** campos `undefined` ao montar o pedido. Para o banco, "você não mencionou esse campo"
significa **"mantenha o valor antigo"**. Se o usuário **apagar** o modelo da capa e você mandar `undefined`, o valor
antigo **fica**. Só `null` significa "esvazie isto". Foi um dos casos que o teste manual pegou.

---

## 9. Importação em massa: uma máquina de estados

📁 `src/components/BulkImport.tsx`. Cada arquivo escolhido vira um **item** com um estado:

```
         ┌──────────┐   clique em Importar   ┌───────────┐
 nome ─► │ pendente │ ─────────────────────► │ enviando  │
 lido    └──────────┘                        └─────┬─────┘
    │                                         ok │    │ falha
    │ edição já existe                          ▼    ▼
    ▼                                       ┌─────┐ ┌──────┐
┌───────────┐                               │ ok  │ │ erro │ ──► tentar de novo
│ duplicada │ (não é enviada)               └─────┘ └──────┘
└───────────┘
```

Tipo dos estados (`type Status = 'pendente' | 'enviando' | 'ok' | 'erro' | 'duplicada'`): uma **união literal**
(capítulo 03), então o TS impede estados inexistentes.

### Cada item tem seu próprio estado
```tsx
function update(id: string, changes: Partial<Item>) {
  setItems((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)))
}
```
Mudar **um** item sem tocar nos outros: `map` + spread, forma funcional (as três ideias do capítulo 05 juntas).

### Enviando em sequência
```tsx
for (const item of items) {
  if (item.status !== 'pendente' && item.status !== 'erro') continue
  update(item.id, { status: 'enviando', error: undefined })
  try {
    coverUrl = await uploadCover(item.file, userId)
    const magazine = await addMagazine({ ... }, userId)
    imported.push(magazine)
    update(item.id, { status: 'ok' })
  } catch (e) {
    if (coverUrl) await removeCover(coverUrl).catch(() => {})
    update(item.id, { status: 'erro', error: (e as Error).message })
  }
}
```

Observações:
- **`for ... of` com `await` dentro** envia **um de cada vez**. Alternativa: `Promise.all` envia **todos de uma
  vez**. Sequencial é mais lento, mas **mais simples de acompanhar** (a barra de progresso faz sentido) e não
  sobrecarrega o servidor. Com 100 arquivos, `Promise.all` abriria 100 conexões simultâneas.
- **Um erro não para o lote:** o `try/catch` está **dentro** do loop, então um item que falha vira "erro" e o loop
  segue para o próximo.
- **Os que deram erro podem ser reenviados**: o `if` aceita `'erro'` também.
- **A compensação aparece de novo** (`removeCover` no `catch`): é o mesmo padrão do `handleAdd`.

### Detectar duplicatas
```tsx
const knownIssues = new Set([
  ...existing.map((m) => m.issue).filter(Boolean),    // edições já no catálogo
  ...items.map((i) => i.issue).filter(Boolean),       // edições já neste lote
])
const duplicate = parsed.issue !== null && knownIssues.has(parsed.issue)
if (parsed.issue) knownIssues.add(parsed.issue)
```
O `Set` torna a verificação `has(...)` instantânea e evita repetição. Note o detalhe: o número **entra no `Set`
depois** de testado, assim duas capas iguais no mesmo lote também são detectadas.

**Limite conhecido:** só detecta duplicatas **com número de edição**. Capas sem número no nome nunca são marcadas.

---

## 10. Autenticação no app

📁 `AuthForm.tsx`:
```tsx
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (error) setMessage(error.message)
// Se deu certo, não fazemos nada: o useSession percebe sozinho.
```
Note que o formulário **não avisa o `Catalog`** de que o login deu certo. Ele só chama o login. O `useSession`,
que **escuta** mudanças (`onAuthStateChange`), percebe a nova sessão, atualiza seu estado, e a tela troca. Os dois
lados conversam por um terceiro (o Supabase).

O formulário é **só de login**: o cadastro está fechado no Supabase, então removemos o modo "criar conta" para não
deixar um botão que sempre daria erro.

---

## Erros comuns
| Sintoma | Causa | Solução |
|---|---|---|
| `error` ignorado, dados `null` | Esqueceu de checar `error` | `if (error) throw error` logo após o `await` |
| Tela mostra algo que não foi salvo | Mudou a tela **antes** do `await` | Espere o banco, depois `setState` |
| Imagens sobrando no Storage | Falhou o 2º passo e nada desfez o 1º | Compensação no `catch` |
| Campo "apagado" volta ao editar | Mandou `undefined` | Mande `null` |
| Lista "pula" ou perde itens | Resposta antiga sobrescreve a nova | Variável `cancelled` na limpeza |
| Lote inteiro para num erro | `try/catch` fora do loop | Mova o `try/catch` para dentro |

## Exercícios
1. Adicione ao serviço `countMyMagazines(userId)` usando `select('*', { count: 'exact', head: true })` e mostre o
   total no topo da página.
2. Faça o `handleTogglePublic` ser **otimista**: mude a tela primeiro e desfaça se o banco recusar. Compare a
   complexidade.
3. Em `BulkImport`, troque o loop sequencial por **três envios por vez** (um "pool" simples). Quanto ficou mais
   rápido? O que ficou mais difícil?
4. Adicione um botão **"Excluir selecionadas"** na coleção (seleção múltipla). Pense em: o que apagar primeiro? E
   se uma falhar no meio?
5. **Desafio:** escreva o fluxo completo de **editar capa** num diagrama (como o da seção 6) listando o que
   acontece em cada ponto de falha.

✅ **Checklist do capítulo 09**
- [ ] Verifico `error` depois de todo `await` do Supabase.
- [ ] Explico por que o serviço faz `throw` e a tela faz `try/catch`.
- [ ] Explico "espere o banco antes de mudar a tela" e a alternativa otimista.
- [ ] Descrevo o padrão de compensação com `handleAdd`.
- [ ] Explico por que deletar usa a ordem "linha, depois arquivo".
- [ ] Sei a diferença entre `undefined` e `null` num `update`.
- [ ] Explico a máquina de estados do `BulkImport` e por que o envio é sequencial.

Próximo: [10. Lógica pura e testes](10-logica-pura-e-testes.md).
