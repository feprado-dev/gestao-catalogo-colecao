# 07. CSS moderno

## Objetivo
Entender como o visual do app é construído: o modelo de caixas, a cascata, variáveis e temas, flexbox, grid,
responsividade e animações. Ao final, você deve conseguir alterar qualquer aspecto visual do app **sabendo o
que está fazendo**, não por tentativa e erro.

> **Como estudar este capítulo:** deixe `npm run dev` rodando, abra o site e o painel de inspeção do navegador
> (clique direito → *Inspecionar*). Cada seção aqui pode ser testada **ao vivo** nesse painel: você edita o CSS
> e vê o resultado na hora, sem salvar nada.

---

## 1. Como o CSS funciona

CSS são **regras**: *seletor* (quem) + *declarações* (o que muda).

```css
.card__title {                       /* seletor: elementos com a classe card__title */
  font-size: 1.2rem;                 /* declaração: propriedade: valor; */
  text-transform: uppercase;
}
```

### Seletores que o projeto usa

| Seletor | Pega | Exemplo |
|---|---|---|
| `.classe` | Elementos com `class="classe"` | `.card` |
| `elemento` | Todas as tags daquele tipo | `button`, `body` |
| `A B` | `B` **dentro** de `A` | `.gallery--mosaico .card__title` |
| `A > B` | `B` **filho direto** de `A` | `.gallery__scroller > .card` |
| `A, B` | Os dois | `h1, h2, h3, p` |
| `[atributo='valor']` | Pelo atributo | `button[aria-pressed='true']` |
| `:hover` | Quando o mouse está sobre | `.card:hover` |
| `:focus-visible` | Foco **pelo teclado** | `:focus-visible` |
| `:focus-within` | Quando algo **dentro** tem foco | `.card:focus-within` |
| `:root` | O elemento mais externo (`<html>`) | onde moram as variáveis |

### A cascata e a especificidade (por que "às vezes não pega")
Quando duas regras mexem na mesma coisa, quem ganha? Três critérios, nesta ordem:
1. **Especificidade:** seletor mais específico vence (`#id` > `.classe` > `elemento`).
2. **Ordem:** a regra **mais abaixo** no arquivo vence um empate.
3. **Herança:** o que não for definido é herdado do pai (`color`, `font`), mas `margin` e `border` não.

⚠️ **Caso real do projeto:** os botões que são **links** (`<a class="btn">`) apareceram **roxos**. O motivo: o
navegador já tem uma regra de cor para `<a>`, e a nossa `.btn` não definia `color`. A correção foi escrever
`color: var(--text)` na `.btn`. Quando algo tem cor "inexplicável", é uma regra do navegador que você não
sobrescreveu.

---

## 2. O modelo de caixas

Todo elemento é uma caixa com quatro camadas:

```
┌────────────── margin (espaço de fora) ───────────────┐
│  ┌──────────── border (borda) ────────────────────┐  │
│  │  ┌────────── padding (espaço de dentro) ─────┐ │  │
│  │  │            conteúdo                       │ │  │
│  │  └───────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

📁 `index.css` tem, logo no começo:
```css
*, *::before, *::after { box-sizing: border-box; }
```
Isso muda a conta: com `border-box`, a `width: 200px` **já inclui** padding e borda. Sem isso, `width: 200px` +
`padding: 20px` viraria 240px, e as caixas "estourariam" o layout. Quase todo projeto moderno começa assim.

Esse bloco, junto com `h1, h2, h3, p { margin: 0 }`, forma o **reset**: zera diferenças entre navegadores para
você controlar o espaçamento.

---

## 3. Unidades

| Unidade | Significa | Quando usar |
|---|---|---|
| `px` | Pixel fixo | Bordas finas, sombras |
| `rem` | Múltiplo do tamanho da fonte da página (16px) | **Tamanhos de texto e espaços** (respeita o ajuste do usuário) |
| `em` | Múltiplo da fonte do **elemento** | Espaços que acompanham o texto |
| `%` | Porcentagem do pai | Larguras |
| `vw` / `vh` | 1% da largura/altura da janela | Tipografia fluida, telas cheias |
| `svh` | Altura da janela **sem** as barras do celular | `min-height: 100svh` (evita "pulos") |
| `fr` | Fração do espaço livre (só no grid) | `1fr 1fr` |

**Por que `rem` em vez de `px` para texto?** Quem aumenta a fonte do navegador por necessidade visual espera que o
site acompanhe. `rem` acompanha; `px` não.

---

## 4. Variáveis CSS e temas ⭐ (o coração do visual)

📁 `src/index.css`:

```css
:root {
  --bg: #000000;
  --surface: #0d0d0d;
  --text: #f2f2f2;
  --muted: #9a9a9a;
  --accent: #ff6b8a;
  --radius: 8px;
  --gutter: clamp(1rem, 1.6vw, 1.75rem);
}

:root[data-theme='light'] {
  --bg: #ffffff;
  --text: #111111;
  --muted: #6b6b6b;
  --accent: #d6336c;
}
```

Uso: `background: var(--bg);`.

### Como funciona o tema claro/escuro
1. As cores moram **só** nas variáveis.
2. O padrão (escuro) está em `:root`.
3. `:root[data-theme='light']` **redefine** as mesmas variáveis quando o `<html>` tem `data-theme="light"`.
4. O `useTheme.ts` troca esse atributo: `document.documentElement.dataset.theme = theme`.

Resultado: **o app inteiro troca de visual sem uma única linha de CSS a mais**, porque *todo* o CSS usa
`var(--text)`, `var(--bg)` etc. Para criar um terceiro tema (azul, por exemplo), basta um bloco novo com as variáveis.

### A regra da separação
Cores, tamanhos de espaçamento e raios ficam em **variáveis**. O resto do CSS **só as consome**. Se você achar um
`#f2f2f2` solto no meio de `App.css`, é um sinal de que deveria ser `var(--text)`.

⚠️ **Nuance:** o texto sobre fotos (o mosaico, por exemplo) usa `#fff` fixo de propósito. Ele fica sobre um
degradê escuro e precisa ser branco **nos dois temas**. Variáveis temáticas mudariam a cor e perderiam o contraste.

### Contraste
Quando você testou `--bg: #77AD78` (verde) o texto quase sumiu. Contraste é medido por uma razão: o mínimo
recomendado para texto é **4,5:1**. Verde claro com texto quase branco dá cerca de 2,3:1. Ferramenta para checar:
`webaim.org/resources/contrastchecker`.

---

## 5. Flexbox: alinhar em **uma** dimensão

```css
.toolbar {
  display: flex;
  flex-wrap: wrap;                    /* pode quebrar de linha */
  align-items: center;                /* alinhamento no eixo transversal */
  justify-content: space-between;     /* distribuição no eixo principal */
  gap: 1rem;                          /* espaço entre os itens */
}
```

| Propriedade | Faz |
|---|---|
| `display: flex` | Liga o flex no **pai**; os filhos viram "itens" |
| `flex-direction: column` | Eixo principal vertical (o padrão é horizontal) |
| `justify-content` | Posiciona ao longo do eixo **principal** |
| `align-items` | Posiciona no eixo **transversal** |
| `gap` | Espaço entre itens (bem melhor que margens soltas) |
| `flex-wrap: wrap` | Itens quebram de linha em vez de espremer |
| `flex: 1 1 640px` | "cresce, encolhe, **base** 640px", como a caixa de filtros |

### Centralizar tudo (a receita mais pedida do CSS)
```css
.overlay {
  position: fixed; inset: 0;                   /* cobre a tela inteira */
  display: flex;
  align-items: center;                         /* centraliza na vertical */
  justify-content: center;                     /* centraliza na horizontal */
}
```
📁 É assim que a janela do `Modal` e o `AgeGate` ficam no meio da tela.

---

## 6. Grid: alinhar em **duas** dimensões

```css
.gallery--vertical {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));    /* 4 colunas iguais */
  gap: 2.5rem var(--gutter);                            /* gap: linhas colunas */
}
```

Leia `repeat(4, minmax(0, 1fr))`: "4 colunas, cada uma ocupando uma fração igual do espaço, **mínimo zero**".
O `minmax(0, ...)` evita que uma imagem larga empurre a coluna para fora.

### Grade que se adapta sozinha
No mosaico:
```css
grid-template-columns: repeat(auto-fill, minmax(clamp(105px, 11vw, 170px), 1fr));
```
"Encaixe quantas colunas **couberem**, cada uma com pelo menos 105 a 170px." Em tela larga, 8 colunas; em
celular, 3. Sem nenhuma media query.

### Flex ou grid?
- **Flex:** uma linha ou coluna de itens (menus, barras de ferramentas, botões lado a lado).
- **Grid:** uma grade (galerias, layouts de página).

---

## 7. Responsividade

### `clamp(mínimo, ideal, máximo)`
```css
font-size: clamp(3rem, 13vw, 9rem);      /* o título da página inicial */
--gutter: clamp(1rem, 1.6vw, 1.75rem);   /* as margens laterais */
```
O valor cresce com a janela (`13vw`), mas **nunca** abaixo de 3rem nem acima de 9rem. Uma linha substitui várias
media queries.

### Media queries: regras que só valem em certas condições
```css
@media (max-width: 1180px) { .gallery--vertical { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 820px)  { .gallery--vertical { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
```
Em tela estreita, a grade passa de 4 para 3 e para 2 colunas.

Há também media queries de **preferência e capacidade**, não de largura:

| Query | Pergunta |
|---|---|
| `(hover: hover)` | O aparelho tem mouse? (as ações do card só aparecem no hover) |
| `(hover: none)` | É toque? (no mosaico, o texto fica sempre visível) |
| `(prefers-reduced-motion: reduce)` | O usuário pediu menos animação? |

📁 No fim de `App.css`: respeitar `prefers-reduced-motion` é acessibilidade (capítulo 14).

🧪 **Experimente:** no navegador, abra o painel de inspeção, ative o modo "dispositivo" (ícone de celular) e vá
diminuindo a largura. Veja a grade mudar de 4 para 2 colunas.

---

## 8. Imagens: `aspect-ratio` e `object-fit`

```css
.card__media { aspect-ratio: 3 / 4; overflow: hidden; background: var(--placeholder); }
.card__cover { width: 100%; height: 100%; object-fit: cover; }
```

- **`aspect-ratio: 3 / 4`** reserva o espaço da capa **antes** de a imagem carregar, então a página não "pula"
  (o placeholder cinza que você viu).
- **`object-fit: cover`** faz a imagem preencher a caixa **cortando** o excesso, sem esticar.
  (`contain` mostraria inteira, deixando faixas vazias.)

---

## 9. Posicionamento

| Valor | Comportamento | No projeto |
|---|---|---|
| `static` | Normal (padrão) | |
| `relative` | Normal, mas vira "âncora" para filhos `absolute` | `.card` no mosaico |
| `absolute` | Posicionado em relação ao ancestral `relative` | o texto sobre a capa no mosaico |
| `fixed` | Fixo em relação à **janela** | o `overlay` do modal |
| `sticky` | Rola normalmente e "gruda" no topo | o cabeçalho do site |

O mosaico é um bom exemplo: o card é `position: relative`, e o bloco `.card__info` é `position: absolute`
com `inset: auto 0 0 0` (colado embaixo, ocupando a largura toda), ficando **por cima** da imagem.

`z-index` decide quem fica na frente: cabeçalho `10`, janelas `20`, aviso de idade `100`.

---

## 10. Transições e efeitos

```css
.card__cover { transition: transform 0.5s ease; }
.card:hover .card__cover { transform: scale(1.025); }
```
A transição suaviza a mudança entre o estado normal e o `:hover`. Mexer em `transform` e `opacity` é barato para
o navegador; mexer em `width` ou `height` é caro.

### Outros efeitos usados
| Efeito | Onde | O quê |
|---|---|---|
| `backdrop-filter: blur(10px)` | Cabeçalho, janelas | Desfoca o que está atrás (efeito "vidro") |
| `color-mix(in srgb, var(--bg) 88%, transparent)` | Cabeçalho | Mistura cores: o fundo do cabeçalho é 88% da cor do tema |
| `linear-gradient(transparent, rgba(0,0,0,.88))` | Mosaico | Degradê que escurece a base da capa para o texto ler |
| `box-shadow` | Janelas | Sombra |

### Texto com degradê (o título da home)
```css
.hero__title {
  background: linear-gradient(180deg, var(--text) 25%, var(--muted) 100%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent;
}
```
Truque: pinta o **fundo** com o degradê e o **recorta no formato das letras**, tornando o texto transparente.
As cores vêm do tema, por isso funciona no claro e no escuro.

---

## 11. Rolagem com "ímã" (*scroll snap*): o modo horizontal

```css
.gallery__scroller {
  display: flex;
  gap: var(--gutter);
  overflow-x: auto;                       /* rola para os lados */
  overscroll-behavior-x: contain;         /* não "vaza" a rolagem para a página */
  scroll-snap-type: x proximity;          /* ímã suave */
}
.gallery__scroller > .card {
  flex: 0 0 clamp(230px, 26vw, 445px);    /* não cresce, não encolhe, largura fixa */
  scroll-snap-align: start;               /* ao parar, alinha o card à esquerda */
}
```
- `flex: 0 0 <largura>` impede o flex de espremer os cards: eles ficam em uma fila que **ultrapassa** a tela, e o
  `overflow-x: auto` cria a rolagem.
- `proximity` (ímã *suave*) em vez de `mandatory` (ímã *forte*): o forte brigava com a roda do mouse, que rola em
  pequenos passos.

---

## 12. Ícones em SVG

Os botões de visualização usam **SVG inline**: desenhos feitos de linhas, escritos no código.

```tsx
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" ...>
  <rect x="4" y="3" width="11" height="18" rx="1.5" />
  ...
</svg>
```
- **`viewBox="0 0 24 24"`** é a "folha" onde você desenha, em coordenadas de 0 a 24, e que escala sem perder
  qualidade.
- **`stroke="currentColor"`** faz o traço **herdar a cor do texto**, então o ícone troca de cor com o tema e com
  o `:hover`, sem imagem extra.
- Vantagens sobre PNG: nítido em qualquer tamanho, leve, estilizável por CSS.

---

## 13. HTML nativo que dispensa JavaScript

```tsx
<details className="panel">
  <summary>+ Nova revista</summary>
  <MagazineForm ... />
</details>
```
O `<details>` abre e fecha **sozinho**, acessível pelo teclado, sem uma linha de JS.
**Antes de escrever JavaScript, pergunte se o HTML já faz.**

---

## 14. Nomeando classes: BEM

Convenção `bloco__elemento--modificador`:

```
.card                → o bloco
.card__title         → uma parte DO card
.card--missing       → uma variação do card
.gallery--mosaico    → uma variação da galeria
```
Dá previsibilidade: ao ver `card__title`, você sabe que pertence ao card.

⚠️ **Caso real do projeto:** a classe foi escrita no CSS como `.gallery--mosaic` (sem o **o**), mas o código gera
`gallery--mosaico` a partir do nome do modo. Nenhuma regra do mosaico foi aplicada, e a tela mostrou uma única
capa gigante. O TypeScript **não** pega erros de classe CSS (são só texto). Só olhando o resultado na tela é
que apareceu. **Teste visual não substitui teste automático, nem o contrário.**

---

## 15. Dicas de depuração visual

1. **Inspecione** o elemento (clique direito → Inspecionar). Veja quais regras se aplicam e quais estão riscadas
   (perderam na cascata).
2. **Borda temporária:** `outline: 1px solid red` num elemento mostra o tamanho real da caixa.
3. **Consulte o "Computed"** (estilo calculado): mostra o valor final de cada propriedade.
4. Quando "nada acontece", suspeite de: nome de classe diferente, regra sobrescrita por outra mais específica,
   ou arquivo CSS não importado.

---

## Erros comuns
| Sintoma | Causa | Solução |
|---|---|---|
| Elemento ultrapassa a tela | Falta `box-sizing: border-box` ou largura fixa grande | Reset + `max-width: 100%` |
| `margin: 0 auto` não centraliza | Elemento sem largura definida | Dê `max-width`/`width` |
| Imagem esticada | Falta `object-fit` | `object-fit: cover` |
| Regra "ignorada" | Outra mais específica ou mais abaixo vence | Inspecione e compare especificidade |
| `z-index` sem efeito | O elemento é `static` | Use `position: relative` (ou outro) |
| Cor de link inesperada | Regra do navegador para `<a>` | Defina `color` |

## Exercícios
1. Em `index.css`, mude `--bg` e `--text` para um tema "sépia" novo. Quantas linhas mexeu? Quantos lugares do app
   mudaram?
2. Crie um **terceiro tema** (`[data-theme='azul']`) e faça o botão de tema alternar entre três.
3. Mude o número de colunas do modo vertical de 4 para 5 em telas grandes e ajuste os pontos de quebra.
4. No mosaico, faça o texto aparecer com uma animação de subida suave (`transform: translateY`).
5. Crie um estado de **carregamento** para os cards: um bloco cinza pulsando (`@keyframes` + `animation`).
6. **Desafio:** reproduza só o CSS do `Modal` (overlay + caixa centralizada) num HTML solto, sem React.

✅ **Checklist do capítulo 07**
- [ ] Explico as quatro camadas da caixa e o que `border-box` muda.
- [ ] Decido entre flex e grid para um layout novo.
- [ ] Leio `repeat(auto-fill, minmax(...))` e `clamp(...)`.
- [ ] Explico como o tema claro/escuro funciona só com variáveis.
- [ ] Resolvo um conflito de cascata inspecionando o elemento.
- [ ] Explico por que o ícone SVG usa `currentColor`.
- [ ] Conto os dois casos reais: o link roxo e a classe `--mosaic`.

Próximo: [08. Banco de dados e Supabase](08-banco-de-dados-supabase.md).
