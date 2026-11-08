# 04. React: fundamentos

## Objetivo
Entender como o React transforma **dados** em **tela**: componentes, JSX, props, listas, renderização condicional,
eventos e formulários. Ao final, você deve ler qualquer componente do projeto e prever o que ele desenha.

---

## 1. A ideia central do React

Em vez de mandar o navegador "mude este texto, esconda aquele botão", você descreve **como a tela deve ser dado
um conjunto de dados**:

```
tela = função(dados)
```

Quando os dados mudam, o React recalcula a descrição, compara com a anterior e **altera só o que mudou**.
Você escreve *o resultado desejado*; o React cuida do *como*. Isso se chama programação **declarativa**.

---

## 2. Componente = função que devolve tela

```tsx
function Home() {
  return <h1>Olá</h1>
}
```

Só isso. Um componente é uma **função** cujo nome começa com **letra maiúscula** e que devolve JSX.
Usa-se como se fosse uma tag HTML nova: `<Home />`.

📁 **No projeto:** `src/pages/Home.tsx`, `src/components/Modal.tsx`, `src/components/MagazineCard.tsx`: todos
são funções.

Por que dividir em componentes?
- **Reutilização:** o `MagazineCard` é usado 64 vezes na tela, escrito uma vez.
- **Clareza:** cada peça tem uma responsabilidade.
- **Manutenção:** mudar o card muda todos os cards.

---

## 3. JSX: HTML dentro do JavaScript

```tsx
return (
  <article className="card">
    <h2 className="card__title">{magazine.title}</h2>
    <p>Nº {magazine.issue}</p>
  </article>
)
```

JSX **parece** HTML, mas é JavaScript. As diferenças que mais pegam:

| Em HTML | Em JSX | Por quê |
|---|---|---|
| `class="card"` | `className="card"` | `class` é palavra reservada do JS |
| `for="campo"` | `htmlFor="campo"` | idem |
| `<img src="x">` | `<img src="x" />` | **toda** tag precisa fechar |
| `style="color: red"` | `style={{ color: 'red' }}` | `style` recebe um objeto |
| `onclick="..."` | `onClick={...}` | eventos em camelCase |
| Comentário `<!-- -->` | `{/* comentário */}` | |

### Regras do JSX
1. **Um único elemento raiz.** Para devolver dois irmãos sem criar uma `<div>` à toa, use um *fragmento*:
   `<> ... </>`.
2. **Chaves `{}` abrem uma "janela" para JavaScript:** qualquer *expressão* cabe ali.
   ```tsx
   <p>{magazine.title}</p>
   <p>{String(month).padStart(2, '0')}</p>
   <img src={magazine.cover_image_url} alt={`Capa de ${magazine.title}`} />
   ```
3. **Só expressões, não instruções.** Dentro de `{}` você não escreve `if` nem `for`; usa `? :`, `&&` e `.map()`
   (veja adiante).
4. **O React escapa o texto** que você insere com `{}`. Se alguém cadastrar uma revista chamada `<script>...`, ela
   aparece como texto, não executa. Isso protege contra uma classe de ataques (XSS), capítulo 13.

---

## 4. Props: os dados que o pai entrega ao filho

```tsx
interface MagazineCardProps {
  magazine: Magazine
  onDelete?: (id: string) => void
}

export function MagazineCard({ magazine, onDelete }: MagazineCardProps) {
  return <h2>{magazine.title}</h2>
}
```

```tsx
// no pai:
<MagazineCard magazine={m} onDelete={setPendingDeleteId} />
```

- Props são **somente leitura**. O filho nunca altera o que recebeu.
- Podem ser **dados** (`magazine`) ou **funções** (`onDelete`).
- Opcionais ganham `?` no tipo; o componente decide o que fazer quando faltam.

### O princípio mais importante do React: *dados descem, eventos sobem*

```
Catalog (dono da lista de revistas)
   │  desce: a revista e a função onDelete
   ▼
MagazineCard (só desenha)
   │  sobe: "o usuário clicou em Deletar a revista X" → chama onDelete(X)
   ▼
Catalog (decide o que fazer: abrir a janela de confirmação)
```

Quem tem o estado é quem pode alterá-lo. O filho **avisa**, o pai **decide**. Por isso o `MagazineCard` não
sabe nada de banco, de confirmação ou de listas: só recebe o que mostrar e chama a função quando clicam.

### `children`: o que está *entre* as tags
```tsx
<Modal onClose={fechar}>
  <p>Qualquer conteúdo aqui</p>
</Modal>
```
No `Modal`, esse conteúdo chega na prop especial `children`. Por isso o mesmo `Modal` serve ao
`ConfirmDialog` e ao formulário de edição. É **composição**: peças genéricas que se encaixam.

📁 `src/components/Modal.tsx` e `src/components/ConfirmDialog.tsx`: o `ConfirmDialog` **usa** o `Modal`.

---

## 5. Listas: `.map()` e a prop `key`

```tsx
<MagazineGallery mode={viewMode}>
  {visibleMagazines.map((magazine) => (
    <MagazineCard key={magazine.id} magazine={magazine} />
  ))}
</MagazineGallery>
```

`.map()` transforma uma lista **de dados** numa lista **de elementos**.

### Por que `key`?
O React precisa **identificar** cada item para saber, ao atualizar, quem é quem (quem entrou, saiu, mudou de
lugar). A `key` deve ser:
- **Única** entre os irmãos;
- **Estável**: o mesmo item, a mesma key (use o `id`).

⚠️ **Não use o índice** (`key={index}`) quando a lista pode mudar de ordem ou perder itens: o React confunde os
itens, e o estado interno de um card pode "pular" para outro. Use o `id`.

---

## 6. Renderização condicional

Três jeitos, todos usados no projeto:

### a) Operador `&&` (mostrar ou não mostrar)
```tsx
{magazine.cover_model && <p className="card__meta">Capa: {magazine.cover_model}</p>}
```
Se o texto existir, mostra; senão, nada. ⚠️ Cuidado com `0`: `{contagem && <p>...</p>}` mostra um `0` na tela
quando `contagem` é `0`. Use `{contagem > 0 && ...}`.

### b) Operador ternário `? :` (um ou outro)
```tsx
{magazine.cover_image_url ? (
  <img src={magazine.cover_image_url} alt={`Capa de ${magazine.title}`} />
) : (
  <div className="card__placeholder">Sem capa</div>
)}
```

### c) Retorno antecipado (`early return`)
```tsx
if (loading) return <div>Carregando...</div>
if (!session) return <AuthForm />
return <div>...a página inteira...</div>
```
📁 `Catalog.tsx`: três "versões" da página (carregando, sem login, logado) numa função só.

⚠️ **Regra dos hooks:** os `return` antecipados ficam **depois** de todos os `useState` e `useEffect`
(capítulo 05).

📁 O `AgeGate` devolve `null` quando a idade já foi confirmada: "não desenhe nada".

---

## 7. Eventos

```tsx
<button onClick={() => onDelete(magazine.id)}>Deletar</button>
<input onChange={(e) => setTitle(e.target.value)} />
<form onSubmit={handleSubmit}>
```

Pontos de atenção:

1. **Passe uma função, não o resultado dela.**
   ```tsx
   onClick={handleSave}            // ✅ passa a função; roda no clique
   onClick={handleSave()}          // ❌ roda AGORA, ao desenhar
   onClick={() => handleSave(id)}  // ✅ quando precisa de argumento, envolva numa arrow
   ```
2. **`event.preventDefault()`** no `onSubmit`: sem ele, o navegador recarrega a página ao enviar o formulário.
3. **`event.stopPropagation()`**: eventos "borbulham" dos filhos para os pais. No `Modal`, clicar no fundo escuro
   fecha a janela, mas clicar **dentro** da caixa não pode fechar. Por isso a caixa chama `stopPropagation()`.

---

## 8. Formulários: inputs controlados

```tsx
const [title, setTitle] = useState('')

<input value={title} onChange={(e) => setTitle(e.target.value)} />
```

O React é o **dono** do valor do campo: cada tecla dispara `onChange`, o estado muda, a tela redesenha com o novo
valor. Vantagens: dá para validar, limpar, preencher por código, mostrar o que foi digitado em outro lugar.

Tipos de campo no projeto (`MagazineForm.tsx`):

| Campo | Valor vem de | Exemplo |
|---|---|---|
| Texto | `e.target.value` | título, modelo da capa |
| Número | `e.target.value` (**ainda é texto**) | ano e mês; convertemos com `Number()` na hora de enviar |
| Caixa de marcar | `e.target.checked` | "Já tenho esta revista" |
| Lista (`<select>`) | `e.target.value` | condição |
| Arquivo | `e.target.files` | a capa |

### Por que ano e mês são guardados como **texto** no formulário?
```tsx
const [year, setYear] = useState(initial?.year?.toString() ?? '')
...
year: year === '' ? null : Number(year)
```
Porque o campo vazio precisa existir (`''`), e `Number('')` daria `0`, um ano falso. Guardar o texto digitado e
converter **só no envio** permite distinguir "não preenchi" (`null`) de um número real.

### Um formulário, dois modos
O `MagazineForm` recebe `initial?: Magazine`. Se vier, está em **modo edição**; se não, em **modo criação**. A
diferença se resume a valores iniciais (`initial?.title ?? ''`), um título e um texto de botão. O resto é
compartilhado. **Dois formulários quase iguais seriam duas coisas para manter, e uma sempre acabaria
desatualizada.**

---

## 9. Lendo um componente do início ao fim: `MagazineCard`

Abra `src/components/MagazineCard.tsx` e acompanhe:

1. Recebe `magazine` e três funções **opcionais** (`onDelete`, `onEdit`, `onTogglePublic`).
2. `isOwnerView = Boolean(onTogglePublic || onEdit || onDelete)`. Se **alguma** ação foi passada, é a visão do
   dono. No catálogo público não passamos nenhuma: o mesmo componente aparece em modo leitura.
3. Calcula `date` e `meta`, **sem** `useState`: são **valores derivados** que se refazem a cada desenho.
4. Devolve JSX: capa (ou placeholder), título, textos secundários, etiquetas e (só para o dono) botões.

Isso ilustra o poder de **props opcionais**: um componente, duas aparências.

---

## 10. O que acontece quando algo muda (visão rápida)

```
clique → setState(novo valor) → React chama o componente de novo → compara o JSX novo com o anterior
→ atualiza SÓ o que mudou na tela
```
O capítulo 05 explora isso a fundo.

---

## Erros comuns
| Sintoma | Causa | Solução |
|---|---|---|
| `Each child in a list should have a unique "key"` | Faltou `key` no `.map()` | Adicione `key={item.id}` |
| `Adjacent JSX elements must be wrapped` | Dois elementos na raiz | Envolva em `<>...</>` |
| Página recarrega ao enviar o formulário | Faltou `preventDefault()` | Adicione no `onSubmit` |
| Função roda sozinha ao abrir a tela | Escreveu `onClick={fazer()}` | `onClick={fazer}` ou `() => fazer()` |
| `0` aparece solto na tela | Usou `{numero && ...}` | `{numero > 0 && ...}` |
| Campo "trava" e não deixa digitar | `value` sem `onChange` | Adicione o `onChange` que atualiza o estado |

## Exercícios
1. Crie `src/components/StatCard.tsx` que receba `label: string` e `value: number` e mostre os dois.
   Use-o em `Catalog.tsx` para exibir "Total", "Públicas" e "Procurando". *(Sim, são três cards; reaproveitar é
   o ponto.)*
2. Modifique `MagazineCard` para mostrar um selo "NOVA" quando a revista tiver `year` igual ao ano atual.
3. Crie um componente `EmptyState` com a mensagem "Nenhuma revista" e use no lugar do parágrafo atual.
4. Em `ConfirmDialog`, aceite uma prop `confirmLabel` com padrão `'Apagar'`.
5. **Desafio:** faça um componente `Rating` com cinco estrelas clicáveis que controla uma nota de 1 a 5
   (guardada em estado no pai e passada por props).

✅ **Checklist do capítulo 04**
- [ ] Explico "tela = função(dados)".
- [ ] Diferencio componente, JSX e props.
- [ ] Explico "dados descem, eventos sobem" com `MagazineCard` + `Catalog`.
- [ ] Sei por que `key` existe e por que não usar o índice.
- [ ] Uso `&&`, ternário e retorno antecipado na hora certa.
- [ ] Explico um input controlado e por que `preventDefault` é necessário.
- [ ] Explico por que o formulário guarda o ano como texto.

Próximo: [05. React: estado, efeitos e hooks](05-react-estado-efeitos-hooks.md).
