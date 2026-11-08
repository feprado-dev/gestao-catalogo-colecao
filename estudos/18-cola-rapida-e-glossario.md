# 18. Cola rápida e glossário

Material de **consulta**: não é para ler do começo ao fim, mas para voltar quando esquecer algo.
Cada seção aponta o capítulo onde o assunto é explicado.

---

# Parte 1: Cola rápida

## Terminal (cap. 01)
```bash
pwd                          # onde estou?
ls -la                       # listar (inclui ocultos)
cd ~/dev/vault-keeper        # entrar numa pasta
cd ..                        # subir uma pasta
mkdir -p pasta               # criar pasta
cat arquivo                  # mostrar conteúdo
cp a b  /  mv a b            # copiar / mover (ou renomear)
rm arquivo                   # APAGAR (sem lixeira!)
cmd1 && cmd2                 # roda cmd2 só se cmd1 der certo
```

## npm e Vite (cap. 01, 12)
```bash
npm install                  # instala tudo do package.json
npm install pacote           # instala e registra em dependencies
npm install -D pacote        # registra em devDependencies
npm uninstall pacote
npm run dev                  # servidor local com recarga automática
npm run build                # tsc -b + vite build  →  pasta dist/
npm run preview              # serve o dist/ (o que vai para o ar)
npm test                     # testes uma vez
npm run test:watch           # testes a cada salvamento
npm run lint                 # práticas duvidosas
npm audit                    # vulnerabilidades nas dependências
npx tsc -b                   # só conferir os tipos
```
Antes de cada commit: `npx tsc -b && npm test && npm run build`.

## Git (cap. 11)
```bash
git status -sb               # situação (curta)
git diff                     # o que mudei, linha a linha
git add arquivo              # preparar um arquivo
git add -A                   # preparar TUDO (confira antes!)
git commit -m "mensagem"     # tirar a foto
git log --oneline            # histórico
git push                     # enviar ao GitHub
git pull                     # trazer do GitHub
git restore arquivo          # DESCARTAR minhas edições (sem volta)
git restore --staged arquivo # desfazer o add
git revert <código>          # desfazer um commit já enviado (cria outro)
git switch -c nome           # criar e entrar numa branch
```
Símbolos do `status`: `M` modificado · `??` novo · `A` preparado · `[ahead 1]` 1 commit sem enviar.

## JavaScript (cap. 02)
```js
const { a, b } = obj                // desestruturar
const copia = { ...obj, b: 2 }      // copiar e trocar um campo
const nova = [x, ...lista]          // copiar e acrescentar no início
obj?.campo                          // sem erro se obj for null/undefined
valor ?? 'padrão'                   // padrão só para null/undefined
lista.map(x => ...)                 // transforma cada item
lista.filter(x => ...)              // mantém os que passam
lista.find(x => ...)                // primeiro que passa (ou undefined)
lista.some(...) / .every(...)       // algum / todos passam?
lista.includes(x)                   // contém?
[...lista].sort((a, b) => a - b)    // ordenar SEM alterar a original
lista.filter(Boolean)               // tira null/undefined/''/0
texto.trim().toLowerCase()
texto.normalize('NFD').replace(/\p{Diacritic}/gu, '')   // tira acentos
String(3).padStart(2, '0')          // '03'
try { await f() } catch (e) { ... } // tratar erro de async
```

## TypeScript (cap. 03)
```ts
type Condition = 'A' | 'B'                  // união literal
interface X { a: string; b?: number | null } // ? = opcional
Omit<X, 'a'>        // sem o campo a
Partial<X>          // tudo opcional
Pick<X, 'a'>        // só o campo a
Record<K, V>        // objeto com chaves K e valores V
useState<X[]>([])   // genérico
function f(a: string): Promise<X> { }
import type { X } from './x'
valor as Condition  // afirmar um tipo (use com cuidado)
```

## React (cap. 04, 05, 06)
```tsx
function Comp({ a, onX }: Props) { return <div>{a}</div> }        // componente + props
{cond && <A />}   {cond ? <A /> : <B />}   if (!x) return <C />   // condicional
{lista.map(i => <Item key={i.id} item={i} />)}                    // lista (key = id!)
<button onClick={() => fazer(id)}>   <form onSubmit={fn}>         // eventos
<input value={v} onChange={e => setV(e.target.value)} />          // controlado
event.preventDefault()   event.stopPropagation()

const [x, setX] = useState(valorInicial)       // estado
setX(prev => prev + 1)                          // forma funcional
setLista([novo, ...lista])  // adicionar
setLista(lista.filter(i => i.id !== id))        // remover
setLista(lista.map(i => i.id === id ? { ...i, c: v } : i))   // trocar um

useEffect(() => {
  // faz algo
  return () => { /* limpeza */ }
}, [dependencias])         // [] = uma vez

const ref = useRef<HTMLDivElement>(null)       // guardar sem redesenhar
```

| Hooks: regras |
|---|
| Só no topo do componente (nunca em `if`/loop) e só em componentes ou outros hooks |
| `return` antecipado **depois** de todos os hooks |

```tsx
// Rotas
<BrowserRouter><Routes>
  <Route path="/" element={<Home />} />
  <Route path="*" element={<NotFound />} />
</Routes></BrowserRouter>
<Link to="/x">   <NavLink to="/" end>
```

## CSS (cap. 07)
```css
:root { --cor: #000; }   var(--cor)                       /* variáveis */
*, *::before, *::after { box-sizing: border-box; }        /* reset essencial */
display: flex; justify-content: center; align-items: center; gap: 1rem;
display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));   /* grade que se adapta */
font-size: clamp(1rem, 3vw, 2rem);                        /* fluido */
aspect-ratio: 3 / 4;   object-fit: cover;
position: sticky; top: 0;   position: fixed; inset: 0;
@media (max-width: 820px) { ... }
@media (hover: hover) { ... }   @media (prefers-reduced-motion: reduce) { ... }
transition: transform .3s ease;   transform: scale(1.05);
:hover  :focus-visible  :focus-within  [aria-pressed='true']
```
**Centralizar:** `display:flex; align-items:center; justify-content:center` no pai.

## SQL e Supabase (cap. 08, 09)
```sql
select * from tabela where col = 'x' order by criado desc;
select count(*) filter (where is_public) from tabela;
insert into tabela (a, b) values ('x', 1);
update tabela set a = 'y' where id = '...';
delete from tabela where id = '...';        -- SEMPRE com where; rode o select antes!
where coluna is null          -- (NÃO "= null")
a is not distinct from b      -- igualdade que trata NULL como valor
```
```ts
const { data, error } = await supabase.from('t').select('*').eq('col', v).order('c', { ascending: false })
if (error) throw error
.insert({...}).select().single()      .update({...}).eq('id', id)      .delete().eq('id', id)
supabase.auth.signInWithPassword({ email, password })    supabase.auth.signOut()
supabase.storage.from('bucket').upload(path, file)       .getPublicUrl(path)     .remove([path])
```

### Modelos de política RLS
```sql
alter table public.t enable row level security;

create policy "dono lê"     on public.t for select using (auth.uid() = user_id);
create policy "dono cria"   on public.t for insert with check (auth.uid() = user_id);
create policy "dono altera" on public.t for update using (auth.uid() = user_id);
create policy "dono apaga"  on public.t for delete using (auth.uid() = user_id);

-- Storage: só a própria pasta
... using (bucket_id = 'b' and auth.uid()::text = (storage.foldername(name))[1])

-- Limites do bucket (servidor)
update storage.buckets set file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'] where id = 'b';
```

## Vitest (cap. 10)
```ts
import { describe, expect, it } from 'vitest'
describe('assunto', () => {
  it('faz tal coisa', () => {
    expect(f(entrada)).toEqual(saida)       // objetos/arrays
    expect(x).toBe(3)                       // valores simples
    expect(obj).toMatchObject({ a: 1 })     // contém pelo menos
    expect(lista).toHaveLength(2)
  })
})
```
TDD: 🔴 teste falha → 🟢 código mínimo → 🔵 refatora.

## Vercel (cap. 12)
```bash
npx vercel@latest login | link | ls
npx vercel@latest env add NOME production
npx vercel@latest deploy --prod
```
Variáveis `VITE_*` são gravadas no build e ficam **visíveis**; mudou? **Novo deploy.**

## Atalhos do IntelliJ (Mac)
`⌘⇧O` abrir arquivo · `⌘B` ir à definição · `⇧F6` renomear com segurança · `⌥⏎` correções ·
`⌘K` commit · `⌘⇧K` push · `⌥F12` terminal · `⌘/` comentar · `⌘⇧F` buscar no projeto.

## Diagnóstico rápido
| Sintoma | Primeira coisa a olhar |
|---|---|
| `ENOENT package.json` | Pasta do terminal |
| Tela em branco no ar | Console do navegador; variáveis de ambiente |
| Lista vazia mas há dados | RLS / papel do SQL Editor |
| Tela não atualiza | Alterou estado direto em vez de criar novo |
| 404 ao recarregar | `rewrites` no `vercel.json` |
| Classe CSS "não pega" | Nome diferente entre CSS e TSX; inspecione |
| Cor de link estranha | Defina `color` (regra do navegador) |
| Ícone da aba antigo | Cache do navegador |
| Push "não enviou nada" | Faltou o commit |

---

# Parte 2: Glossário (A a Z)

**a11y**: abreviação de *accessibility* (acessibilidade).

**Alias** (Vercel): endereço amigável que aponta para a versão de produção atual.

**anon / publishable key**: chave **pública** do Supabase; só abre o que o RLS autoriza.

**API**: conjunto de "pedidos" que um sistema aceita. A API do Supabase é o que o `supabase-js` chama.

**Arrow function**: função escrita com `=>`. `(a) => a * 2`.

**async / await**: forma de escrever código que espera operações demoradas (internet) sem travar a página.

**Auth**: o serviço de login e cadastro (Supabase Auth).

**Branch**: uma "linha paralela" de commits para trabalhar sem afetar a principal.

**Build**: o processo que transforma seu código-fonte na versão final e otimizada (`dist/`).

**Bucket**: uma "pasta raiz" de arquivos no Storage.

**Cache**: cópia guardada para carregar mais rápido; pode mostrar versões antigas.

**Cascata** (CSS): regras de quem vence quando duas regras mexem na mesma coisa.

**CDN**: rede de servidores espalhados pelo mundo que entregam seus arquivos rapidamente.

**Closure**: uma função que "lembra" as variáveis do lugar onde nasceu.

**Commit**: uma "fotografia" do projeto, com mensagem, guardada no histórico do git.

**Componente**: função React que devolve um pedaço de tela.

**CRUD**: Create, Read, Update, Delete: as quatro operações básicas sobre dados.

**CSS**: linguagem de estilo (cores, tamanhos, posição).

**Deploy**: publicar uma versão do app no ar.

**DOM**: a árvore de elementos da página, que o navegador mantém e o React atualiza.

**Efeito (`useEffect`)**: código que sincroniza o React com algo de fora (rede, teclado, armazenamento).

**Estado (`useState`)**: memória do componente; quando muda, a tela é redesenhada.

**Estado derivado**: valor **calculado** a partir de outros, em vez de guardado.

**Flexbox**: layout em uma dimensão (linha ou coluna).

**Frontend / Backend**: o que roda no navegador / o que roda no servidor.

**Função pura**: mesma entrada → mesma saída, sem efeitos colaterais; fácil de testar.

**Git / GitHub**: sistema de histórico de código / site que guarda uma cópia na nuvem.

**Grid**: layout em duas dimensões.

**HMR**: *Hot Module Replacement*, a atualização instantânea da página ao salvar no `npm run dev`.

**Hook**: função do React (`useState`, `useEffect`...) ou criada por você (`useSession`) que dá estado/efeitos a um componente.

**Imutabilidade**: nunca alterar um valor existente; criar uma cópia alterada.

**Interface** (TypeScript): descrição do formato de um objeto.

**JSON**: formato de texto para dados (`{ "a": 1 }`).

**JSX**: sintaxe de HTML dentro do JavaScript.

**JWT**: texto assinado que prova quem é o usuário; o Supabase o envia em cada pedido.

**key** (React): identificador estável de um item numa lista.

**Lint**: verificação automática de práticas duvidosas (`oxlint`).

**localStorage**: pequeno armazenamento do navegador que sobrevive a fechar a aba.

**Migration**: arquivo SQL versionado que descreve uma mudança do banco.

**Minificação**: remover espaços e encurtar nomes para o arquivo ficar menor.

**Modal**: janela que aparece por cima da página.

**Mock**: substituto falso de uma peça (banco, rede) para testar.

**`null` × `undefined`**: "vazio de propósito" × "nunca recebeu valor".

**Open redirect**: ataque que usa um redirecionamento para levar a vítima a um site falso.

**Órfão**: dado que perdeu o dono ou a referência (revista sem usuário, arquivo sem linha).

**Postgres**: o programa de banco de dados relacional usado pelo Supabase.

**Primary key**: coluna que identifica uma linha de forma única.

**Props**: dados que o pai entrega ao componente filho.

**Pull Request**: pedido para juntar uma branch na principal, com revisão.

**Query builder**: a cadeia `.from().select().eq()` que monta consultas.

**Reset** (CSS): regras iniciais que zeram diferenças entre navegadores.

**Responsivo**: layout que se adapta ao tamanho da tela.

**RLS** (*Row Level Security*): regras do banco que filtram quais linhas cada usuário pode ver ou alterar.

**Rota**: um endereço (`/catalog`) associado a uma tela.

**Scroll snap**: "ímã" que alinha o conteúdo ao parar de rolar.

**Semântico** (HTML): usar a tag que descreve o que o elemento **é** (`<nav>`, `<button>`).

**service_role**: chave **secreta** do Supabase que ignora o RLS. Jamais vai ao navegador.

**SPA**: *Single Page Application*, um site de uma única página HTML que troca o conteúdo por JavaScript.

**SQL**: linguagem para conversar com bancos relacionais.

**Storage**: o serviço de arquivos do Supabase.

**StrictMode**: ajuda do React em desenvolvimento que roda efeitos duas vezes para revelar bugs.

**Tabela / Linha / Coluna**: a estrutura de um banco relacional.

**TDD**: *Test-Driven Development*, escrever o teste antes do código.

**Token** (CSS): variável de design (`--bg`, `--text`).

**Tree-shaking**: o build descarta o código importado e não usado.

**TypeScript**: JavaScript com tipos, que somem na compilação.

**União literal**: tipo que aceita só certos valores (`'a' | 'b'`).

**UUID**: identificador longo e único (`a1b2c3d4-...`).

**Variável de ambiente**: configuração guardada fora do código (`.env.local`).

**View** (SQL): consulta salva que se comporta como uma tabela; aqui, para expor só colunas seguras.

**Vite**: ferramenta que serve o app em desenvolvimento e o empacota para produção.

**Vitest**: executor de testes do ecossistema Vite.

**XSS**: ataque em que um script do atacante roda no navegador de outra pessoa dentro do seu site.

---

## Onde continuar aprendendo

| Assunto | Fonte gratuita e confiável |
|---|---|
| HTML, CSS, JavaScript | **MDN Web Docs** (`developer.mozilla.org/pt-BR`) |
| React | **react.dev** (a documentação oficial é excelente, com exercícios) |
| TypeScript | **typescriptlang.org/docs** |
| Supabase | **supabase.com/docs** |
| SQL | Tutoriais de PostgreSQL; pratique no SQL Editor de um projeto de estudo |
| Git | **git-scm.com/book/pt-br** |
| Acessibilidade | **web.dev/learn/accessibility** |
| Segurança web | **OWASP Top 10** (`owasp.org`) |

**Próximo passo sugerido:** volte ao [README](README.md), escolha a semana em que está e siga o roteiro de
10 semanas. Quando chegar ao [capítulo 15](15-reconstruindo-do-zero.md), construa o seu.
