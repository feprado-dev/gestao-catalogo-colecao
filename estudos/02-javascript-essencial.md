# 02. JavaScript essencial: a parte que o projeto realmente usa

## Objetivo
Dominar o JavaScript moderno que aparece no Vault Keeper. Este capítulo **não** é um curso completo de JS: é o
subconjunto que você precisa para ler e escrever todo o código do projeto. Cada seção aponta onde o recurso aparece.

> **Como usar:** abra o console do navegador (`⌥⌘J` no Safari/Chrome, aba Console) e teste cada exemplo. Código que
> você executa fica na memória; código que só lê, não.

---

## 1. Variáveis: `const` e `let`

```js
const nome = 'Joana'     // não pode ser reatribuída
let contador = 0         // pode mudar
contador = contador + 1
```

**Regra do projeto: use `const` sempre; troque para `let` só se precisar reatribuir.** `const` não significa que o
valor é imutável (um array `const` pode receber itens), apenas que a *variável* não aponta para outra coisa.

Evite `var`: é a forma antiga, com comportamento confuso.

---

## 2. Tipos básicos

| Tipo | Exemplo | Observação |
|---|---|---|
| `string` | `'oi'`, `"oi"`, `` `oi` `` | texto |
| `number` | `42`, `3.14` | inteiros e decimais são o mesmo tipo |
| `boolean` | `true`, `false` | |
| `null` | `null` | "propositalmente vazio" |
| `undefined` | `undefined` | "nunca recebeu valor" |
| `object` | `{ a: 1 }` | inclui arrays |

### Template strings (crase)
```js
const titulo = 'Marina Lima'
const edicao = 292
const texto = `Nº ${edicao} · ${titulo}`   // "Nº 292 · Marina Lima"
```
Com crase, `${...}` insere qualquer expressão. 📁 `Catalog.tsx`: `` `Apagar "${pendingMagazine.title}"?` ``

### Truthy e falsy: o que conta como "falso" num `if`
São **falsy**: `false`, `0`, `''` (texto vazio), `null`, `undefined`, `NaN`. Todo o resto é **truthy**.
Por isso `if (title)` é falso para título vazio.

⚠️ **Cuidado:** `0` é falsy! Se um ano pudesse ser `0`, `{magazine.year && ...}` mostraria um `0` na tela em vez de
nada. Para o ano de uma revista isso não acontece, mas é um clássico em outros contextos.

### `==` × `===`
Use sempre `===` (igualdade estrita) e `!==`. O `==` converte tipos e dá surpresas (`'1' == 1` é `true`).

---

## 3. Objetos

```js
const revista = {
  title: 'Joana Prado',
  year: 1999,
  month: 12,
  is_public: true,
}

revista.title            // 'Joana Prado'
revista['year']          // 1999
revista.is_public = false
```

### Desestruturação (extrair campos)
```js
const { title, year } = revista        // cria as variáveis title e year
```
📁 `useSession.ts`: `supabase.auth.getSession().then(({ data }) => ...)` extrai `data` do objeto recebido.
📁 `magazineService.ts`: `const { data, error } = await supabase...`

### Spread `...` (copiar e combinar)
```js
const copia = { ...revista }                      // cópia rasa
const alterada = { ...revista, year: 2000 }       // copia e troca UM campo
```
📁 `Catalog.tsx`: `{ ...m, is_public: !m.is_public }`, "a mesma revista, mas com `is_public` invertido".
O campo escrito **depois** do spread vence. Se escrever `{ year: 2000, ...revista }`, o `year` da `revista`
sobrescreve o seu.

### Encadeamento opcional `?.` e coalescência nula `??`
```js
const modelo = revista.cover_model?.trim()   // se cover_model for null/undefined, devolve undefined (sem erro)
const titulo = revista.title ?? 'Sem título'  // se title for null/undefined, usa o texto padrão
```
- **`?.`** evita o erro "não é possível ler propriedade de undefined".
- **`??`** só troca `null` e `undefined`. Já o **`||`** troca *qualquer* falsy (inclusive `0` e `''`).

```js
0 ?? 10     // 0     (0 é um valor válido)
0 || 10     // 10    (0 é falsy, então trocou)
```
📁 `MagazineForm.tsx`: `useState(initial?.title ?? '')` é "use o título inicial, se existir; senão, vazio".
📁 `filters.ts`: `m.cover_model ?? ''` evita juntar o texto `"null"` na busca.

---

## 4. Arrays e os métodos que você mais usa

```js
const numeros = [3, 1, 2]
numeros.length           // 3
numeros[0]               // 3 (a contagem começa em 0)
```

Os métodos abaixo **não alteram** o array original (devolvem um novo). É a base do jeito React de pensar.

| Método | Faz | Exemplo | Resultado |
|---|---|---|---|
| `map` | Transforma cada item | `[1,2,3].map(n => n * 2)` | `[2,4,6]` |
| `filter` | Mantém os que passam no teste | `[1,2,3].filter(n => n > 1)` | `[2,3]` |
| `find` | Primeiro que passa (ou `undefined`) | `[1,2,3].find(n => n > 1)` | `2` |
| `some` | Algum passa? | `[1,2,3].some(n => n > 2)` | `true` |
| `every` | Todos passam? | `[1,2,3].every(n => n > 0)` | `true` |
| `includes` | Contém? | `[1,2,3].includes(2)` | `true` |
| `join` | Junta em texto | `['a','b'].join(' · ')` | `'a · b'` |
| `slice` | Copia um pedaço | `[1,2,3].slice(1)` | `[2,3]` |

⚠️ **Cuidado: `sort` ALTERA o array original.** Por isso, em `filters.ts`, ordenamos o resultado do `filter`
(que já é uma cópia nova). Para ordenar sem risco, copie antes: `[...lista].sort(...)`.

### Como funciona a função de comparação do `sort`
```js
filtered.sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
```
A função recebe dois itens. Se devolver **negativo**, `a` vem antes; **positivo**, `b` vem antes; **zero**, ficam
como estão. `b - a` ordena do maior para o menor.

O `||` aqui dentro desempata: `(b.year ?? 0) - (a.year ?? 0) || (b.month ?? 0) - (a.month ?? 0)`.
Se a diferença de anos for `0` (falsy), usa a diferença de meses. É um dos poucos casos em que o `||` é o certo.

📁 **No projeto:**
- `Catalog.tsx`: `magazines.filter((m) => m.id !== pendingDeleteId)` (remove um item).
- `Catalog.tsx`: `magazines.map((m) => (m.id === updated.id ? updated : m))` (troca um item).
- `Catalog.tsx`: `magazines.find((m) => m.id === editingId)` (acha o item em edição).
- `MagazineCard.tsx`: `[...].filter(Boolean).join(' · ')` junta só as partes que existem.

### O truque `.filter(Boolean)`
`Boolean` aplicado a cada item devolve `true` para truthy e `false` para falsy, então remove `null`,
`undefined`, `''` e `0`:
```js
['Nº 293', null, '12/1999', ''].filter(Boolean)   // ['Nº 293', '12/1999']
```

---

## 5. Funções

```js
function somar(a, b) { return a + b }          // declaração
const somar2 = (a, b) => a + b                 // arrow function (função de seta)
const dobrar = n => n * 2                      // um parâmetro: parênteses opcionais
const criar = () => ({ ok: true })             // devolver objeto: coloque entre parênteses
```

- **Arrow function com `{}`** precisa de `return` explícito. **Sem `{}`**, o valor da expressão é devolvido.
- Funções são **valores**: dá para passar como argumento, guardar em variável, devolver de outra função.
  É exatamente o que o React faz com `onClick={() => ...}` e `onDelete={setPendingDeleteId}`.

### Closures (a função "lembra" o ambiente onde nasceu)
```js
function criarContador() {
  let n = 0
  return () => { n = n + 1; return n }
}
const c = criarContador()
c()  // 1
c()  // 2
```
📁 `Catalog.tsx`: o `useEffect` usa uma variável `cancelled` que a função de limpeza (`return () => { cancelled = true }`)
consegue alterar mais tarde. Isso só funciona por causa das closures.

---

## 6. Módulos: `import` e `export`

Cada arquivo é um módulo isolado. Você escolhe o que sai dele.

```ts
// filters.ts
export interface Filters { ... }                   // export nomeado
export const defaultFilters = { ... }
export function applyFilters(...) { ... }

// Catalog.tsx
import { applyFilters, defaultFilters, type Filters } from '../lib/filters'
```

| Tipo | Escrita | Importação |
|---|---|---|
| Nomeado | `export function x` | `import { x } from './arquivo'` |
| Padrão (um por arquivo) | `export default App` | `import App from './App'` |

- Caminhos que começam com `./` ou `../` são **relativos** ao arquivo atual. `'../lib/filters'` = "suba uma pasta,
  entre em `lib`, pegue `filters`".
- Sem `./`, é um pacote do `node_modules` (`'react'`, `'@supabase/supabase-js'`).
- `import type { Magazine } from '../types'` importa **só tipo** (some na compilação).

---

## 7. Assíncrono: `Promise`, `async` e `await`

Operações demoradas (internet, banco) não podem travar a página. O JavaScript as trata como **promessas**:
um valor que **vai** existir.

```js
// Modo "promessa" com .then
supabase.auth.getSession().then(({ data }) => { ... })

// Modo moderno com async/await (mais legível)
async function carregar() {
  const { data, error } = await supabase.from('magazines').select('*')
  ...
}
```

Regras:
1. `await` só funciona **dentro de uma função `async`**.
2. `await` "espera a resposta antes de seguir para a próxima linha" (sem travar a página inteira).
3. Uma função `async` **sempre devolve uma Promise**, mesmo que você escreva `return 5`.

### Tratando erros: `try / catch / finally`
```js
try {
  const created = await addMagazine(dados, userId)   // se der erro, pula para o catch
  setMagazines([created, ...magazines])
} catch (e) {
  setError((e as Error).message)                     // aqui você decide o que fazer
}
```
📁 `Catalog.tsx`: `handleAdd`, `handleUpdate`, `handleTogglePublic`, `confirmDelete`.

### Lançar um erro: `throw`
```js
if (error) throw error
```
📁 `magazineService.ts`: cada função **lança** o erro, e quem chamou (o `Catalog`) decide o que mostrar ao usuário.
É a separação certa de responsabilidades: o serviço fala com o banco, a tela fala com o humano.

### Duas operações em sequência (e o meio do caminho)
```js
coverUrl = await uploadCover(cover, userId)   // 1º
const created = await addMagazine(...)        // 2º; se falhar, a imagem do 1º fica órfã
```
O `catch` de `handleAdd` desfaz o primeiro passo. Esse padrão ("desfazer o que já foi feito") é essencial em
sistemas reais. Detalhes no capítulo 09.

---

## 8. Outras ferramentas usadas no projeto

### `Set` (conjunto sem repetição)
```js
const vistos = new Set(['293', '294'])
vistos.has('293')   // true
vistos.add('295')
```
📁 `BulkImport.tsx`: `knownIssues` guarda os números de edição já existentes para detectar duplicatas.

### Expressões regulares (regex)
Padrões para buscar e extrair texto. Entre barras: `/padrão/flags`.

```js
/^(\d{2})__(\d{2})/.exec('99__12__Playboy')   // captura '99' e '12'
```
| Peça | Significa |
|---|---|
| `^` e `$` | início e fim do texto |
| `\d` | um dígito; `\d{2}` = exatamente dois |
| `.` | qualquer caractere; `.+` = um ou mais |
| `_{1,2}` | um ou dois sublinhados |
| `( )` | **grupo de captura**: guarda o trecho |
| `(?: )` | grupo que **não** captura (só agrupa) |
| `?` depois de um grupo | o grupo é **opcional** |
| flag `i` | ignora maiúsculas/minúsculas |

📁 `parseCoverFilename.ts` usa uma regex para ler `99__12__Playboy-No-293-Joana-Prado.jpg`. É o melhor exemplo
do projeto para estudar regex. Teste padrões em `regex101.com` colando o seu texto.

### Métodos de texto que aparecem
| Método | Exemplo | Uso no projeto |
|---|---|---|
| `trim()` | `'  oi '.trim()` → `'oi'` | limpar o que o usuário digitou |
| `toLowerCase()` | | busca sem diferenciar maiúsculas |
| `includes()` | `'abc'.includes('b')` | a busca do catálogo |
| `replace()` | `'a-b'.replace('-', ' ')` | limpar nomes de arquivo |
| `split()` | `'a.b.c'.split('.')` → `['a','b','c']` | pegar a extensão do arquivo |
| `padStart()` | `'3'.padStart(2, '0')` → `'03'` | mostrar mês como `03` |
| `normalize('NFD')` | separa a letra do acento | a busca ignora acentos |
| `localeCompare()` | ordena respeitando o idioma | ordem A-Z com acentos |

### `localStorage`
Guarda texto no navegador, que **sobrevive** ao fechar a aba.
```js
localStorage.setItem('tema', 'light')
localStorage.getItem('tema')        // 'light' (ou null)
```
⚠️ Pode **lançar erro** (navegação anônima, cookies bloqueados), por isso o projeto sempre usa `try/catch` ao redor
(`useTheme.ts`, `useViewMode.ts`, `AgeGate.tsx`).

### `crypto.randomUUID()`
Gera um identificador único. 📁 `uploadCover` usa para nomear cada arquivo, garantindo que nunca sobrescreve outro.

---

## Erros comuns
| Erro | Causa |
|---|---|
| `Cannot read properties of undefined (reading 'x')` | Acessou `.x` de algo que é `undefined`. Use `?.` ou confira antes |
| `x is not a function` | Chamou algo que não é função (nome errado, import errado) |
| Lista não atualiza na tela | Alterou o array original em vez de criar um novo (`push`, `sort` direto) |
| `await` dá erro de sintaxe | Esqueceu o `async` na função |
| Valor `0` ou `''` "desaparece" | Usou `\|\|` ou `&&` onde precisava de `??` |

## Exercícios
Resolva no console ou num arquivo `exercicios.js` rodado com `node exercicios.js`.

1. Dada `const edicoes = [293, 215, 358, 164]`, gere um array novo só com as maiores que 200, ordenadas do menor
   para o maior, **sem alterar** `edicoes`.
2. Dado `const r = { title: 'Rita', year: null }`, escreva uma linha que gere `'Rita (ano desconhecido)'` quando
   `year` for `null`, e `'Rita (1999)'` quando houver ano.
3. Escreva `formatarData(mes, ano)` que devolva `'03/1999'`, `'1999'` (se faltar o mês) ou `''` (se faltar o ano).
   *Dica: `padStart` e `?`/`&&`.*
4. Com uma regex, extraia o número da edição de `'Playboy-No-358-Flavia'`.
5. Escreva `async function esperar(ms)` que usa `setTimeout` dentro de uma Promise, e use `await esperar(1000)`
   para imprimir "oi" depois de um segundo.
6. **Desafio:** reescreva `applyFilters` do zero, sem olhar `filters.ts`, só com o comportamento descrito.

✅ **Checklist do capítulo 02**
- [ ] Uso `const` por padrão e sei quando `let` é necessário.
- [ ] Sei a diferença entre `??` e `||` e dou um exemplo em que dá resultado diferente.
- [ ] Uso `map`, `filter` e `find` sem consultar.
- [ ] Sei por que `sort` exige cuidado e como evitar o problema.
- [ ] Faço desestruturação e spread de objetos de cabeça.
- [ ] Explico `async/await`, `try/catch` e o que `throw` faz.
- [ ] Leio uma regex simples como a de `parseCoverFilename`.

Próximo: [03. TypeScript](03-typescript.md).
