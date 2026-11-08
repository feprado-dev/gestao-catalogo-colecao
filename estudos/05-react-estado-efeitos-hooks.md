# 05. React: estado, efeitos e hooks

## Objetivo
Dominar as três ideias que fazem uma tela *reagir*: **estado** (`useState`), **efeitos** (`useEffect`) e **hooks
próprios**. É o capítulo mais importante da parte de React. Leia com calma e faça os exercícios.

---

## 1. Por que precisamos de estado

Uma variável comum **não** faz a tela mudar:

```tsx
function Contador() {
  let n = 0
  return <button onClick={() => { n = n + 1 }}>{n}</button>   // ❌ clica e nada acontece na tela
}
```

Dois problemas: (1) o React não sabe que `n` mudou, então não redesenha; (2) mesmo se redesenhasse, a função
rodaria de novo e `n` voltaria a `0`.

**Estado** resolve os dois: é uma memória que o React guarda **entre desenhos** e que, ao mudar, **dispara um
novo desenho**.

```tsx
import { useState } from 'react'

function Contador() {
  const [n, setN] = useState(0)                       // [valor atual, função para trocar]
  return <button onClick={() => setN(n + 1)}>{n}</button>
}
```

---

## 2. `useState` em detalhe

```tsx
const [magazines, setMagazines] = useState<Magazine[]>([])
//     ▲ valor        ▲ função que troca        ▲ valor inicial
```

### Regra 1: nunca altere o estado diretamente; sempre crie um novo
```tsx
magazines.push(nova)                     // ❌ altera o array; o React não percebe
setMagazines([nova, ...magazines])       // ✅ cria um array novo
```
O React decide se redesenha **comparando** o valor novo com o antigo por *referência*. Se você muda o mesmo
array por dentro, a referência é a mesma, e o React conclui "nada mudou".

Receitas para listas e objetos (todas devolvem algo **novo**):

| Quero... | Escrevo |
|---|---|
| Adicionar no início | `[nova, ...lista]` |
| Remover | `lista.filter(x => x.id !== id)` |
| Trocar um item | `lista.map(x => x.id === id ? { ...x, campo: novo } : x)` |
| Mudar um campo de um objeto | `{ ...objeto, campo: novo }` |

📁 `Catalog.tsx` usa as quatro receitas: `handleAdd`, `confirmDelete`, `handleUpdate`, `handleTogglePublic`.

### Regra 2: a atualização é *agendada*, não imediata
```tsx
setN(n + 1)
console.log(n)    // ainda mostra o valor ANTIGO
```
O novo valor só existe no **próximo desenho**.

### A forma funcional: quando o novo valor depende do antigo
```tsx
setMagazines((current) => [...created, ...current])
```
Em vez de passar o valor, você passa uma função que recebe o **valor mais recente**. Compare no projeto:

```tsx
// handleAdd: usa a variável "magazines" capturada NO MOMENTO em que a função foi criada
setMagazines([created, ...magazines])

// BulkImport (no onImported do Catalog): forma funcional, sempre parte do valor mais recente
setMagazines((current) => [...created, ...current])
```
No `handleAdd`, existe um risco sutil: se duas atualizações acontecerem antes de o React redesenhar, a segunda
parte de uma lista **desatualizada** e apaga o trabalho da primeira. A forma funcional elimina o risco. É um
ótimo exercício de refatoração (capítulo 14): troque os `setMagazines([...magazines])` por versões funcionais.

### Inicialização preguiçosa
```tsx
const [theme, setTheme] = useState<Theme>(readTheme)    // sem parênteses: passa a FUNÇÃO
```
`useState(readTheme())` rodaria `readTheme()` (que lê o `localStorage`) **a cada desenho**, jogando fora o
resultado depois do primeiro. Passando a função, o React a chama **uma única vez**, na criação.
📁 `useTheme.ts`, `useViewMode.ts`, `AgeGate.tsx`.

---

## 3. Estado derivado: não guarde o que dá para calcular

📁 `Catalog.tsx`:
```tsx
const [magazines, setMagazines] = useState<Magazine[]>([])     // estado: a lista COMPLETA
const [filters, setFilters]     = useState<Filters>(defaultFilters)   // estado: o que o usuário escolheu
const visibleMagazines = applyFilters(magazines, filters)      // DERIVADO: só uma conta
```

Só os dois primeiros são estado. O terceiro é **calculado** a cada desenho. Se guardássemos a lista filtrada em
outro `useState`, teríamos **duas cópias que podem divergir**: você apaga uma revista, esquece de atualizar a cópia
filtrada, e a tela mostra uma revista fantasma.

> **Regra de ouro:** guarde o mínimo de estado possível e **derive** o resto.

O mesmo vale no `MagazineCard`: `date`, `meta` e `isOwnerView` são calculados, não guardados.

---

## 4. Efeitos: sincronizar com o mundo de fora

Um componente React deve ser uma **conta pura**: dados entram, JSX sai. Mas apps reais precisam de coisas que
vivem **fora** do React: buscar dados na internet, mexer no `localStorage`, ouvir o teclado, ligar um relógio.
Isso é um **efeito colateral**, e o `useEffect` é onde ele mora.

```tsx
useEffect(() => {
  // 1) o que fazer DEPOIS de desenhar
  return () => {
    // 2) (opcional) a LIMPEZA: desfazer o que o passo 1 ligou
  }
}, [dependencias])   // 3) quando rodar de novo
```

### O array de dependências

| Escrita | Quando o efeito roda |
|---|---|
| `useEffect(fn)` (sem array) | Depois de **todo** desenho (quase nunca é o que você quer) |
| `useEffect(fn, [])` | **Uma vez**, quando o componente aparece |
| `useEffect(fn, [userId])` | Quando aparece **e** sempre que `userId` mudar |

**A regra:** liste no array tudo que o efeito *usa* e que pode mudar. (O IntelliJ avisa quando falta algo.)

### A limpeza (*cleanup*) é obrigatória quando você "liga" algo

📁 `Modal.tsx`:
```tsx
useEffect(() => {
  function handleKey(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose()
  }
  window.addEventListener('keydown', handleKey)            // liga o ouvinte
  return () => window.removeEventListener('keydown', handleKey)   // desliga ao sair
}, [onClose])
```
Sem a limpeza, cada janela aberta deixaria um ouvinte a mais vivo, mesmo depois de fechada. Quanto mais abrisse e
fechasse, mais ouvintes acumulados (um **vazamento**).

Outros pares "liga/desliga" no projeto:
- `useSession.ts`: `onAuthStateChange(...)` e `subscription.unsubscribe()`.
- `MagazineForm.tsx`: `URL.createObjectURL(cover)` e `URL.revokeObjectURL(url)` (libera memória da prévia).
- `MagazineGallery.tsx`: `addEventListener('wheel', ...)` e `removeEventListener(...)`.

### O problema da "resposta velha" (condição de corrida)

📁 `Catalog.tsx`:
```tsx
useEffect(() => {
  if (!userId) { setMagazines([]); return }
  let cancelled = false
  listMyMagazines(userId)
    .then((data) => { if (!cancelled) setMagazines(data) })
    .catch((e: Error) => { if (!cancelled) setError(e.message) })
  return () => { cancelled = true }
}, [userId])
```

Imagine: o usuário entra e sai rapidamente. Há duas buscas no ar. Se a **primeira** demorar mais e chegar
**depois** da segunda, ela sobrescreveria o resultado correto com dados velhos. A limpeza marca
`cancelled = true` para a busca antiga, e o `if (!cancelled)` descarta a resposta atrasada. Isso funciona por causa
das **closures** (capítulo 02): a função de limpeza enxerga a mesma variável `cancelled` do efeito que a criou.

### Quando NÃO usar `useEffect`
A documentação do React insiste: **efeito é a exceção**. Não use para:
- **Calcular algo a partir de props/estado** → faça direto no corpo (estado derivado).
- **Reagir a um clique** → ponha a lógica no manipulador do evento.

📁 Veja a diferença no projeto:
- `useTheme.ts` usa efeito, **porque** precisa sincronizar com algo externo (o atributo no `<html>` e o armazenamento).
- `useViewMode.ts` grava no `localStorage` **dentro da função `change`**, sem efeito: a mudança nasce de um
  clique, e o clique é o lugar natural para a gravação.

### Os avisos do `npm run lint`
O lint do projeto mostra dois avisos `set-state-in-effect`:
- `MagazineForm.tsx`: o efeito chama `setPreview(...)` logo após criar o endereço temporário da imagem.
- `Catalog.tsx`: `setMagazines([])` no começo do efeito quando não há usuário.

Eles dizem: "mudar estado *de dentro* de um efeito causa um desenho extra". Funciona, mas há alternativas mais
enxutas (por exemplo, `useMemo` para o endereço da prévia). **É um ótimo exercício de refatoração.**

---

## 5. `useRef`: guardar algo que não deve causar redesenho

```tsx
const scroller = useRef<HTMLDivElement>(null)
...
<div ref={scroller}>...</div>
...
scroller.current.scrollBy({ left: 300 })
```

Um `ref` é uma "caixa" onde você guarda um valor que **persiste entre desenhos** mas, ao contrário do estado,
**mudar não redesenha**. Dois usos comuns:

1. **Acessar um elemento do DOM** (como o scroller em `MagazineGallery.tsx`, para rolar com os botões).
2. **Guardar um valor "de bastidor"**: `BulkImport.tsx` usa `previews = useRef<string[]>([])` para lembrar os
   endereços temporários das imagens e liberá-los na saída.

**Estado × ref:** se a tela precisa *mostrar* o valor, é estado. Se é só para *lembrar*, é ref.

---

## 6. Hooks próprios: reaproveitar lógica com estado

Um **hook próprio** é uma função cujo nome começa com `use` e que chama outros hooks. Ele não devolve JSX:
devolve **dados e funções**.

### `useSession` (`src/hooks/useSession.ts`)
Responde "quem está logado?":

```tsx
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession))
    return () => data.subscription.unsubscribe()
  }, [])

  return { session, loading }
}
```

Fluxo em três tempos: (1) pergunta **uma vez** se já há sessão salva; (2) **escuta** entradas e saídas;
(3) **limpa** a escuta ao sair. Note o `loading`: enquanto não sabemos, mostramos "Carregando...", e não a tela de
login (senão o usuário veria um "piscar" de login antes de a sessão ser reconhecida).

### `useTheme` e `useViewMode`
Ambos seguem o mesmo padrão: **estado + persistência no `localStorage`**.

| Hook | Guarda | Devolve |
|---|---|---|
| `useTheme` | `'dark'` ou `'light'` | `{ theme, toggleTheme }` |
| `useViewMode` | `'vertical'`, `'horizontal'` ou `'mosaico'` | `[mode, setMode]` |

`useViewMode` ainda tem uma defesa: só aceita um valor **conhecido** do armazenamento
(`MODES.find((mode) => mode === saved) ?? 'vertical'`). Se alguém mexer no `localStorage` e colocar lixo, o app
volta ao padrão em vez de quebrar. **Nunca confie em dados que vêm de fora do seu código**, nem do navegador.

### Por que isso é bom
`PublicCatalog` e `Catalog` usam o **mesmo** `useViewMode()`. A lógica vive num lugar só.

---

## 7. As regras dos hooks (o React exige)

1. **Chame hooks apenas no nível de cima** do componente. Nunca dentro de `if`, `for` ou função aninhada.
2. **Chame hooks só em componentes ou em outros hooks.**

Por quê? O React identifica cada hook pela **ordem** em que é chamado. Se a ordem muda entre desenhos, ele se
perde.

📁 É por isso que, em `Catalog.tsx`, os `return` antecipados ("Carregando...", "sem login") ficam **depois** de
todos os `useState`/`useEffect`. Se um `return` viesse antes de um hook, em alguns desenhos o hook seria chamado e
em outros não, o que o React proíbe.

---

## 8. `key` para reiniciar um componente

```tsx
<MagazineForm key={editingMagazine.id} initial={editingMagazine} ... />
```

O `useState(initial?.title)` só usa o valor inicial **na primeira vez**. Se você abrisse a edição de outra revista
com o mesmo componente já montado, o formulário continuaria com os dados da primeira. Trocar a `key` faz o React
**descartar** o componente e criar um novo, com o estado zerado. É um truque pequeno e muito útil.

O mesmo vale para o campo de arquivo: `<input key={fileInputKey} type="file" />` é "zerado" mudando a `key`,
porque o navegador não permite limpar um campo de arquivo por código.

---

## 9. Elevando o estado (*lifting state up*)

Onde guardar o estado `magazines`? Quem precisa dele: a lista, o contador, os filtros, a edição, a remoção.
Todos moram **na página `Catalog`**, então é ali que o estado vive. Os componentes menores recebem dados por props e
avisam por funções.

> **Regra:** coloque o estado no **ancestral comum mais próximo** de todos que precisam dele. Nem mais alto
> (vira bagunça global), nem mais baixo (os irmãos não conseguem compartilhar).

---

## 10. Desenvolvimento × produção: o `StrictMode`

Em desenvolvimento, o `<StrictMode>` (em `main.tsx`) roda efeitos **duas vezes** para revelar efeitos sem limpeza.
Se um efeito seu quebra ao ser executado duas vezes, falta uma limpeza. No site publicado isso não acontece.

---

## Erros comuns
| Sintoma | Causa | Solução |
|---|---|---|
| Tela não atualiza ao mudar a lista | Alterou o array direto (`push`, `sort`) | `setLista([...novo])` |
| Efeito roda em loop infinito | O efeito muda um estado que está nas suas dependências | Revise as dependências; talvez nem seja efeito |
| `Rendered more hooks than during the previous render` | Hook depois de um `return` ou dentro de `if` | Mova os hooks para o topo |
| Valor "velho" dentro de uma função | Closure capturou o estado de um desenho antigo | Forma funcional `setX(prev => ...)` |
| Ouvinte duplicado / vazamento | Efeito sem função de limpeza | Adicione o `return () => ...` |
| Formulário mostra dados da revista anterior | Faltou `key` ao reutilizar o componente | `key={item.id}` |

## Exercícios
1. Crie `src/hooks/useLocalStorage.ts` com `useLocalStorage<T>(chave, valorPadrao)` que devolve
   `[valor, setValor]` e grava em JSON. Use-o para guardar o último texto digitado na busca.
2. Refatore `handleAdd`, `confirmDelete` e `handleUpdate` para usar a **forma funcional** do `setMagazines`.
   Rode os testes e confira no navegador.
3. Faça um hook `useDebounce(valor, atrasoMs)` que só atualiza o valor depois de o usuário parar de digitar.
   Aplique à busca. *(Pista: `setTimeout` dentro do efeito e a limpeza com `clearTimeout`.)*
4. Elimine o aviso do lint em `MagazineForm.tsx` calculando o endereço da prévia com `useMemo` e liberando-o num
   efeito de limpeza.
5. **Desafio:** crie um `useOnline()` que devolve `true/false` conforme a internet, ouvindo os eventos `online` e
   `offline` do `window`. Mostre um aviso quando estiver offline.

✅ **Checklist do capítulo 05**
- [ ] Explico por que uma variável comum não faz a tela mudar.
- [ ] Nunca altero estado direto, e sei as quatro receitas para listas.
- [ ] Sei quando usar a forma funcional do `setState`.
- [ ] Explico estado derivado com o `visibleMagazines`.
- [ ] Leio o array de dependências e explico `[]`, `[x]` e a ausência dele.
- [ ] Sei por que a limpeza do efeito existe e dou três exemplos do projeto.
- [ ] Explico a variável `cancelled` e o problema que ela evita.
- [ ] Diferencio estado de ref.
- [ ] Escrevo um hook próprio e sei as regras dos hooks.

Próximo: [06. Rotas e organização](06-rotas-e-organizacao.md).
