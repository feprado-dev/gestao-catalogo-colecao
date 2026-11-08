# 16. Exercícios e desafios

## Como usar este capítulo

Aqui estão **quatro tipos de prática**, em ordem de dificuldade:

1. **Perguntas de revisão** (com gabarito): teste rápido da teoria.
2. **Depuração**: código quebrado para você consertar.
3. **Leitura de código**: explicar o que um trecho faz sem rodá-lo.
4. **Mini-projetos**: funcionalidades novas, com critérios de aceite.

> **Regra:** responda **por escrito**, com suas palavras, **antes** de olhar o gabarito. Respostas na cabeça
> parecem certas; no papel, mostram o que você realmente sabe.

---

# Parte 1: Perguntas de revisão (com gabarito)

Cubra a coluna da direita e responda antes.

### Ferramentas e JavaScript
| # | Pergunta | Gabarito |
|---|---|---|
| 1 | Qual a diferença entre `dependencies` e `devDependencies`? | As primeiras o app precisa **no navegador** (React, Supabase); as outras só ajudam **ao desenvolver** (TypeScript, Vite, Vitest) |
| 2 | Por que o prefixo `VITE_` existe? | O Vite só envia ao navegador variáveis com esse prefixo; evita vazar as outras por acidente |
| 3 | Diferença entre `??` e `\|\|`? | `??` só troca `null`/`undefined`; `\|\|` troca **qualquer** falsy (inclusive `0` e `''`) |
| 4 | Por que `sort()` pede cuidado? | **Altera** o array original; copie antes ou ordene o resultado de um `filter` |
| 5 | O que `.filter(Boolean)` faz? | Remove itens falsy (`null`, `undefined`, `''`, `0`) |
| 6 | `await` funciona onde? | Só dentro de funções `async` |
| 7 | Por que o `localStorage` fica dentro de `try/catch`? | Pode **lançar erro** (navegação anônima, cookies bloqueados) |

### TypeScript e React
| # | Pergunta | Gabarito |
|---|---|---|
| 8 | O que `year: number \| null` significa? | O campo existe, mas pode ser `null` ("não sei o ano") |
| 9 | O que `Omit<Magazine, 'id'>` produz? | Uma `Magazine` **sem** o campo `id` |
| 10 | Por que os tipos "mentiram" sobre `year`? | O tipo dizia `number`, mas o banco tinha `null`; o TS só confia no que você escreveu |
| 11 | Por que `key` em uma lista? | Para o React identificar cada item entre desenhos; deve ser única e estável (use o `id`) |
| 12 | O que é "dados descem, eventos sobem"? | O pai passa dados e funções por props; o filho avisa o pai chamando a função |
| 13 | Por que não `magazines.push(x)`? | Altera o array por dentro; a referência é a mesma e o React não percebe a mudança |
| 14 | O que é estado derivado? Exemplo? | Valor **calculado** a partir de outros, sem `useState`: `visibleMagazines = applyFilters(...)` |
| 15 | Quando usar a forma funcional `setX(prev => ...)`? | Quando o novo valor depende do anterior; evita usar um valor "velho" capturado |
| 16 | Para que serve o `return` dentro do `useEffect`? | Limpeza: desliga o que o efeito ligou (ouvintes, assinaturas, endereços temporários) |
| 17 | O que a variável `cancelled` evita? | Que uma resposta **atrasada** sobrescreva dados mais novos |
| 18 | Estado × ref? | Estado: a tela mostra e mudar redesenha. Ref: só lembra; mudar **não** redesenha |
| 19 | Regra dos hooks? | Só no topo do componente (nunca em `if`/loop) e só em componentes/hooks |
| 20 | Para que serve trocar a `key` de um componente? | O React descarta o antigo e cria um novo, com o estado zerado |

### CSS, rotas e organização
| # | Pergunta | Gabarito |
|---|---|---|
| 21 | O que `box-sizing: border-box` muda? | A `width` já inclui padding e borda |
| 22 | Como o tema claro/escuro funciona só com variáveis? | O padrão está em `:root`; `[data-theme='light']` redefine as mesmas variáveis; o hook troca o atributo no `<html>` |
| 23 | Flex ou grid? | Flex: uma linha/coluna. Grid: uma grade (duas dimensões) |
| 24 | O que `clamp(a, b, c)` faz? | Valor que cresce com a janela (`b`), nunca abaixo de `a` nem acima de `c` |
| 25 | Por que `end` no `NavLink to="/"`? | Sem ele o `/` combinaria com todos os endereços e ficaria sempre ativo |
| 26 | Por que o `vercel.json` tem `rewrites`? | Sem ele, abrir `/catalog` direto dá 404: o servidor procura um arquivo com esse nome |
| 27 | Onde fica um arquivo de lógica sem React? | `src/lib/` |

### Banco, segurança e deploy
| # | Pergunta | Gabarito |
|---|---|---|
| 28 | O que é RLS? | O banco **filtra linhas** conforme políticas; sem política que permita, nada passa |
| 29 | `using` × `with check`? | `using`: quais linhas existentes a operação enxerga. `with check`: o que uma linha **nova/alterada** deve satisfazer |
| 30 | Por que uma consulta pode voltar `[]` sem erro? | O RLS **esconde** as linhas proibidas em silêncio |
| 31 | Diferença entre a chave publishable e a `service_role`? | A primeira é pública e só abre o que o RLS deixar; a segunda **ignora o RLS** e jamais vai ao navegador |
| 32 | Por que existe a view `public_magazines`? | O RLS filtra **linhas**, não colunas; a view entrega só as colunas seguras (sem `user_id`/`notes`) |
| 33 | Por que a pasta no Storage é o `user_id`? | As políticas do Storage conferem a pasta; e UUIDs impedem sobrescrever |
| 34 | O que é uma migration? | Um arquivo SQL ordenado que descreve **uma mudança** do banco, versionada no git |
| 35 | Por que validar no cliente **e** no servidor? | O do cliente é conforto (burlável); só o do servidor é segurança |
| 36 | Por que a ordem do `deleteMagazine` é "linha, depois arquivo"? | O pior caso passa a ser um arquivo órfão (lixo invisível), e não uma revista sem capa |
| 37 | O que é o padrão de compensação? | Se o 2º passo falha, **desfaz o 1º** (apagar a imagem que já subiu) |
| 38 | Por que `git push` sozinho não envia edições? | O push só envia **commits**; edições não commitadas ficam só na pasta de trabalho |
| 39 | O que significa `[ahead 1]` no `git status`? | Você tem 1 commit local que não foi enviado ao GitHub |
| 40 | Por que variáveis `VITE_` ficam visíveis a qualquer visitante? | O valor é **gravado dentro do JavaScript** durante o build |

**Pontuação:** 36 ou mais → pronto para a etapa seguinte. 28 a 35 → releia os capítulos das perguntas que errou.
Menos de 28 → releia o material com calma, fazendo os exercícios de cada capítulo.

---

# Parte 2: Depuração (o código está quebrado, conserte)

Para cada trecho: **o que está errado?** **Como corrigir?** Gabarito no final da seção.

### Desafio D1
```tsx
const [items, setItems] = useState<string[]>([])

function adicionar(texto: string) {
  items.push(texto)
  setItems(items)
}
```
*Sintoma:* clica em "Adicionar" e a lista na tela não muda.

### Desafio D2
```tsx
function Lista({ revistas }: { revistas: Magazine[] }) {
  return (
    <ul>
      {revistas.map((r, i) => <li key={i}>{r.title}</li>)}
    </ul>
  )
}
```
*Sintoma:* ao apagar uma revista do meio, os itens de baixo "pulam" estranhamente, e um campo digitado dentro de um
`<li>` vai parar no item errado.

### Desafio D3
```tsx
<button onClick={apagar(m.id)}>Deletar</button>
```
*Sintoma:* ao abrir a página, todas as revistas são apagadas sozinhas.

### Desafio D4
```tsx
useEffect(() => {
  listMyMagazines(userId).then(setMagazines)
}, [])
```
*Sintoma:* o usuário sai e entra com outra conta, mas continua vendo as revistas da primeira.

### Desafio D5
```tsx
async function salvar() {
  const created = await addMagazine(dados, userId)
  setMagazines([created, ...magazines])
}
```
*Sintoma:* quando o banco recusa (sem permissão), nada aparece para o usuário e o console mostra
`Uncaught (in promise)`.

### Desafio D6
```sql
delete from public.magazines
where title like '%Verão%'
   or user_id = 'abc' ;
```
*Sintoma:* o comando apagou **muito mais** revistas do que o esperado.

### Desafio D7
```tsx
if (loading) return <p>Carregando...</p>
const [filters, setFilters] = useState(defaultFilters)
```
*Sintoma:* erro `Rendered more hooks than during the previous render`.

### Desafio D8
```ts
const { data } = await supabase.from('magazines').select('*')
setMagazines(data)
```
*Sintoma:* às vezes o app quebra com `Cannot read properties of null`.

### Desafio D9
```css
.gallery--mosaic { display: grid; ... }
```
```tsx
<div className={`gallery gallery--${mode}`}>   {/* mode vale 'mosaico' */}
```
*Sintoma:* ao escolher o mosaico, aparece uma única capa gigante.

### Desafio D10
```ts
cover_model: coverModel.trim() || undefined
```
*Sintoma:* o usuário apaga o campo "Modelo da capa" e salva, mas ao reabrir o valor antigo voltou.

---

### Gabarito da Parte 2

| # | Problema | Correção |
|---|---|---|
| D1 | `push` altera o array original; `setItems(items)` passa a **mesma** referência, e o React acha que nada mudou | `setItems((atual) => [...atual, texto])` |
| D2 | `key={i}` (índice): o React confunde os itens quando a lista muda de ordem ou perde itens | `key={r.id}` |
| D3 | `apagar(m.id)` **executa** a função ao desenhar, em vez de esperar o clique | `onClick={() => apagar(m.id)}` |
| D4 | O array de dependências é `[]`, então o efeito roda só uma vez; faltou `userId` nas dependências (e a limpeza) | `}, [userId])` com a variável `cancelled` |
| D5 | Sem `try/catch`: o `throw` do serviço vira uma Promise rejeitada sem tratamento | `try { ... } catch (e) { setError((e as Error).message) }` |
| D6 | O `or` apaga as revistas que casam com **qualquer** das duas condições, e `like '%Verão%'` pega nomes de todos os donos | Use `and`; e **rode antes um `select count(*)`** com o mesmo `where` |
| D7 | Um hook (`useState`) depois de um `return` antecipado: nos desenhos com `loading`, o hook não é chamado | Mova todos os hooks para **antes** dos `return` |
| D8 | Ignorou `error`: se a consulta falha, `data` é `null` | `if (error) throw error` antes de usar `data` |
| D9 | A classe do CSS (`--mosaic`) não casa com a gerada (`--mosaico`); o TS não vê erro em texto de classe | Alinhe os nomes; **confira olhando a tela** |
| D10 | `undefined` some do envio e o banco mantém o valor antigo | `\|\| null` |

---

# Parte 3: Leitura de código

Sem rodar, explique **em português**, linha a linha, o que cada trecho faz e **por quê**.

**L1.** `src/lib/filters.ts`: a função `normalize` e a linha do `.includes(term)`.
**L2.** `src/hooks/useSession.ts`: os três passos do efeito e o papel do `loading`.
**L3.** `src/components/MagazineGallery.tsx`: o ouvinte do `wheel`. Quando ele **não** bloqueia a rolagem da
página? Por quê?
**L4.** `src/components/BulkImport.tsx`: a função `handleFiles`. Em que situação duas capas do **mesmo lote** são
marcadas como duplicadas?
**L5.** `src/lib/parseCoverFilename.ts`: a regex `PATTERN`. Quais partes são opcionais? O que `_{1,2}` aceita?
**L6.** `src/pages/Catalog.tsx`: `handleUpdate`. Liste, em ordem, tudo o que acontece quando o usuário troca a
capa de uma revista, e o que acontece em cada ponto de falha.
**L7.** `supabase/migrations/...remove_anon_read...sql`: por que esta migration veio **depois** da view e do
`push`?

**Como conferir:** explique em voz alta, como se ensinasse a um colega. Onde você hesitou ou disse "não sei" é onde
precisa reler o capítulo.

---

# Parte 4: Mini-projetos

Cada um é uma funcionalidade nova **no seu projeto de estudo**, com critérios de aceite. Estão em ordem de
dificuldade.

### ⭐ Nível 1 (1 a 3 horas)

**M1. Campo "Edição" e "Notas" no formulário.** *(Corrige dois achados do capítulo 14.)*
- Aceite: criar e editar uma revista preenche `issue` e `notes`; o `BulkImport` agora detecta como duplicada uma
  edição criada pelo formulário.

**M2. Condição "não informada".**
- Aceite: editar o título de uma revista com `condition: null` **não** muda a condição no banco.

**M3. Contadores no topo.**
- Aceite: "Total", "Na coleção", "Procurando" e "Públicas", calculados (estado derivado), com um componente
  `StatCard` reutilizável.

**M4. Realce do termo buscado.**
- Aceite: ao buscar "joana", o trecho aparece em destaque no título do card. *(Dica: função pura +
  teste primeiro.)*

### ⭐⭐ Nível 2 (3 a 8 horas)

**M5. Desfazer ao apagar.**
- Aceite: ao apagar, aparece um aviso "Revista apagada. **Desfazer**" por 5 segundos. *(Pense: apagar de verdade
  só depois do prazo? Ou apagar já e recriar? Qual é mais seguro?)*

**M6. Seleção múltipla.**
- Aceite: marcar várias revistas e "Tornar públicas", "Tornar privadas" ou "Apagar" em lote, com confirmação. O que
  acontece se uma falhar no meio?

**M7. Exportar para CSV.**
- Aceite: um botão baixa a coleção em `.csv` que abre corretamente no Excel, com acentos. *(Pesquise `Blob` e
  `URL.createObjectURL`. Escreva a função de conversão como **função pura**, com testes.)*

**M8. Página de estatísticas.**
- Aceite: rota `/estatisticas` com revistas por década, por condição e total por mês. Barras feitas só com CSS.

**M9. Paginação ou "carregar mais".**
- Aceite: o catálogo carrega 24 revistas por vez (usando `.range(...)` do Supabase). Compare com a abordagem atual.

**M10. Tema que segue o sistema.**
- Aceite: na primeira visita, o tema respeita `prefers-color-scheme`; depois, o que o usuário escolher.

### ⭐⭐⭐ Nível 3 (1 a 3 dias)

**M11. Testes de componentes.** Instale `@testing-library/react` e teste `MagazineCard` (com e sem ações),
`ViewModeToggle` e `ConfirmDialog`.

**M12. Teste ponta a ponta.** Instale o **Playwright** e escreva um roteiro: abrir o site, passar pelo aviso de
idade, trocar o modo de visualização, conferir que as capas aparecem.

**M13. Miniaturas.** Gerar versões reduzidas das capas (no envio, com `canvas`) para o mosaico carregar muito
mais rápido. Compare o peso da página antes e depois.

**M14. Arrastar e soltar.** Soltar vários arquivos sobre o painel de importação (eventos `dragover`/`drop`).

**M15. Busca no servidor.** Mova a busca para o banco (`.ilike(...)`), com *debounce* (hook `useDebounce`) e
tratamento do estado de carregamento. Quando vale mais a pena que filtrar no navegador?

**M16. PWA.** Faça o app instalável no celular (manifesto + *service worker*). O que muda para o uso offline?

**M17. A migration de base.** Escreva a migration que recria **todo** o banco (tabela com chave estrangeira,
RLS, políticas, view, bucket com limites) e prove: crie um projeto Supabase vazio, aplique, e o app funciona
idêntico.

### ⭐⭐⭐⭐ Para quem quer ir mais longe

**M18. Multiusuário real.** Abra o cadastro, com perfis (`profiles`), coleções públicas por pessoa
(`/u/nome`), e RLS pensada para isso. *Aviso:* este é um problema de segurança sério. Faça o modelo de ameaças
antes (capítulo 13).

**M19. Escrever a sua própria "camada de dados".** Troque o Supabase por uma API simples sua (Node + Express +
SQLite) mantendo `magazineService.ts` como única mudança no frontend. Isso prova que a separação em camadas
valeu.

**M20. Ensine.** Escreva um tutorial de **uma** das etapas do capítulo 15 para um amigo iniciante, e refine até
ele conseguir seguir sozinho. Ensinar é a melhor forma de dominar.

---

## Como medir seu progresso

| Sinal | Você está... |
|---|---|
| Precisa copiar o código para qualquer coisa | Começando |
| Entende o código ao ler, mas trava ao escrever do zero | No meio do caminho |
| Escreve, quebra e conserta sozinho, lendo as mensagens de erro | Ganhando autonomia |
| Consegue ensinar a outra pessoa e escolher entre abordagens, justificando | Dominando o básico |

## Hábitos que aceleram o aprendizado
1. **Estude em blocos curtos e frequentes** (1 hora por dia vale mais que 7 horas num domingo).
2. **Leia as mensagens de erro inteiras.** Costumam dizer o problema e a linha.
3. **Reduza o problema:** se algo não funciona, isole o menor trecho que reproduz o erro.
4. **Explique em voz alta** (ao "patinho de borracha") antes de pedir ajuda.
5. **Pesquise com a pergunta certa:** "[tecnologia] [mensagem de erro entre aspas]".
6. **Leia código de outras pessoas.** A documentação oficial (react.dev, supabase.com/docs, MDN) é a melhor fonte.
7. **Comite com frequência.** Isso vira coragem de experimentar.
8. **Anote o que aprendeu** com suas palavras (um diário técnico).

Próximo: [17. Erros e lições do projeto](17-erros-e-licoes.md).
