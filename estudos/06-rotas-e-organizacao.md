# 06. Rotas e organização do código

## Objetivo
Entender como um site de **uma única página** consegue ter vários endereços (`/`, `/catalog`, `/public`), como o
React Router decide qual tela mostrar e por que o projeto está organizado em pastas do jeito que está.

---

## 1. SPA: *Single Page Application*

Num site tradicional, cada clique em um link pede ao servidor **uma página HTML nova**, e o navegador a recarrega
inteira (aquele "piscar").

Numa **SPA**, o navegador baixa **uma só página** (`index.html`) e o JavaScript **troca o conteúdo** conforme o
endereço muda, sem recarregar. É mais rápido e fluido, e é o que o nosso app faz.

Para isso funcionar, algo precisa **ler o endereço** e decidir qual componente mostrar. Esse algo é o
**React Router**.

---

## 2. React Router no projeto

📁 `src/App.tsx`:

```tsx
<BrowserRouter>
  <AgeGate />
  <header className="site-header">
    <Link to="/" className="brand">PLAYBOY BRASIL</Link>
    <nav className="nav" aria-label="Principal">
      <NavLink to="/" end>HOME</NavLink>
      <NavLink to="/catalog">Minha coleção</NavLink>
      <NavLink to="/public">Catálogo Público</NavLink>
    </nav>
    ...
  </header>

  <main>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/public" element={<PublicCatalog />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </main>
</BrowserRouter>
```

### Cada peça

| Peça | Papel |
|---|---|
| `<BrowserRouter>` | Liga o roteamento ao endereço do navegador. Envolve tudo que usa rotas |
| `<Routes>` | Olha o endereço atual e desenha **apenas a primeira** `<Route>` que combinar |
| `<Route path="..." element={...}>` | "Neste endereço, mostre este componente" |
| `path="*"` | Curinga: combina com **qualquer** outro endereço, a nossa página 404. Vem por último |
| `<Link to="...">` | O `<a>` do React Router: navega **sem recarregar** a página |
| `<NavLink>` | Como o `Link`, mas ganha a classe `active` quando o endereço combina (o sublinhado do menu) |

### O detalhe do `end`
```tsx
<NavLink to="/" end>HOME</NavLink>
```
Sem o `end`, o `/` "combinaria" com **todos** os endereços (todos começam com `/`), e o HOME ficaria sempre ativo.
O `end` diz: "só vale se for **exatamente** `/`".

### O que fica fora das `<Routes>` aparece em **todas** as páginas
O cabeçalho e o `AgeGate` estão **fora** do `<Routes>`, por isso aparecem em qualquer rota. Só o miolo (`<main>`)
troca. Isso é um **layout compartilhado**.

### Link × `<a>`
Use `<Link>` para páginas **do seu app** (sem recarregar). Use `<a href>` para sites externos. 📁 O botão "Sair" do
`AgeGate` é um `<a href="https://www.google.com">`, porque leva para fora do app.

---

## 3. O problema do 404 na hospedagem (e o `vercel.json`)

Há um detalhe que pega todo iniciante. Imagine um visitante abrindo **direto**:

```
https://meusite.com/catalog
```

O servidor **não** sabe o que é `/catalog`: ele só tem `index.html`, `assets/...`. Ele procura um arquivo chamado
`catalog`, não acha e devolve **404**, antes mesmo de o React ter a chance de carregar.

A solução é mandar o servidor devolver **sempre** o `index.html`, e o React Router, já no navegador, decide a tela.

📁 `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Em português: "qualquer endereço → entregue o `index.html`". (No `npm run dev`, o Vite já faz isso sozinho, por
isso o problema só aparece depois de publicar.)

⚠️ **Se um dia o site publicado der 404 só ao recarregar uma página interna, é isto.**

---

## 4. Organização de pastas: separar por responsabilidade

```
src/
├── pages/        ← uma tela por rota
├── components/   ← peças de tela reutilizáveis
├── hooks/        ← lógica COM estado, reutilizável
└── lib/          ← lógica SEM tela + acesso a serviços
```

### Como decidir onde um arquivo vai (o "teste das quatro perguntas")

| Pergunta | Se sim → |
|---|---|
| Representa uma **rota/tela inteira**? | `pages/` |
| Desenha **um pedaço de tela** reutilizável? | `components/` |
| Usa `useState`/`useEffect` mas **não desenha** nada? | `hooks/` |
| É uma **função comum**, sem React? Ou fala com um serviço externo? | `lib/` |

| Arquivo | Pasta | Por quê |
|---|---|---|
| `Catalog.tsx` | `pages/` | É a tela da rota `/catalog` |
| `MagazineCard.tsx` | `components/` | Peça reutilizada 64 vezes |
| `useSession.ts` | `hooks/` | Estado + efeito, sem JSX |
| `filters.ts` | `lib/` | Função pura, nem sabe que React existe |
| `magazineService.ts` | `lib/` | Fala com o Supabase |
| `types.ts` | `src/` | Tipos usados por todos |

### Por que isso importa?
- **Achar as coisas:** "onde mexo para mudar a busca?" → `lib/filters.ts`.
- **Testar:** o que está em `lib/` (sem React) é fácil de testar. Foi por isso que escrevemos testes para
  `filters.ts` e `parseCoverFilename.ts`, e não para as páginas.
- **Trocar uma parte sem quebrar as outras:** se um dia o banco mudar, só `magazineService.ts` muda.

### Fluxo das dependências (quem importa quem)

```
pages  ──►  components  ──►  (outros components)
  │            │
  ├──► hooks ◄─┘
  │
  └──► lib (filters, services)  ──►  supabase.ts
```
**Regra de ouro:** `lib/` **nunca** importa de `components/` ou `pages/`. A lógica não deve depender da tela.
O sentido das setas é sempre "de quem usa para quem é usado".

---

## 5. Onde mora cada responsabilidade (um exemplo completo)

"Mostrar o catálogo público" atravessa quatro arquivos, cada um com **uma** tarefa:

| Arquivo | Tarefa |
|---|---|
| `PublicCatalog.tsx` | Montar a página: pede os dados, aplica os filtros, escolhe o que desenhar |
| `magazineService.ts` | Buscar no banco (`listPublicMagazines`) |
| `filters.ts` | Decidir quais revistas passam nos filtros (`applyFilters`) |
| `MagazineCard.tsx` | Desenhar uma revista |

Se o catálogo ficar lento, você sabe onde olhar. Se mudar o desenho do card, só um arquivo muda.

---

## 6. Convenção de nomes do projeto

| O quê | Como | Exemplo |
|---|---|---|
| Componentes e páginas | `PascalCase` (maiúscula em cada palavra), arquivo com o mesmo nome | `MagazineCard.tsx` |
| Hooks | começam com `use` | `useSession.ts` |
| Funções e variáveis | `camelCase` | `listMyMagazines` |
| Constantes fixas | `MAIÚSCULAS_COM_SUBLINHADO` | `MAX_COVER_MB`, `STORAGE_KEY` |
| Classes de CSS | minúsculas com hífen; `bloco__elemento` e `bloco--modificador` (convenção BEM) | `card__title`, `gallery--mosaico` |
| Arquivos de teste | `nome.test.ts` ao lado do arquivo testado | `filters.test.ts` |

---

## Erros comuns
| Sintoma | Causa | Solução |
|---|---|---|
| Página recarrega ao clicar num link do menu | Usou `<a href>` em vez de `<Link>` | `<Link to="...">` |
| Menu "HOME" sempre ativo | Faltou `end` no `NavLink` de `/` | `<NavLink to="/" end>` |
| 404 só ao recarregar a página (no site publicado) | Falta a regra de reescrita | `vercel.json` com `rewrites` |
| Rota nunca combina | Ordem errada: o `*` antes das outras | O curinga sempre por último |
| `useNavigate() may be used only in the context of a <Router>` | Usou o roteamento fora do `BrowserRouter` | Envolva o componente |

## Exercícios
1. Crie uma página `Sobre` em `src/pages/Sobre.tsx` e adicione a rota `/sobre` e o link no menu.
2. Faça a página 404 mostrar o endereço digitado. *(Pesquise `useLocation` do React Router.)*
3. Crie uma rota com parâmetro, `/revista/:id`, que mostre os detalhes de uma revista. *(Pesquise
   `useParams`.)*
4. Desenhe, no papel, o grafo "quem importa quem" para `Catalog.tsx`. Confira se `lib/` nunca aponta para cima.
5. **Desafio:** proteja a rota `/catalog` redirecionando para `/` quando não houver sessão (hoje o `Catalog`
   mostra o formulário de login dentro de si). Compare as duas abordagens: qual você prefere e por quê?

✅ **Checklist do capítulo 06**
- [ ] Explico a diferença entre site tradicional e SPA.
- [ ] Sei o papel de `BrowserRouter`, `Routes`, `Route`, `Link` e `NavLink`.
- [ ] Explico o `end` e o `path="*"`.
- [ ] Explico por que abrir `/catalog` direto daria 404 sem o `vercel.json`.
- [ ] Aplico o "teste das quatro perguntas" para decidir a pasta de um arquivo.
- [ ] Sei que `lib/` nunca importa de `components/` ou `pages/`.

Próximo: [07. CSS moderno](07-css-moderno.md).
