# 03. TypeScript: dando forma aos dados

## Objetivo
Entender o que são tipos, por que o projeto os usa em tudo e como ler (e escrever) as anotações que aparecem
no código. No fim, você deve conseguir olhar `types.ts` e explicar cada linha.

---

## 1. Por que existe o TypeScript

JavaScript é **dinâmico**: uma variável pode ser número agora e texto depois. Isso é flexível, mas permite erros
que só aparecem **quando o usuário clica**:

```js
function dobrar(n) { return n * 2 }
dobrar('abc')        // NaN, sem nenhum aviso
```

**TypeScript = JavaScript + tipos.** Você descreve o formato dos dados, e o editor avisa os erros **antes de
rodar** (o sublinhado vermelho no IntelliJ).

```ts
function dobrar(n: number): number { return n * 2 }
dobrar('abc')        // ❌ erro: 'string' não é atribuível a 'number'
```

Importante: o TypeScript **desaparece na compilação**. O navegador executa JavaScript comum. Os tipos existem
só para ajudar quem escreve.

---

## 2. Tipos básicos e anotações

```ts
const titulo: string = 'Marina Lima'
const edicao: number = 292
const publica: boolean = true
const ids: string[] = ['a', 'b']            // lista de textos
const dados: { ano: number; mes: number } = { ano: 1999, mes: 12 }
```

### Inferência: muitas vezes você nem precisa escrever
```ts
const titulo = 'Marina Lima'     // o TS já sabe que é string
```
Regra prática: **anote** parâmetros de função, retornos de funções exportadas e estados em que o tipo não é óbvio.
Deixe o TS **inferir** o resto.

---

## 3. `interface` e `type`: descrevendo um objeto

📁 **No projeto:** `src/types.ts`

```ts
export type Condition = 'Excelente' | 'Bom' | 'Regular' | 'Ruim'

export interface Magazine {
  id: string
  title: string
  issue?: string | null
  year: number | null
  month: number | null
  cover_model?: string | null
  condition: Condition | null
  acquired: boolean
  is_public: boolean
  cover_image_url?: string | null
}
```

Leia linha por linha:

| Trecho | Significa |
|---|---|
| `id: string` | Todo `Magazine` **tem** um `id`, e é texto |
| `issue?: string \| null` | O `?` diz que o campo é **opcional** (pode nem existir); `\| null` aceita também `null` |
| `year: number \| null` | Obrigatório, mas pode ser `null` ("não sei o ano") |
| `condition: Condition \| null` | Uma das quatro condições, ou `null` |

### `|` (união): "um ou outro"
```ts
type Condition = 'Excelente' | 'Bom' | 'Regular' | 'Ruim'
```
Isso é um **tipo literal união**: só esses quatro textos são aceitos. Se você escrever `'Otimo'`, o IntelliJ
sublinha de vermelho. Foi o exercício que fizemos na Etapa 1.

### `interface` × `type`
Para objetos, os dois fazem quase o mesmo. Convenção comum: `interface` para formatos de objeto, `type` para
uniões e apelidos. Não perca tempo escolhendo; o importante é ser consistente.

---

## 4. `null`, `undefined` e o "modo estrito"

A pergunta mais valiosa que o TypeScript faz: **"e se isto não existir?"**

```ts
const m = magazines.find((x) => x.id === 'abc')   // tipo: Magazine | undefined
m.title                                           // ❌ erro: m pode ser undefined
m?.title                                          // ✅ ok
```

O `find` pode não achar nada, e o TS **obriga** você a tratar isso. 📁 `Catalog.tsx`: `pendingMagazine?.title`,
`if (!pendingMagazine) return`.

### Estreitamento de tipo (*narrowing*)
Depois de verificar, o TS "aprende":
```ts
if (!pendingMagazine) return
// aqui embaixo, o TS SABE que pendingMagazine existe
await deleteMagazine(pendingMagazine)
```

---

## 5. ⚠️ O caso em que os tipos "mentiram" (leia com atenção)

Na primeira versão, `Magazine` dizia `year: number` e `month: number`. Mas o banco tinha 64 revistas **sem ano**
(`null`). O TypeScript **não reclamou**, porque ele só confia no que você escreveu: ele não consulta o banco.

Resultado em produção: os cards mostravam `null/null` na tela.

**Lição:** os tipos descrevem o que você **acredita** sobre os dados, não o que os dados **são**. Quando os dados
vêm de fora (banco, API, arquivo), eles podem divergir do tipo. A correção foi tornar o tipo honesto
(`year: number | null`) e tratar o `null` em todo lugar que usa (`MagazineCard`, `filters.ts`, o formulário).
Depois que o tipo passou a admitir `null`, o TS **apontou todos os lugares** que precisavam de ajuste. É assim
que ele ajuda de verdade.

---

## 6. Genéricos e tipos utilitários

### Genéricos: um tipo "com um buraco"
```ts
Promise<Magazine[]>     // "uma promessa que vai entregar uma lista de Magazine"
useState<string | null>(null)
```
O que está entre `< >` preenche o buraco. 📁 `async function listMyMagazines(userId: string): Promise<Magazine[]>`.

### Tipos utilitários: transformam tipos que você já tem

| Utilitário | Faz | No projeto |
|---|---|---|
| `Omit<T, 'campo'>` | Tira campos | `type NewMagazine = Omit<Magazine, 'id'>`: uma revista **sem** `id` (quem cria o id é o banco) |
| `Partial<T>` | Torna tudo opcional | `updateMagazine(id, changes: Partial<NewMagazine>)`: pode atualizar só alguns campos |
| `Record<K, V>` | Objeto com chaves `K` e valores `V` | `Record<Status, string>` em `BulkImport.tsx`, uma tabela de rótulos para cada estado |

Vantagem enorme: **uma fonte da verdade**. Se você acrescenta um campo em `Magazine`, `NewMagazine` e
`Partial<NewMagazine>` ganham o campo automaticamente.

---

## 7. `import type` e `as`

```ts
import type { Magazine } from '../types'
```
`import type` deixa claro que isso só existe na compilação. O projeto **exige** isso
(`verbatimModuleSyntax`).

### `as`: afirmar um tipo ("confie em mim")
```ts
setCondition(e.target.value as Condition)
```
O `e.target.value` do `<select>` é `string`, mas **nós sabemos** que só pode ser uma das quatro condições.
O `as` cala o TS. ⚠️ **Use com parcimônia**: se estiver errado, o TS não te protege mais ali. Já o `!` em
`document.getElementById('root')!` diz "tenho certeza de que não é `null`".

---

## 8. Tipando as peças do React

### Props
```tsx
interface MagazineCardProps {
  magazine: Magazine
  onDelete?: (id: string) => void              // função opcional
  onEdit?: (magazine: Magazine) => void
}

export function MagazineCard({ magazine, onDelete, onEdit }: MagazineCardProps) { ... }
```

`(id: string) => void` descreve uma função: recebe um `string`, não devolve nada útil.

### Estado
```tsx
const [magazines, setMagazines] = useState<Magazine[]>([])
const [error, setError] = useState<string | null>(null)
```
Sem o `<Magazine[]>`, o TS deduziria `never[]` para `[]` (uma lista que nunca aceita nada).

### Eventos
```tsx
function handleSubmit(event: React.FormEvent) { ... }
function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) { ... }
```
Dica prática: se não souber o tipo de um evento, passe o mouse sobre o `onChange` no IntelliJ, ele mostra.

### `children`
```tsx
children: React.ReactNode   // qualquer coisa que o React sabe desenhar
```

---

## 9. Lendo um erro do TypeScript

Os erros são longos, mas seguem um padrão. Exemplo real do projeto, quando tornamos `condition` aceitável como
`null`:

```
Type '"Excelente" | "Bom" | "Regular" | "Ruim" | null' is not assignable to type
'string | number | readonly string[] | undefined'.
  Type 'null' is not assignable to type 'string | number | readonly string[] | undefined'.
```

Como ler: **de baixo para cima.** A última linha costuma dizer a causa real: *"`null` não cabe no atributo
`value` de um `<select>`"*. A solução foi separar os tipos (`Condition`, sem `null`, para o formulário; e
`Magazine.condition`, com `null`, para os dados). Isso é refatoração guiada pelo compilador.

---

## 10. O que o TypeScript NÃO faz
- **Não valida dados em tempo de execução.** O que vem do banco pode estar errado (como vimos).
- **Não substitui testes.** Ele garante *formatos*, não *comportamentos*.
- **Não aparece no site final.** Some na compilação.

---

## Erros comuns
| Sintoma | Causa | Solução |
|---|---|---|
| `Object is possibly undefined` | Não tratou o caso "não existe" | `?.`, `??` ou um `if` antes |
| `Property 'x' does not exist` | Nome errado ou tipo incompleto | Confira o tipo; use o autocompletar |
| Tudo `any` por todo lado | Anotou `any` para "calar" o TS | Evite `any`; use `unknown` e estreite |
| `Type 'string' is not assignable to type 'Condition'` | Texto solto onde espera a união | Use `as Condition` (se tiver certeza) ou valide |

## Exercícios
1. Em `types.ts`, torne `year` opcional (`year?: number`). Que erros o TS mostra e onde? Depois desfaça.
2. Crie um tipo `MagazineSummary` com `Pick<Magazine, 'id' | 'title'>`. (`Pick` é o oposto de `Omit`.)
3. Escreva `function rotuloDoMes(mes: number | null): string` que devolva `'Mar'` para `3` e `'-'` para `null`.
4. Crie `type Status = 'pendente' | 'ok' | 'erro'` e uma função que receba um `Status` e devolva um texto. Tente
   passar `'ocupado'` e leia o erro.
5. **Desafio:** por que `useState<Magazine[]>([])` precisa do `<Magazine[]>`? Teste sem e passe o mouse sobre a
   variável.

✅ **Checklist do capítulo 03**
- [ ] Explico por que tipos existem e que somem na compilação.
- [ ] Leio `types.ts` linha por linha, incluindo `?` e `| null`.
- [ ] Sei o que são união (`|`) e tipo literal.
- [ ] Uso `?.` e `??` por causa do que o TS aponta.
- [ ] Explico `Omit`, `Partial` e `Record` com exemplos do projeto.
- [ ] Conto o caso do `year: number` que "mentiu" e o que ele ensina.

Próximo: [04. React: fundamentos](04-react-fundamentos.md).
