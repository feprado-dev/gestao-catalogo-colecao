# 15. Reconstruindo do zero: o roteiro passo a passo

## Objetivo
Refazer o app **você mesmo**, numa pasta nova, em 15 etapas pequenas. Cada etapa tem uma **entrega**, um
**teste de aceite** (como saber que acabou) e **dicas para quando travar**. Este é o capítulo que transforma
"entendi quando vi" em "sei fazer sozinho".

---

## Regras do jogo

1. **Crie um projeto novo.** Nome sugerido: `vault-keeper-estudo`, em `~/dev/`. **Não mexa** no original.
2. **Um projeto Supabase de estudo**, separado do real (você criará na etapa 6). Nada de testar em dados reais.
3. **Digite tudo à mão.** Os blocos aqui são **esqueletos e dicas**, não o código final. A graça é você completar.
4. **Só olhe o projeto original depois de tentar** por pelo menos 15 minutos. Quando olhar, entenda *por que* é
   assim, e **escreva de novo com suas palavras**, sem copiar.
5. **Um commit por etapa** (ou mais). Mensagem que explica o porquê.
6. **Antes de cada commit:** `npx tsc -b`, `npm test` (quando houver) e o app abrindo no navegador.
7. Se uma etapa travar por mais de uma hora, **volte ao capítulo** correspondente, releia e tente de novo.
   Travar é parte do processo, não sinal de que você não serve.

> **Ordem importa.** Cada etapa se apoia na anterior. Não pule.

---

## Mapa das etapas

| # | Etapa | Capítulos de apoio | Tempo |
|---|---|---|---|
| 0 | Projeto novo e ambiente | 01 | 30 min |
| 1 | Tipos e lista estática | 03, 04 | 1 h |
| 2 | Estado: adicionar e apagar em memória | 05 | 2 h |
| 3 | Visual com variáveis e tema | 07 | 3 h |
| 4 | Lógica pura com TDD: filtros | 10 | 3 h |
| 5 | Rotas | 06 | 1 h |
| 6 | Supabase de estudo: tabela e RLS | 08 | 2 h |
| 7 | Login e sessão | 05, 08 | 2 h |
| 8 | CRUD ligado ao banco | 09 | 3 h |
| 9 | Upload de capas | 08, 09 | 3 h |
| 10 | Edição reaproveitando o formulário | 04, 05 | 2 h |
| 11 | Catálogo público e modos de visualização | 07, 08 | 4 h |
| 12 | Importação em massa com TDD | 10 | 3 h |
| 13 | Deploy | 12 | 2 h |
| 14 | Revisão: segurança, acessibilidade e backlog | 13, 14 | 4 h |

---

## Etapa 0: projeto novo e ambiente

```bash
cd ~/dev
npm create vite@latest vault-keeper-estudo -- --template react-ts
cd vault-keeper-estudo
npm install
npm run dev
git init -b main
git add -A
git commit -m "Projeto inicial (Vite + React + TypeScript)"
```
**Entrega:** a página de exemplo do Vite abre em `localhost:5173`.
**Aceite:** `git log --oneline` mostra 1 commit; `git status` está limpo.
**Se travar:** `ENOENT package.json` → você não está dentro da pasta (capítulo 01, seção 1).

Limpeza inicial: apague o conteúdo de `src/App.tsx` e `src/App.css` e deixe só um `<h1>` para começar do zero.

---

## Etapa 1: tipos e lista estática

**Faça:**
1. `src/types.ts`: defina `Condition` (união literal) e a interface `Magazine`. Comece **enxuto**: `id`, `title`,
   `year`, `acquired`. Você acrescenta campos depois.
2. `src/components/MagazineCard.tsx`: recebe `magazine` por props e mostra título e ano.
3. Em `App.tsx`, crie um array de 4 revistas **fixas** e desenhe com `.map()` e `key`.

Esqueleto:
```tsx
interface MagazineCardProps { magazine: Magazine }
export function MagazineCard({ magazine }: MagazineCardProps) {
  return ( /* article, h2, p */ )
}
```
**Entrega:** 4 cards na tela.
**Aceite:** se você trocar o ano de uma revista no array, a tela muda. Se escrever `condition: 'Otimo'`, o IntelliJ
sublinha.
**Se travar:** `Each child should have a key` → capítulo 04, seção 5.

---

## Etapa 2: estado: adicionar e apagar em memória

**Faça:**
1. Mova o array para um `useState<Magazine[]>`.
2. Crie `MagazineForm` com **um estado por campo** (título, ano, "já tenho"). Ao enviar, chame uma função `onSubmit`
   recebida por props. Lembre do `event.preventDefault()`.
3. No `App`, a função `handleAdd` coloca a revista nova **no início** (nova lista, nunca `push`).
4. Botão "Deletar" no card → chama `onDelete(id)` → o `App` filtra com `.filter`.
5. Antes de apagar, abra um **`ConfirmDialog`**. Use um estado `pendingDeleteId: string | null`. Escreva o
   `Modal` com `children`, fechando ao clicar no fundo (`stopPropagation` na caixa!) e com **Esc** (efeito com limpeza).

**Entrega:** adicionar e apagar funcionam; apagar pede confirmação.
**Aceite:** recarregar a página volta ao estado inicial (esperado: ainda não há banco).
**Se travar:** a lista não atualiza → você alterou o array direto (capítulo 05, seção 2).

---

## Etapa 3: visual com variáveis e tema

**Faça:**
1. `src/index.css`: declare as variáveis em `:root` (`--bg`, `--surface`, `--text`, `--muted`, `--border`,
   `--accent`, `--radius`, `--gutter`), o reset (`box-sizing`, margens) e `:focus-visible`.
2. Crie `[data-theme='light']` com os mesmos nomes e valores claros.
3. Hook `useTheme` (estado + `localStorage` com `try/catch` + `document.documentElement.dataset.theme`).
4. Botão de tema no cabeçalho.
5. Em `App.css`: cabeçalho fixo (`position: sticky`), grade com `repeat(4, minmax(0, 1fr))`, card com
   `aspect-ratio: 3 / 4` e `object-fit: cover`, `@media (max-width: 820px)` para 2 colunas.
6. Antes de terminar, **inspecione** no navegador e teste a largura de celular.

**Entrega:** visual escuro e claro, responsivo.
**Aceite:** nenhuma cor literal (`#...`) em `App.css`, só `var(--...)`. O tema persiste ao recarregar.
**Se travar:** a troca de tema não pega → o atributo no `<html>` está certo? Inspecione.

---

## Etapa 4: lógica pura com TDD: filtros

```bash
npm install -D vitest
npm pkg set scripts.test="vitest run" scripts.test:watch="vitest"
```

**Faça** (nesta **ordem**, é o ponto):
1. `src/lib/filters.test.ts`: escreva os testes **antes**, com uma fábrica `makeMagazine(overrides)`. Cubra:
   sem filtros, busca por título, busca ignorando acento e maiúscula, filtro de status, ordenação por ano e por
   título, **lista vazia**, e **não alterar a lista original**.
2. Rode `npm test`: **tudo falha** (o módulo não existe). 🔴
3. Escreva `src/lib/filters.ts` (`Filters`, `defaultFilters`, `applyFilters`), o mínimo para passar. 🟢
4. Refatore sem quebrar. 🔵
5. Componente `CatalogFilters` (campo de busca + selects) controlado por props.
6. No `App`: `const visible = applyFilters(magazines, filters)`. **Não** crie estado para a lista filtrada.

Dica para a busca sem acentos: `text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()`.

**Entrega:** busca, filtro e ordenação funcionando; testes passando.
**Aceite:** estrague uma linha de `applyFilters` de propósito: algum teste **tem** que falhar. Se nenhum falhar,
faltam testes.

---

## Etapa 5: rotas

```bash
npm install react-router-dom
```
**Faça:** `BrowserRouter` no `App`; rotas `/` (Home), `/catalog` (Catálogo), `*` (404); menu com `NavLink`
(com `end` no `/`); mova o catálogo para `src/pages/Catalog.tsx`. Crie as pastas `pages/`, `components/`, `hooks/`,
`lib/` aplicando o "teste das quatro perguntas" (capítulo 06).

**Entrega:** navegar entre páginas sem recarregar.
**Aceite:** digitar `/qualquer-coisa` mostra a página 404; o item de menu ativo fica destacado.

---

## Etapa 6: Supabase de estudo: tabela e RLS

1. Crie uma conta/projeto **novo** no Supabase (nome: `vault-keeper-estudo`).
2. No **SQL Editor**, crie a tabela. **Melhore o original** desde já: coloque a chave estrangeira.
```sql
create table public.magazines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  year integer,
  -- complete: month, issue, condition (com check), cover_model, acquired, cover_image_url, is_public, timestamps
);
alter table public.magazines enable row level security;
-- escreva as 4 políticas do dono (select, insert, update, delete)
```
3. Crie `.env.local` (confira que está no `.gitignore`!) e `src/lib/supabase.ts` com o `throw` de segurança.

**Entrega:** tabela com RLS e políticas; cliente criado.
**Aceite (o teste de ataque):** no console do navegador, **sem login**, consulte a tabela com `fetch`. Tem que
voltar `[]`. Depois, comente: *"por que `[]` e não um erro?"*
**Se travar:** variável `undefined` → falta o `VITE_` ou reiniciar o `npm run dev` (capítulo 01, seção 5).

---

## Etapa 7: login e sessão

**Faça:**
1. No painel: crie **um** usuário (Authentication → Users) com e-mail e senha **de teste**.
2. `useSession`: `getSession()` uma vez + `onAuthStateChange` + `unsubscribe` na limpeza + `loading`.
3. `AuthForm` só com login (`signInWithPassword`), mostrando o `error.message`.
4. Em `Catalog`: `loading` → "Carregando..."; sem sessão → `AuthForm`; com sessão → catálogo. **Os `return`
   antecipados depois dos hooks.**
5. Botão **Sair** (`supabase.auth.signOut()`).

**Entrega:** login e logout funcionando; recarregar mantém a sessão.
**Aceite:** o `AuthForm` **não** chama nada no `Catalog` ao dar certo (a tela troca sozinha pelo `useSession`).

---

## Etapa 8: CRUD ligado ao banco

**Faça:**
1. `src/lib/magazineService.ts`: `listMyMagazines(userId)`, `addMagazine`, `updateMagazine`, `deleteMagazine`,
   `setMagazinePublic`. Todas com `if (error) throw error`.
2. `Catalog`: carregue em um `useEffect` com `cancelled`; `handleAdd`/`confirmDelete` com `try/catch` e a regra
   "espere o banco antes de mudar a tela". Mostre `error` em vermelho.
3. Use a **forma funcional** do `setMagazines` desde o começo (corrija o ponto fraco do original).

**Entrega:** os dados sobrevivem a recarregar.
**Aceite:** crie uma segunda conta de teste: ela **não** vê as revistas da primeira. (É o RLS.) Derrube a
internet e tente apagar: o erro aparece **e a revista continua na tela**.

---

## Etapa 9: upload de capas

**Faça:**
1. Bucket `magazine-covers` público + as políticas de Storage por pasta (capítulo 08).
   **Melhore o original:** defina `file_size_limit` e `allowed_mime_types` no bucket.
2. `uploadCover(file, userId)` (caminho `userId/uuid.ext`) e `removeCover(url)` (`pathFromUrl`).
3. No formulário: campo de arquivo, **prévia** com `URL.createObjectURL` (e `revokeObjectURL` na limpeza), validação
   de tipo e tamanho.
4. `handleAdd`: upload → gravação → **compensação** se a gravação falhar. `deleteMagazine`: linha → arquivo.

**Entrega:** revistas com capa.
**Aceite:** simule uma falha na gravação (quebre o nome de uma coluna de propósito): a imagem **não** deve
sobrar no Storage. Tente subir um `.pdf`: o **servidor** deve recusar, não só o formulário.

---

## Etapa 10: edição reaproveitando o formulário

**Faça:** `MagazineForm` com `initial?: Magazine` e `onCancel`; `useState(initial?.x ?? valorPadrão)`;
`Modal` com o formulário; `key={revista.id}`; `handleUpdate` (sobe a capa nova, atualiza, apaga a antiga).

⚠️ **Evite os bugs do original:** respeite `null` na condição (não force `'Bom'`), envie `null` (não `undefined`)
para campos esvaziados, e inclua o campo **Edição**.

**Entrega:** editar qualquer campo, inclusive trocar a capa.
**Aceite:** edite só o título de uma revista **sem condição** e confira no banco que a condição **continua** `null`.

---

## Etapa 11: catálogo público e modos de visualização

**Faça, nesta ordem (a ordem é parte da lição):**
1. Crie a **view** `public_magazines` (só colunas seguras) e dê `grant select ... to anon`.
2. Crie a página `PublicCatalog` lendo **da view**.
3. Publique. **Só depois**, remova a política que dava leitura direta da tabela ao `anon`.
4. Hook `useViewMode` (três modos, com validação do valor salvo) e `ViewModeToggle` com **ícones SVG**
   (`aria-label`, `title`, `aria-pressed`).
5. `MagazineGallery`: grade vertical, fileira horizontal com `scroll-snap`, setas, roda do mouse convertida e
   teclado; e o mosaico com o texto sobre a capa (`position: absolute`, degradê).
6. Cuide de `prefers-reduced-motion`, `:focus-within` e `(hover: none)`.

**Entrega:** os três modos e o catálogo sem login.
**Aceite:** como visitante, a tabela direta devolve `[]`, a view devolve as públicas, **sem `user_id`**.
Confira os nomes das classes CSS (o caso `--mosaic` × `--mosaico`) olhando a tela.

---

## Etapa 12: importação em massa com TDD

**Faça:**
1. **Testes primeiro** para `parseCoverFilename` (padrão completo, sublinhado simples, mês inválido, sem data,
   nome fora do padrão, arquivo sem nome, extensão com ponto no nome). 🔴
2. Escreva a função (regex com grupos opcionais, regra do século). 🟢
3. `BulkImport`: escolher vários arquivos; item com `status` (`pendente | enviando | ok | erro | duplicada`);
   duplicatas por número de edição com `Set`; envio **sequencial** com compensação; progresso; reenvio dos que
   falharam.

**Entrega:** subir 10 capas de uma vez.
**Aceite:** um arquivo com nome fora do padrão e uma edição repetida **não** quebram o lote.

---

## Etapa 13: deploy

1. Crie um repositório **no GitHub** (vazio, privado). `git remote add origin ...` e `git push -u origin main`.
2. Importe no **Vercel**; cadastre as duas variáveis (`VITE_...`) em *Production*.
3. `vercel.json` com a regra de reescrita.
4. No Supabase: **Site URL** e **Redirect URLs**.
5. Confira cada rota **recarregando** a página.

**Entrega:** site no ar.
**Aceite:** um `git push` publica sozinho; abrir `/catalog` direto funciona; o `console` não tem erros.

---

## Etapa 14: revisão final

1. **Segurança:** refaça o checklist do capítulo 13. Feche o cadastro, ligue a confirmação, tente atacar o seu RLS.
2. **Acessibilidade:** teste só com teclado, com o VoiceOver e com o Lighthouse.
3. **Backlog:** escolha **três** itens da Parte C do capítulo 14 e implemente-os, com testes onde couber.
4. Escreva um `README.md` explicando o projeto, como rodar e como foi feito o deploy.

**Entrega:** um app que você construiu, entende, defende e sabe melhorar.

---

## Como saber que aprendeu de verdade

Sem consultar nada, consiga:

- [ ] Explicar, desenhando, a viagem de um clique em "Adicionar revista" até o banco e de volta.
- [ ] Criar uma tabela nova com RLS e testá-la **como atacante**.
- [ ] Escrever, com TDD, uma função pura com casos de borda.
- [ ] Criar um hook próprio e explicar as regras dos hooks.
- [ ] Diagnosticar por que um site publicado está em branco.
- [ ] Explicar o que o git faz em cada uma das três áreas.
- [ ] Listar três lacunas de segurança de um projeto e como fechá-las.

Se conseguiu os sete, você deixou de ser iniciante.

Próximo: [16. Exercícios e desafios](16-exercicios-e-desafios.md).
