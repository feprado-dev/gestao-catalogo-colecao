# Estudos: aprendendo programação web com o Vault Keeper

Este material usa **o seu próprio projeto** (o catálogo de revistas) como livro-texto. Em vez de exemplos abstratos
como "Pessoa" e "Carro", cada conceito aparece no código que você já viu funcionando: `MagazineCard`, `applyFilters`,
`useSession`, as políticas de segurança do banco, o deploy no Vercel.

Você chegou até aqui construindo. Agora o objetivo é **entender por que cada linha existe** e conseguir criar
algo parecido sozinho.

---

## Como estudar (leia isto antes)

1. **Abra o código ao lado.** Cada capítulo cita arquivos (por exemplo `src/lib/filters.ts`). Abra-os no IntelliJ
   (`⌘⇧O` e digite o nome) e leia o trecho real, não só o que está copiado aqui.
2. **Digite, não copie.** Quando um capítulo pedir um exercício, escreva o código à mão. Copiar e colar não treina
   o cérebro.
3. **Quebre de propósito.** Troque um valor, apague uma linha, veja o erro. Entender *como* algo falha é metade de
   entender como funciona.
4. **Faça os exercícios antes de olhar as dicas.** Travar faz parte. Só espie a dica depois de 10 minutos tentando.
5. **Um capítulo por vez, sem pular.** A ordem importa: cada um usa o anterior.
6. **Use o git como rede de segurança.** Antes de experimentar, faça `git status`. Se estragar tudo, `git restore .`
   volta ao último commit.

> **Dica de ouro:** quando não entender algo, escreva a pergunta com suas palavras ("por que o `useEffect` tem
> `[]`?"). Muitas vezes a resposta aparece só de formular a pergunta. Se não aparecer, a pergunta bem feita vira a
> melhor busca na internet ou o melhor pedido de ajuda.

---

## O índice

| # | Capítulo | O que você aprende | Tempo sugerido |
|---|---|---|---|
| 00 | [Visão geral](00-visao-geral.md) | O que construímos, arquitetura, tecnologias, fluxo dos dados | 1 h |
| 01 | [Ferramentas](01-ferramentas.md) | Terminal, Node, npm, Vite, variáveis de ambiente, IntelliJ | 2 h |
| 02 | [JavaScript essencial](02-javascript-essencial.md) | A parte do JS que o projeto realmente usa | 4 h |
| 03 | [TypeScript](03-typescript.md) | Tipos, interfaces, genéricos, `null`, por que ajudam | 3 h |
| 04 | [React: fundamentos](04-react-fundamentos.md) | Componentes, JSX, props, listas, eventos, formulários | 4 h |
| 05 | [React: estado, efeitos e hooks](05-react-estado-efeitos-hooks.md) | `useState`, `useEffect`, `useRef`, hooks próprios | 5 h |
| 06 | [Rotas e organização](06-rotas-e-organizacao.md) | SPA, React Router, estrutura de pastas | 2 h |
| 07 | [CSS moderno](07-css-moderno.md) | Variáveis, flex, grid, responsividade, temas | 5 h |
| 08 | [Banco de dados e Supabase](08-banco-de-dados-supabase.md) | SQL, RLS, views, Storage, autenticação, migrations | 6 h |
| 09 | [Ligando o app ao banco](09-ligando-app-e-banco.md) | CRUD, async/await, erros, upload, consistência | 4 h |
| 10 | [Lógica pura e testes](10-logica-pura-e-testes.md) | Vitest, TDD, casos de borda | 3 h |
| 11 | [Git e GitHub](11-git-e-github.md) | Commits, push, histórico, desfazer | 3 h |
| 12 | [Build e deploy](12-build-e-deploy.md) | Vite build, Vercel, variáveis, domínios | 2 h |
| 13 | [Segurança](13-seguranca.md) | O que protege (e o que não protege) um app web | 3 h |
| 14 | [Acessibilidade e qualidade](14-acessibilidade-e-qualidade.md) | HTML semântico, teclado, lint, refatoração | 3 h |
| 15 | [Reconstruindo do zero](15-reconstruindo-do-zero.md) | Roteiro passo a passo para refazer o app sozinho | 20 h |
| 16 | [Exercícios e desafios](16-exercicios-e-desafios.md) | Prática por capítulo e mini-projetos | contínuo |
| 17 | [Erros e lições do projeto](17-erros-e-licoes.md) | Os tropeços reais que tivemos e o que ensinam | 2 h |
| 18 | [Cola rápida e glossário](18-cola-rapida-e-glossario.md) | Resumos para consulta e dicionário de termos | consulta |

---

## Roteiro sugerido: 10 semanas, cerca de 6 a 8 horas por semana

| Semana | Capítulos | Entrega da semana |
|---|---|---|
| 1 | 00, 01 | Você roda o projeto, explica a arquitetura em voz alta e navega pelo terminal sem medo |
| 2 | 02 | Resolve os exercícios de JS sem consultar o capítulo |
| 3 | 03, 04 | Cria um componente novo (`StatCard`) com props tipadas |
| 4 | 05 | Cria um hook próprio (`useLocalStorage`) e usa em dois lugares |
| 5 | 06, 07 | Adiciona uma página nova com rota e um tema de cor novo |
| 6 | 08 | Cria uma tabela nova (`wishlist`) com RLS, num projeto Supabase de teste |
| 7 | 09 | Faz o CRUD completo da `wishlist` no app |
| 8 | 10, 11 | Escreve testes para uma função nova (TDD) e faz 5 commits bem descritos |
| 9 | 12, 13, 14 | Publica uma cópia do app e revisa a segurança com o checklist do capítulo 13 |
| 10 | 15, 17 | Reconstrói uma versão enxuta do app do zero, sem olhar o código original |

Se estiver cansado de um assunto, **alterne**: um dia de teoria, um dia de prática. O cérebro fixa melhor assim.

---

## Pré-requisitos

- Um computador com Mac, IntelliJ IDEA e o Node.js instalado (você já tem os três).
- Saber o básico de lógica: variáveis, `if`, repetição, funções. O capítulo 02 revisa o que o projeto usa.
- Uma conta no GitHub, no Supabase e no Vercel (você já criou as três).
- **Nenhum** conhecimento prévio de React, TypeScript ou SQL.

## O que este material NÃO cobre (de propósito)

- Estado global com bibliotecas (Redux, Zustand). O projeto não precisou.
- Servidores próprios em Node/Express. O Supabase fez esse papel.
- Testes de componentes e de ponta a ponta (citados como próximo passo no capítulo 10).
- Aplicativos de celular nativos.

Esses assuntos ficam melhores depois que a base deste material estiver sólida.

---

## Convenções usadas nos capítulos

- **`código` em linha** é um nome de arquivo, função ou comando.
- Blocos marcados `bash` são comandos para o terminal; um comando por bloco, para você rodar um de cada vez.
- 📁 **No projeto** indica onde o conceito aparece no seu código.
- ⚠️ **Cuidado** marca erros comuns, muitos deles cometidos de verdade neste projeto.
- 🧪 **Experimente** é um mini-exercício de dois minutos.
- ✅ **Checklist** fecha o capítulo: se não consegue explicar um item com as próprias palavras, releia a seção.

Bons estudos. Comece pelo [capítulo 00](00-visao-geral.md).
