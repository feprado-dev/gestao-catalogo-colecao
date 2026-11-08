# 00. Visão geral: o que construímos e como as peças se encaixam

## Objetivo
Entender o **mapa completo** antes de entrar em qualquer detalhe: que problema o app resolve, de que partes é feito,
que tecnologia faz o quê e como um clique do usuário viaja até o banco de dados e volta.

---

## 1. O problema que o app resolve

Uma pessoa tem uma coleção de revistas e quer:

1. **Catalogar** cada edição (título, número, mês, ano, condição, capa).
2. Ver tudo com **capas grandes**, em três modos de visualização.
3. **Buscar, filtrar e ordenar**.
4. Mostrar parte do acervo (ou todo) num **catálogo público**, que qualquer visitante vê sem criar conta.
5. Manter o **controle** só para si: só o dono cadastra, edita e apaga.

Quase todo sistema que você vai construir na carreira é variação disto: **CRUD** (Create, Read, Update, Delete)
sobre algum tipo de dado, com login, permissões e uma tela bonita por cima.

---

## 2. As três camadas

```
┌──────────────────────────────┐        HTTPS        ┌─────────────────────────────────┐
│  NAVEGADOR (frontend)        │ ◄─────────────────► │  SUPABASE (backend como serviço)│
│  React + TypeScript          │                     │                                 │
│  • telas e interação         │                     │  • Auth      → quem é você?     │
│  • valida o que o usuário    │                     │  • Postgres  → onde os dados    │
│    digita                    │                     │                ficam            │
│  • decide o que mostrar      │                     │  • Storage   → onde as imagens  │
└──────────────┬───────────────┘                     │                ficam            │
               │ servido por                         └─────────────────────────────────┘
               ▼
┌──────────────────────────────┐
│  VERCEL (hospedagem)         │   Entrega os arquivos prontos (HTML, CSS, JS)
│  arquivos estáticos          │   a quem digitar o endereço do site.
└──────────────────────────────┘
```

| Camada | Pergunta que responde | Onde mora no projeto |
|---|---|---|
| **Frontend** | "O que o usuário vê e toca?" | `src/` |
| **Backend (Supabase)** | "Onde guardo? Quem pode ver o quê?" | Painel do Supabase + `supabase/migrations/` |
| **Hospedagem (Vercel)** | "Como o mundo acessa?" | Painel do Vercel + `vercel.json` |

⚠️ **Ideia mais importante do capítulo:** o código do frontend roda **no navegador de quem visita**, e qualquer
pessoa pode ler e alterar esse código. Por isso **segurança nunca pode morar só no frontend**. Quem protege os dados
é o banco, com o **RLS** (capítulo 08 e 13).

---

## 3. As tecnologias e por que cada uma está aqui

| Tecnologia | O que é | Por que usamos |
|---|---|---|
| **Node.js** | Executa JavaScript fora do navegador | Roda as ferramentas de desenvolvimento (Vite, testes) |
| **npm** | Gerenciador de pacotes | Instala as bibliotecas listadas no `package.json` |
| **Vite** | Ferramenta de desenvolvimento e empacotamento | Servidor local com recarga instantânea e o `build` final |
| **TypeScript** | JavaScript com tipos | Pega erros antes de rodar; documenta o formato dos dados |
| **React** | Biblioteca para montar interfaces com componentes | A tela vira peças reutilizáveis que reagem a mudanças de dados |
| **React Router** | Troca de páginas sem recarregar | Rotas `/`, `/catalog`, `/public` |
| **CSS puro** (com variáveis) | Estilo visual | Você aprende CSS de verdade; temas claro/escuro com poucas linhas |
| **Supabase** | "Backend pronto": banco Postgres, login e arquivos | Evita escrever e hospedar um servidor próprio |
| **PostgreSQL / SQL** | Banco relacional e sua linguagem | Guarda as revistas com regras de segurança |
| **Vitest** | Executor de testes | Garante que a lógica (filtros, leitura de nomes) continua certa |
| **oxlint** | Verificador de qualidade de código | Aponta práticas duvidosas |
| **Git + GitHub** | Histórico do código e cópia na nuvem | Segurança para experimentar; base da publicação |
| **Vercel** | Hospedagem | Publica sozinho a cada `git push` |

---

## 4. Mapa de pastas

```
vault-keeper/
├── index.html                 ← a única página HTML; o React "se pendura" aqui
├── package.json               ← lista de bibliotecas e de comandos (scripts)
├── vite.config.ts             ← configuração do Vite
├── tsconfig*.json             ← configuração do TypeScript
├── vercel.json                ← regra de reescrita para as rotas funcionarem na hospedagem
├── .gitignore                 ← o que o git NÃO deve guardar (segredos, node_modules)
├── .env.local                 ← seus segredos locais (fora do git!)
├── public/                    ← arquivos servidos como estão (ícones da aba)
├── supabase/migrations/       ← mudanças do banco, versionadas em SQL
├── estudos/                   ← este material
└── src/
    ├── main.tsx               ← ponto de entrada: monta o React na página
    ├── App.tsx                ← cabeçalho + rotas + tema
    ├── types.ts               ← o formato de uma Magazine
    ├── index.css              ← variáveis de cor, reset, tema claro/escuro
    ├── App.css                ← estilo de todos os componentes
    ├── pages/                 ← uma por rota: Home, Catalog, PublicCatalog, NotFound
    ├── components/            ← peças reutilizáveis: MagazineCard, Modal, MagazineForm...
    ├── hooks/                 ← lógica reutilizável com estado: useSession, useTheme, useViewMode
    └── lib/                   ← lógica "pura" e acesso a serviços: filters, parseCoverFilename,
                                  magazineService, supabase
```

**A regra de organização, em uma frase:** cada pasta tem *um tipo de responsabilidade*.
Telas inteiras em `pages/`, peças de tela em `components/`, lógica com estado em `hooks/`, lógica sem tela e
acesso a serviços em `lib/`. Quando você sabe o que um arquivo faz, sabe onde ele mora.

---

## 5. A viagem de um clique: "Adicionar revista"

Acompanhe o que acontece quando o dono preenche o formulário e clica em **Adicionar**.
Cada passo é um arquivo real do projeto.

```
1. MagazineForm.tsx      handleSubmit() é chamado
   │                     └─ monta o objeto da revista (título, ano, is_public...)
   ▼
2. Catalog.tsx           handleAdd() recebe o objeto e o arquivo da capa
   │
   ├─▶ 3. magazineService.ts  uploadCover()
   │       └─ envia a imagem ao Storage, na pasta <seu user_id>/
   │       └─ o Supabase CONFERE: a pasta é a sua? (regra do Storage)
   │       └─ devolve o endereço público da imagem
   │
   ├─▶ 4. magazineService.ts  addMagazine()
   │       └─ INSERT na tabela magazines, com user_id
   │       └─ o Postgres CONFERE: auth.uid() = user_id? (regra RLS)
   │       └─ devolve a linha criada, já com o id
   ▼
5. Catalog.tsx           setMagazines([created, ...magazines])
   │                     └─ o estado muda
   ▼
6. React                 redesenha a tela: o novo card aparece
```

E se algo falhar no passo 4? O `catch` em `handleAdd` apaga a imagem que já subiu no passo 3 (para não deixar
lixo no Storage) e mostra a mensagem de erro. **Duas operações que precisam andar juntas exigem cuidado com o
meio do caminho.** Você verá isso em detalhe no capítulo 09.

🧪 **Experimente:** abra `src/pages/Catalog.tsx` e `src/lib/magazineService.ts` lado a lado. Localize cada um dos
seis passos acima. Se achar todos, você já entende a espinha dorsal do app.

---

## 6. Os conceitos que atravessam o projeto inteiro

Você vai encontrar estas ideias de novo e de novo, em capítulos diferentes:

| Ideia | Em uma frase | Onde você vê |
|---|---|---|
| **Dados descem, eventos sobem** | O pai passa dados e funções para o filho; o filho avisa o pai chamando a função | Props em todos os componentes |
| **Nunca modifique, sempre crie novo** | Para mudar uma lista ou objeto, crie uma cópia alterada | `setMagazines([...])`, `filter`, `map` |
| **Estado derivado** | O que dá para calcular, não guarde | `visibleMagazines = applyFilters(...)` |
| **Funções puras** | Mesma entrada, mesma saída, sem efeitos colaterais | `applyFilters`, `parseCoverFilename` |
| **Camada de serviço** | Um lugar só fala com o banco | `magazineService.ts` |
| **Espere o banco antes de mudar a tela** | A tela nunca "mente" sobre o que está salvo | `confirmDelete`, `handleTogglePublic` |
| **Frontend é território hostil** | Validação no navegador é conforto, não segurança | RLS, validação de upload |
| **Variáveis (tokens) em um lugar** | Mudar o visual editando poucas linhas | `:root` em `index.css` |

---

## 7. O que o app faz, funcionalidade por funcionalidade

| Funcionalidade | Arquivos principais |
|---|---|
| Login (só e-mail e senha, cadastro fechado) | `AuthForm.tsx`, `useSession.ts` |
| Listar a coleção do dono | `Catalog.tsx`, `listMyMagazines` |
| Criar, editar, apagar revista | `MagazineForm.tsx`, `Modal.tsx`, `ConfirmDialog.tsx` |
| Capa com prévia e validação | `MagazineForm.tsx`, `uploadCover` |
| Tornar pública ou privada | `handleTogglePublic`, `setMagazinePublic` |
| Importar várias capas de uma vez | `BulkImport.tsx`, `parseCoverFilename.ts` |
| Buscar, filtrar, ordenar | `CatalogFilters.tsx`, `filters.ts` |
| Três modos de visualização | `ViewModeToggle.tsx`, `MagazineGallery.tsx`, `useViewMode.ts` |
| Tema claro e escuro | `useTheme.ts`, `index.css` |
| Catálogo público sem login | `PublicCatalog.tsx`, view `public_magazines` |
| Aviso de maioridade | `AgeGate.tsx` |
| Testes | `filters.test.ts`, `parseCoverFilename.test.ts` |

---

✅ **Checklist do capítulo 00**
- [ ] Explico a diferença entre frontend, backend e hospedagem com minhas palavras.
- [ ] Sei dizer por que a segurança não pode ficar só no frontend.
- [ ] Reconheço o que cada pasta de `src/` guarda.
- [ ] Sei narrar os seis passos do "Adicionar revista".
- [ ] Consigo citar três dos oito "conceitos que atravessam o projeto".

Próximo: [01. Ferramentas](01-ferramentas.md).
