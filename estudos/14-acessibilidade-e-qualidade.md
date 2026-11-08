# 14. Acessibilidade e qualidade de código

## Objetivo
Aprender a construir interfaces que **qualquer pessoa consegue usar** (com teclado, leitor de tela, baixa visão,
celular) e a avaliar a qualidade do próprio código. No final do capítulo há uma **lista honesta de melhorias**
que o projeto ainda merece.

---

## Parte A: Acessibilidade (a11y)

### Por que importa
Acessibilidade não é "um favor para poucos". Quem navega só pelo teclado, usa um leitor de tela, tem baixa visão
ou daltonismo, ou está no celular sob o sol, é **muita gente**, e às vezes **você mesmo** (mão ocupada, tela
riscada, conexão ruim). Código acessível também é, quase sempre, **melhor para todos**.

> O abreviado **a11y** quer dizer "a" + 11 letras + "y" (*accessibility*).

---

### 1. HTML semântico: use a tag que descreve o que o elemento **é**

| Em vez de... | Use | Ganho |
|---|---|---|
| `<div class="botao" onClick>` | `<button>` | Teclado (Tab/Enter/Espaço) e leitor de tela de graça |
| `<div class="topo">` | `<header>` | O leitor de tela anuncia "banner" |
| `<div class="menu">` | `<nav aria-label="Principal">` | Pula direto para a navegação |
| `<div class="conteudo">` | `<main>` | Ponto de salto "conteúdo principal" |
| `<div class="card">` | `<article>` | Bloco independente |
| `<div class="titulo">` | `<h1>`…`<h3>` | Estrutura navegável por títulos |
| Abrir/fechar com JS | `<details>`/`<summary>` | Funciona sem JS e com teclado |

📁 **No projeto:** `App.tsx` usa `<header>`, `<nav aria-label="Principal">`, `<main>`; o `MagazineCard` é um
`<article>`; os painéis usam `<details>`.

**Regra de ouro:** se existe uma tag nativa para o que você quer, **use-a**. Reinventar um botão com `<div>` significa
reconstruir à mão o foco, o teclado e a semântica que o `<button>` já traz.

### 2. Hierarquia de títulos
Os leitores de tela permitem **pular de título em título**, como num índice. Por isso:
- **Uma** `<h1>` por página, descrevendo-a.
- Depois `<h2>`, `<h3>`... **sem pular níveis**.

⚠️ **Achado real:** `PublicCatalog.tsx` hoje tem `<h1></h1>` **vazio** (uma decisão de design). Para um leitor de
tela, a página fica **sem título**. A solução que mantém o visual limpo é um título "só para leitores de tela":
```css
.sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
```
```tsx
<h1 className="sr-only">Catálogo público</h1>
```
Invisível na tela, lido em voz alta.

### 3. Texto alternativo nas imagens (`alt`)
```tsx
<img src={url} alt={`Capa de ${magazine.title}`} loading="lazy" />      // descreve a imagem
<img src={preview} alt="" />                                            // decorativa: alt VAZIO
```
- Imagem **informativa** → `alt` descritivo ("Capa de Joana Prado Feiticeira").
- Imagem **decorativa** → `alt=""` (o leitor a ignora).
- **Nunca** omita o atributo: o leitor leria o nome do arquivo.

📁 O `BulkImport` usa `alt=""` nas miniaturas, porque o título já está ao lado.

### 4. Formulários: todo campo tem um rótulo
```tsx
<label>
  Título
  <input value={title} onChange={...} />
</label>
```
Envolver o `<input>` no `<label>` liga os dois: clicar no texto foca o campo, e o leitor de tela diz "Título,
campo de texto". Um campo **sem** rótulo é um campo mudo para quem não enxerga.

Onde o texto não é visível, use `aria-label`:
```tsx
<input aria-label={`Título de ${item.file.name}`} ... />
```

### 5. Botões só com ícone precisam de nome
Os botões do seletor de modo (`ViewModeToggle`) são **só desenho**. Sem texto, o leitor diria "botão" e mais nada.
Por isso:
```tsx
<button type="button" aria-label="Rolagem vertical" title="Rolagem vertical" aria-pressed={mode === 'vertical'}>
  <svg ... aria-hidden="true">...</svg>
</button>
```
| Atributo | Função |
|---|---|
| `aria-label` | O **nome** lido pelo leitor de tela |
| `title` | A dica que aparece ao passar o mouse |
| `aria-pressed` | Estado de botão "liga/desliga" (qual modo está ativo) |
| `aria-hidden="true"` no `<svg>` | O leitor ignora o desenho (o nome já está no botão) |

### 6. Janelas (modais)
```tsx
<div className="dialog" role="dialog" aria-modal="true">
```
- `role="dialog"` avisa que é uma janela; `aria-modal="true"` diz que o resto da página está "bloqueado".
- No `AgeGate`, `aria-labelledby="agegate-title"` liga a janela ao seu título.
- O botão principal tem `autoFocus`: o foco do teclado **já começa nele**.
- **Esc fecha** o `Modal` (um comportamento esperado de qualquer janela).

⚠️ **O que ainda falta (nossa lacuna):** o `Modal` **não prende o foco** dentro dele. Quem usa `Tab` consegue
"escapar" para a página por trás. E, ao fechar, o foco **não volta** ao botão que abriu a janela. Isso se chama
*focus trap* e *focus restore*.

### 7. Teclado: tudo que o mouse faz, o teclado também

| Tecla | Esperado |
|---|---|
| `Tab` / `Shift+Tab` | Percorre os elementos interativos |
| `Enter` / `Espaço` | Ativa botões e links |
| `Esc` | Fecha janelas |
| Setas | Rola a fileira horizontal (o `gallery__scroller` tem `tabIndex={0}`) |

🧪 **Experimente agora:** abra o site, **largue o mouse** e use só o teclado. Consegue ir ao menu, trocar o modo de
visualização, abrir e fechar uma janela? Onde você se perdeu?

### 8. Foco visível
```css
:focus-visible { outline: 2px solid var(--text); outline-offset: 2px; }
```
Quem usa o teclado precisa **ver onde está**. `:focus-visible` mostra o contorno **só** na navegação por teclado
(não ao clicar com o mouse). **Nunca** escreva `outline: none` sem substituir por outro indicador.

⚠️ **Achado real:** as ações do card (Editar, Tornar pública, Deletar) ficam **invisíveis** até o `:hover`. Para
o teclado, isso foi resolvido com `.card:focus-within`, que também as revela. Em telas de toque, `@media (hover: none)`
as mostra sempre. **Todo efeito de hover precisa de um equivalente para teclado e toque.**

### 9. Contraste de cores
O texto precisa de contraste suficiente com o fundo. WCAG (as diretrizes internacionais):
- **4,5:1** para texto normal;
- **3:1** para texto grande e componentes de interface.

📁 Quando você testou `--bg: #77AD78`, o texto `#f2f2f2` ficou em ~2,3:1 e o `--muted` quase sumiu (~1,1:1). **Por
isso as variáveis de cor mudam juntas, em pacote.**

Ferramenta: `webaim.org/resources/contrastchecker`. No navegador, o painel de inspeção mostra o contraste ao
escolher uma cor.

### 10. Movimento: `prefers-reduced-motion`
```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
  .card:hover .card__cover { transform: none; }
}
```
Quem tem enjoo com movimento ou distúrbio vestibular pede, no sistema, "menos animação". O app **respeita**. No
JavaScript, o `scrollByPage` também verifica: `behavior: reduceMotion ? 'auto' : 'smooth'`.

### 11. Idioma e título da página
`<html lang="pt-BR">`: o leitor de tela escolhe a pronúncia certa. `<title>`: o que aparece na aba e é lido
primeiro.

### 12. Tamanho dos alvos de toque
Botões muito pequenos são difíceis de tocar no celular (o recomendado é ~44px). Os botões das ações do card são
pequenos: um candidato a melhoria.

### Como testar acessibilidade
| Ferramenta | O que faz |
|---|---|
| **Só o teclado** | O teste mais barato e revelador |
| **VoiceOver** (`⌘F5` no Mac) | O leitor de tela do Mac. Navegue pelo site de olhos fechados |
| **Lighthouse** (aba no DevTools do Chrome) | Relatório automático de acessibilidade |
| **Extensão axe DevTools** | Aponta problemas específicos |
| **Zoom a 200%** | O layout continua usável? |

As ferramentas automáticas pegam só **uma parte** (~30–40%) dos problemas. O teste manual é insubstituível.

---

## Parte B: Qualidade do código

### 1. As três "redes" automáticas do projeto

| Ferramenta | Pergunta que responde | Comando |
|---|---|---|
| **TypeScript** | Os **tipos** batem? | `npx tsc -b` |
| **oxlint** | Há **práticas duvidosas**? | `npm run lint` |
| **Vitest** | A **lógica** ainda funciona? | `npm test` |

Rode as três antes de cada commit.

### 2. Os avisos do lint (e o que ensinam)
```
Catalog.tsx:34:7: warning react(set-state-in-effect)
MagazineForm.tsx:35:19: warning react(set-state-in-effect)
```
Significam: "você chama `setState` **diretamente dentro** de um efeito, o que dispara um desenho extra". Funciona,
mas há um jeito mais enxuto. **Um aviso não é erro, mas é uma pergunta que merece resposta.**

### 3. Comentários: explique o **porquê**, não o **quê**
```ts
// ❌ ruim (repete o código)
i = i + 1  // soma 1 a i

// ✅ bom (explica a decisão)
// "?? 9999" manda as revistas sem ano para o fim da lista, nas duas direções.
```
O projeto tem muitos comentários porque é material de estudo. Em código profissional, prefira **nomes bons** e
comentários só para o que não é óbvio (o *porquê*).

### 4. Os princípios que o projeto seguiu
| Princípio | Exemplo |
|---|---|
| **DRY** (*Don't Repeat Yourself*) | Um `MagazineForm` para criar e editar; um `Modal` para tudo |
| **Responsabilidade única** | `filters.ts` filtra; `magazineService.ts` fala com o banco |
| **Funções pequenas e puras** | `applyFilters`, `parseCoverFilename` |
| **Nomes que explicam** | `confirmDelete`, `listPublicMagazines`, `visibleMagazines` |
| **Falhar alto e claro** | O `throw` em `supabase.ts` quando faltam variáveis |

---

## Parte C: Lista honesta de melhorias (o "backlog" do projeto)

Uma revisão do código atual encontrou estas oportunidades. Elas formam um excelente roteiro de prática:

### 🔴 Comportamentos que merecem correção

**1. Editar uma revista sem condição grava `'Bom'` sem você pedir.**
`MagazineForm.tsx`: `useState<Condition>(initial?.condition ?? 'Bom')`. As 64 revistas importadas têm
`condition: null`. Ao abrir uma delas para editar o **título** e salvar, o formulário envia `condition: 'Bom'`, e o
banco passa a dizer "Bom" sem que ninguém tenha escolhido. *Correção:* permitir um valor "não informada" no
`<select>` e respeitar o `null`.

**2. O formulário não edita o número da edição (`issue`) nem as notas (`notes`).**
Só a importação em massa preenche `issue`. Uma revista cadastrada **pelo formulário** fica sem número, e a
detecção de duplicatas do `BulkImport` não a enxerga. *Correção:* acrescentar o campo "Edição" ao formulário.

**3. Estado desatualizado possível nos manipuladores.**
`handleAdd`, `handleUpdate`, `confirmDelete` e `handleTogglePublic` usam `setMagazines([...magazines])`, a variável
**capturada** no desenho (capítulo 05). *Correção:* a forma funcional `setMagazines((current) => ...)`.

**4. `<h1>` vazio** em `PublicCatalog.tsx`. *Correção:* título `sr-only` (Parte A, seção 2).

### 🟡 Acessibilidade

**5. O `Modal` não prende nem devolve o foco** (Parte A, seção 6).
**6. Botões de ação pequenos** para toque.
**7. Falta um rótulo "Pular para o conteúdo"** no topo, útil para teclado.

### 🟡 Estrutura

**8. `Catalog.tsx` faz coisa demais** (carrega, adiciona, edita, apaga, alterna, filtra, desenha). *Correção:*
extrair um hook `useMagazines(userId)` com todas as operações, deixando a página só com a parte visual.
**9. Os avisos do lint** (`set-state-in-effect`).
**10. Duplicação sutil de formato de data:** a mesma lógica de "mês/ano" aparece em `MagazineCard` e `BulkImport`.
*Correção:* uma função pura `formatMagazineDate` em `lib/`, **com testes** (TDD).

### 🟡 Dados e banco

**11. `user_id` sem chave estrangeira** (capítulo 08), a causa das revistas órfãs.
**12. Falta a migration "de base"** (tabela e políticas).
**13. Bucket sem limites no servidor** (capítulo 13).

### 🟢 Experiência

**14. Sem paginação ou "carregar mais":** com poucas centenas de revistas funciona (as imagens são
`loading="lazy"`), mas com milhares ficaria pesado.
**15. Sem estados de carregamento nos cards** (um bloco cinza pulsando, *skeleton*).
**16. Sem *error boundary***: um erro de código derruba a tela inteira; um componente de contenção mostraria uma
mensagem amigável.
**17. Sem testes de componentes** (capítulo 10).
**18. O título da aba é fixo** (`PLAYBOY`) em todas as páginas.

---

## Erros comuns de acessibilidade
| Erro | Consequência | Correção |
|---|---|---|
| `<div onClick>` no lugar de `<button>` | Sem teclado, sem leitor | Use `<button>` |
| Imagem sem `alt` | Leitor lê o nome do arquivo | `alt` descritivo ou `alt=""` |
| Ícone-botão sem `aria-label` | "Botão" e mais nada | Dê um nome |
| `outline: none` sem substituto | Teclado "cego" | `:focus-visible` |
| Cinza claro sobre branco | Ilegível para muitos | Confira o contraste |
| Efeito só no hover | Teclado e toque ficam sem | `:focus-within` e `(hover: none)` |

## Exercícios
1. Faça o **teste só com teclado** no site e anote cada ponto em que travou.
2. Ative o **VoiceOver** (`⌘F5`) e navegue pelo catálogo. O que foi lido de forma confusa?
3. Corrija o **achado 1** (condição `null`), com um **teste** que prove o comportamento.
4. Corrija o **achado 4**, com a classe `.sr-only`.
5. Implemente o **achado 8**: crie `useMagazines(userId)` e deixe `Catalog.tsx` bem menor.
6. Implemente o *focus trap* no `Modal` (pesquise "focus trap react" e escreva à mão antes de usar uma biblioteca).
7. Rode o **Lighthouse** em `/public` e leia o relatório de acessibilidade. Resolva o item de maior impacto.
8. **Desafio:** adicione o campo **"Edição"** ao formulário (achado 2), atualizando tipo, formulário, serviço e
   testes. Anote cada arquivo que precisou mudar.

✅ **Checklist do capítulo 14**
- [ ] Escolho a tag semântica certa em vez de `<div>`.
- [ ] Dou `alt`, rótulo e nome acessível a imagens, campos e botões-ícone.
- [ ] Navego o site só com o teclado e sei corrigir o que trava.
- [ ] Verifico contraste e respeito `prefers-reduced-motion`.
- [ ] Explico por que todo efeito de hover precisa de equivalente para teclado e toque.
- [ ] Rodo `tsc`, lint e testes antes de commitar.
- [ ] Reconheço pelo menos cinco itens do backlog e sei como corrigir cada um.

Próximo: [15. Reconstruindo do zero](15-reconstruindo-do-zero.md).
