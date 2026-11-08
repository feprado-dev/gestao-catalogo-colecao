# 19. Roteiro fictício de entrevista técnica: Vault Keeper

> Simulação de uma entrevista para uma vaga **júnior / estágio em desenvolvimento** numa empresa fictícia, a **Nimbus Tech**. As respostas são **sugestões em primeira pessoa**, baseadas no que o projeto realmente tem. Adapte com as suas palavras e **nunca afirme o que você não fez**: dizer "isso eu ainda não fiz, mas sei como faria" vale mais que inventar.

**Entrevistadores:** Marina (Tech Lead) e Carlos (Engenheiro Sênior)
**Duração prevista:** 45 minutos

---

## Bloco 1. Abertura (5 min)

### 1.1 "Conte sobre você e sobre o projeto que mais te orgulha."
**O que buscam:** clareza, objetividade e capacidade de explicar o que construiu.

**Sugestão:**
> Estou começando na programação e aprendi construindo. O projeto de que mais me orgulho é o **Vault Keeper**, um catálogo para organizar uma coleção de revistas. Ele tem login, cadastro, edição e exclusão de itens, upload de capas, filtros, importação em massa e uma página pública só para visualização. Publiquei no ar e depois estudei o que fiz para documentar tudo.

### 1.2 "Qual problema ele resolve?"
> Eu tinha uma coleção grande e nenhum jeito de consultá-la. O app permite cadastrar cada revista, filtrar por ano, condição ou título, e mostrar a coleção de forma visual, com capas grandes. Também separa o que é **privado** (só eu edito) do que é **público** (qualquer pessoa vê).

---

## Bloco 2. Arquitetura e escolhas (10 min)

### 2.1 "Qual é a arquitetura e por que essas tecnologias?"
> O front-end usa **React 19 com TypeScript**, empacotado pelo **Vite**. O back-end é o **Supabase**: autenticação, banco **Postgres**, armazenamento de arquivos e regras de segurança. A hospedagem é a **Vercel**, com deploy automático a cada `git push`. Escolhi isso para ter um produto completo e publicado sem manter servidor, e poder focar em aprender.

### 2.2 "Por que TypeScript e não JavaScript puro?"
> Porque o tipo me avisa de erros antes de rodar. Um exemplo real: eu tinha declarado `year: number`, mas o banco tinha revistas sem ano. O tipo "mentia". Corrigi para `number | null`, e o compilador passou a apontar todos os lugares que não tratavam o caso vazio.

### 2.3 "Como o código está organizado?"
> Separei por responsabilidade: `components/` para a interface, `pages/` para as telas, `hooks/` para a lógica de estado reutilizável (`useSession`, `useTheme`, `useViewMode`) e `lib/` para a lógica sem interface. O acesso ao banco fica **todo** em um arquivo, o `magazineService.ts`. Os componentes nunca falam com o Supabase diretamente.

### 2.4 "Por que isolar o acesso ao banco em uma camada de serviço?"
> Para poder trocar o back-end sem reescrever a interface. Tanto que já comecei uma versão da API em **Java com Spring Boot**: o front só precisaria de um novo serviço apontando para outro endereço. Também facilita testar e deixa o tratamento de erros em um lugar só.

### 2.5 "Se tivesse que escalar para milhares de usuários, o que mudaria?"
> Hoje é um catálogo pessoal, então a escala não era o objetivo. Para crescer eu faria **paginação** nas listagens (hoje carrego tudo), criaria **índices** no banco para os filtros, serviria as imagens por **CDN** com tamanhos otimizados e acrescentaria monitoramento de erros.

---

## Bloco 3. Segurança (10 min)

### 3.1 "Como você protege os dados?"
> Uso **RLS (Row Level Security)** no Postgres. A regra fica no banco: cada usuário só lê e altera as próprias linhas. Mesmo que alguém copie a chave pública do front-end, não consegue acessar dados de outras pessoas.

### 3.2 "A chave do Supabase fica visível no front-end. Isso não é um problema?"
> Variáveis `VITE_*` entram no código final e qualquer um pode vê-las. Por isso o app usa só a chave **pública (anon)**, que é feita para isso. A proteção real é a RLS. A chave de serviço, que ignora a RLS, nunca entra no projeto.

### 3.3 "Como você expõe o catálogo público sem abrir a tabela?"
> Criei uma **view** chamada `public_magazines`, que mostra apenas as revistas marcadas como públicas e apenas os campos seguros. Depois **removi o acesso anônimo direto à tabela**, deixando só a view. Assim o visitante nunca toca na tabela original.

### 3.4 "Como tratou o cadastro de usuários?"
> Fechei o cadastro público: existe uma única conta, e a confirmação de e-mail está ligada. Visitantes só visualizam. Também limpei as URLs de redirecionamento de autenticação, deixando apenas as que realmente uso.

### 3.5 "Quais riscos você identificou e ainda não resolveu?"
> Sei de alguns: o **bucket de imagens não tem limite de tamanho nem de tipo** no servidor; `user_id` não tem **chave estrangeira**; a proteção contra **senhas vazadas** está desligada; e as configurações de Auth estão só no painel, não versionadas. Documentei tudo isso em um capítulo de pendências para tratar depois.

---

## Bloco 4. Qualidade e código (10 min)

### 4.1 "Como você testa?"
> Testo a lógica pura com **Vitest**, usando TDD nas partes de regra. Tenho 30 testes: 19 para `applyFilters` (os filtros) e 11 para `parseCoverFilename`, que extrai ano e mês do nome do arquivo na importação em massa. Escrevo o teste primeiro, vejo falhar, faço passar e depois refatoro.

### 4.2 "Por que testar funções puras e não a interface?"
> Porque rendem mais com menos esforço: não dependem de rede nem de tela, são rápidas e cobrem as regras que mais quebram. Testes de interface ainda são uma lacuna que quero cobrir, com Testing Library ou Playwright.

### 4.3 "Conte um bug que você encontrou e como resolveu."
> Um bom exemplo: ao **editar** uma revista sem condição, o formulário gravava `'Bom'` por causa de `initial?.condition ?? 'Bom'`. Ou seja, abrir e salvar mudava o dado sem o usuário perceber. Está documentado como defeito conhecido, e a correção é deixar o valor `null` como opção válida no formulário.

### 4.4 "Como lida com falhas parciais, como upload que dá certo e o registro que falha?"
> Uso **compensação**: se o upload da capa funciona, mas o insert no banco falha, removo a imagem enviada para não deixar arquivo órfão. Assim a operação "ou acontece inteira, ou não deixa rastro".

### 4.5 "Você usa linter? O que ele aponta?"
> Uso **oxlint**. Hoje tenho dois avisos `set-state-in-effect`, em `Catalog.tsx` e `MagazineForm.tsx`: chamadas de `setState` dentro de `useEffect` que poderiam ser estado derivado. Não escondi os avisos, deixei registrados para refatorar.

### 4.6 "Algo na acessibilidade?"
> Tenho lacunas: o **modal não tem focus trap**, então o foco do teclado pode sair dele. Os botões de visualização usam só ícones, então preciso garantir `aria-label` em todos. Conheço o problema e é uma prioridade.

---

## Bloco 5. Front-end e experiência (5 min)

### 5.1 "Como você fez os modos de visualização?"
> São três: vertical, horizontal e mosaico. O horizontal usa **CSS scroll-snap**, para as capas "encaixarem" ao rolar. A escolha fica salva em um hook, o `useViewMode`. Os botões usam **ícones SVG inline**, sem biblioteca.

### 5.2 "Por que CSS puro, sem Tailwind ou biblioteca de componentes?"
> Para aprender o que está por baixo: variáveis CSS, temas claro e escuro com `[data-theme]`, grid e flexbox. Num projeto maior eu consideraria Tailwind ou CSS Modules para evitar conflitos de nome.

### 5.3 "Por que o aviso 18+?"
> O conteúdo é adulto. O `AgeGate` é um aviso de entrada para a página pública. Reconheço que é uma barreira **declaratória**, não uma verificação real de idade.

---

## Bloco 6. Deploy e processo (5 min)

### 6.1 "Como é o deploy?"
> O repositório no **GitHub** está ligado à **Vercel**: cada `git push` na branch principal gera um novo build e publica. As chaves do Supabase ficam nas variáveis de ambiente da Vercel, não no repositório. O `vercel.json` redireciona as rotas para o `index.html`, para o React Router funcionar ao recarregar a página.

### 6.2 "Você trabalhou com migrations?"
> Parcialmente. As alterações da view pública e da remoção do acesso anônimo estão em arquivos SQL versionados. A criação inicial da tabela veio antes e não está versionada, é uma dívida que reconheço. Na API Java pretendo usar **Flyway** para resolver isso.

### 6.3 "Como você cuida dos dados, como duplicatas e importação?"
> Fiz uma **importação em massa** que lê ano e mês do nome do arquivo da capa. Depois removi duplicatas e conferi o total com um `count(*)` no banco, em vez de confiar em estimativa. Já errei antes ao estimar o número de linhas, e desde então verifico sempre.

---

## Bloco 7. Perguntas finais e comportamentais

### 7.1 "Como você aprende algo novo?"
> Construindo algo real e documentando. Depois que terminei o Vault Keeper, escrevi 19 capítulos de estudo e gerei um PDF de 146 páginas. Explicar para um iniciante me força a entender de verdade.

### 7.2 "Já errou feio num projeto? O que aprendeu?"
> Já colei uma chave de API no terminal errado. Não houve vazamento, mas aprendi a conferir **onde** estou antes de colar qualquer segredo e a nunca pôr chaves no chat nem no repositório.

### 7.3 "Qual o próximo passo do projeto?"
> Terminar a **API em Java com Spring Boot**: CRUD, login com JWT, upload de capas, e depois trocar a camada de serviço do React. Também quero corrigir as pendências de segurança e acessibilidade.

### 7.4 "Você tem perguntas para nós?" (sempre tenha!)
Sugestões:
- Como é o processo de **code review** no time?
- Como vocês lidam com **testes** e integração contínua?
- Como é a **primeira semana** de quem entra?
- Quem seria meu **mentor** ou ponto de contato técnico?

---

## Perguntas-surpresa para treinar

| Pergunta | Ponto-chave da resposta |
|---|---|
| Diferença entre `let`, `const` e `var`? | Escopo e reatribuição; prefiro `const` |
| O que é um hook? | Função que dá estado/efeitos a componentes; regras: só no topo |
| Para que serve `useEffect`? | Efeitos colaterais; cuidado com dependências |
| `null` vs `undefined`? | `undefined` = não definido; `null` = vazio de propósito |
| O que é uma promise / `async-await`? | Valor futuro; `await` espera sem travar a tela |
| O que é CORS? | Regra do navegador sobre origens; a API precisa liberar |
| O que é JWT? | Token assinado que prova quem é o usuário |
| Diferença entre `PUT` e `PATCH`? | `PUT` troca tudo; `PATCH` altera parte |
| O que é uma chave estrangeira? | Liga tabelas e garante integridade |
| O que é um índice? | Acelera buscas, custa espaço e escrita |

---

## Dicas para o dia

1. **Conte como história:** problema → decisão → resultado → o que aprenderia diferente.
2. **Admita limites** com um plano ("não fiz X, faria assim"). Isso mostra maturidade.
3. **Tenha o projeto aberto** e saiba mostrar um fluxo de ponta a ponta em 2 minutos.
4. **Use números reais:** 30 testes, 64 revistas públicas, 19 capítulos.
5. **Pense em voz alta** quando não souber: o raciocínio também é avaliado.
6. **Pratique em voz alta**, de preferência gravando você mesmo respondendo.
