# 12. Build e deploy: do seu computador ao mundo

## Objetivo
Entender o que acontece entre "o código funciona na minha máquina" e "qualquer pessoa abre o site": o **build**,
a **hospedagem**, as **variáveis de ambiente em produção**, o **deploy automático** e como investigar quando algo
não funciona no site publicado.

---

## 1. Dois mundos: desenvolvimento e produção

| | **Desenvolvimento** (`npm run dev`) | **Produção** (o site publicado) |
|---|---|---|
| Endereço | `localhost:5173` | `vault-keeper-zeta.vercel.app` |
| Quem acessa | Só você | Qualquer pessoa |
| Código | Traduzido na hora, legível, com ajudas | Compactado e otimizado |
| Foco | Rapidez para você trabalhar | Rapidez para o visitante carregar |
| Variáveis de ambiente | Do seu `.env.local` | Do painel da hospedagem |

Muita coisa que funciona em um pode **falhar no outro**. Conhecer as diferenças economiza horas de confusão.

---

## 2. O build: `npm run build`

```json
"build": "tsc -b && vite build"
```
Dois passos encadeados por `&&` (o segundo só roda se o primeiro passar):

1. **`tsc -b`**: o TypeScript confere **todos os tipos**. Se houver um erro de tipo, o build **para**. Esse é o
   porquê de uma checagem de tipos "quebrar" o deploy.
2. **`vite build`**: junta, traduz e otimiza tudo.

### O que o Vite produz em `dist/`
```
dist/
├── index.html
├── favicon.svg ... (arquivos de public/ copiados)
└── assets/
    ├── index-DPhWO8gg.js      ← TODO o JavaScript (React + seu código), compactado
    └── index-D8MUNvAy.css     ← TODO o CSS
```

Repare nos nomes com códigos estranhos (`DPhWO8gg`): são um **hash do conteúdo**. Quando você muda o código, o
hash muda, o navegador percebe que é um arquivo **novo** e baixa de novo. Se o nome fosse sempre o mesmo, o
navegador usaria uma cópia antiga em cache e o visitante veria o site velho. Esse truque se chama *cache busting*.

### O que o Vite faz com o código
- **Minificação:** remove espaços, encurta nomes (`handleSubmit` → `a`), tira comentários. O arquivo cai de
  centenas para dezenas de KB.
- **Tree-shaking:** descarta o que você importou mas não usou.
- **Empacotamento:** junta dezenas de arquivos em poucos, para menos pedidos de rede.
- **Compressão:** o servidor ainda comprime (gzip) na entrega. O build mostra: `487 kB (141 kB gzip)`.

🧪 **Experimente:** rode `npm run build` e depois `npm run preview`. O `preview` serve a pasta `dist/`
localmente: é **exatamente** o que vai para o ar. Abra o endereço e confira se funciona **antes** de publicar.

### O site publicado é só arquivos
`dist/` contém **arquivos estáticos** (HTML, CSS, JS, imagens). Não há servidor seu rodando código. Toda a "lógica
de servidor" está no Supabase. Por isso hospedar é barato e simples: qualquer lugar que entregue arquivos serve.

---

## 3. Variáveis de ambiente em produção ⚠️

O seu `.env.local` **não vai** para o git (de propósito). Então a hospedagem não o tem. Se você publicar sem
configurar as variáveis, o site abre em **branco**, porque `supabase.ts` lança:

```
Faltam VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY no .env.local
```

Por isso cadastramos as duas variáveis **no painel do Vercel**, para o ambiente *Production*.

### Um fato que muda como você pensa em segurança
As variáveis `VITE_...` são **substituídas pelos valores durante o `build`**. O texto do valor passa a fazer parte
do arquivo JavaScript final. **Qualquer visitante consegue ler.** Por isso:

- ✅ A chave **publishable** pode ficar ali (é pública por desenho; o RLS protege os dados).
- ❌ **Nunca** coloque uma chave secreta (`service_role`, senha de banco) em variável `VITE_`. Ela ficaria
  visível para o mundo.

### Mudou uma variável? É preciso um novo deploy
Como o valor é "queimado" no build, alterar a variável no painel **não** muda o site. É preciso **republicar**.

---

## 4. O que é o Vercel e como o deploy acontece

**Vercel** é uma hospedagem especializada em sites front-end. Conceitos:

| Conceito | O que é |
|---|---|
| **Projeto** | O seu site (`vault-keeper`) |
| **Deployment** | Uma **versão publicada** (cada uma tem URL própria, ex.: `vault-keeper-3p3zdyiww-...vercel.app`) |
| **Production** | A versão "oficial", ligada ao endereço principal |
| **Preview** | Versões de teste (por branch ou Pull Request) |
| **Alias** | O endereço amigável que aponta para o deployment atual de produção (`vault-keeper-zeta.vercel.app`) |

### O que o Vercel faz a cada deploy
```
1. Baixa o código do GitHub (aquele commit)
2. Instala as dependências (npm install)
3. Roda o build (npm run build)
4. Publica a pasta dist/ numa rede mundial de servidores (CDN)
5. Move o alias para a versão nova
```
Dura cerca de 10 a 15 segundos neste projeto.

### Deploy automático: o que acontece no seu `git push`
Com o repositório ligado ao Vercel, **cada `push` na `main` dispara um deploy de produção** sozinho. No painel
(aba *Deployments*) você vê cada um com a mensagem do commit.

Na sua lista de deploys, repare nos ícones:
- `-o-` (commit): deploy disparado por um **push** no GitHub.
- `>_` (terminal): deploy feito **pela linha de comando** (`vercel deploy`).

### Também dá para publicar sem git (como fizemos na primeira vez)
```bash
npx vercel@latest login              # entra na conta (você aprova no navegador)
npx vercel@latest link               # liga esta pasta a um projeto
npx vercel@latest env add NOME production   # adiciona uma variável
npx vercel@latest deploy --prod      # publica da pasta local
npx vercel@latest ls                 # lista os deploys
```
O fluxo recomendado é pelo git: fica **registrado**, é reproduzível e dispensa comandos extras.

---

## 5. A regra de reescrita para as rotas (`vercel.json`)

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
Sem isso, abrir `/catalog` direto daria 404 (capítulo 06). Se o site publicado quebrar só ao **recarregar** páginas
internas, é esta regra que falta.

---

## 6. Configurar o Supabase para o endereço publicado

Depois de publicar, o Supabase precisa **conhecer** o endereço novo:

| Onde | O que colocar | Para quê |
|---|---|---|
| **Authentication → URL Configuration → Site URL** | `https://vault-keeper-zeta.vercel.app` | Destino padrão dos links de e-mail |
| **Redirect URLs** | O mesmo endereço (com `/**` no final para aceitar qualquer página) | A lista de destinos **permitidos** (segurança contra *open redirect*) |

Sem isso, o link de confirmação de e-mail mandaria o usuário para `localhost`, que só existe **no seu computador**.

---

## 7. Cache: por que "não atualizou"?

Navegadores guardam cópias de arquivos para carregar mais rápido. Depois de publicar, às vezes você ainda vê a
versão antiga.

| O que parece não atualizar | Por quê | O que fazer |
|---|---|---|
| A página inteira | Cache do navegador | `⌘⇧R` (recarregar ignorando o cache) |
| **O ícone da aba (favicon)** | Navegadores (principalmente o Safari) o guardam por **muito** tempo | Feche e reabra a aba; ou esvazie o cache do Safari |
| Dados do banco | Raramente cache; costuma ser outra coisa | Veja o capítulo 08 (RLS) |

Os arquivos do `assets/` usam **hash no nome**, então não sofrem desse problema. Já `favicon.svg` e `index.html`
têm nomes fixos e podem ficar "presos" no cache.

---

## 8. Investigando quando algo dá errado em produção

Um roteiro, do mais barato ao mais caro:

1. **Funciona no `npm run preview`?** Se não, o problema está no **build**, não na hospedagem.
2. **Console do navegador** (`⌥⌘J`, aba Console): erros de JavaScript aparecem ali.
3. **Aba Network (Rede):** o pedido ao Supabase falhou? Qual o código (401, 403, 404)?
4. **Painel do Vercel → Deployments → o deploy → Build Logs:** erros de compilação.
5. **Variáveis de ambiente:** estão no ambiente certo (*Production*)? Houve novo deploy depois de mudá-las?
6. **Supabase → Logs:** o que o banco respondeu?

| Sintoma no site publicado | Causa mais provável |
|---|---|
| Página em **branco** | Variáveis de ambiente ausentes (veja o console) |
| 404 ao recarregar uma rota | Falta o `rewrites` no `vercel.json` |
| Funciona local, mas **sem dados** no ar | URL/chave erradas, ou RLS bloqueando |
| Login manda para `localhost` | *Site URL* do Supabase não foi atualizada |
| Deploy "falhou" | Erro de TypeScript no `tsc -b` (leia o log) |
| Versão antiga aparecendo | Cache do navegador |

### Voltar atrás
O Vercel guarda **todos** os deploys antigos. Se publicar algo quebrado, no painel você pode **promover** um
deploy anterior para produção em segundos. (E, pelo git, também dá para `git revert` e dar `push`.)

---

## 9. Proteção de deployments (um detalhe que confunde)

Quando você consultou a URL longa de um deploy específico (`vault-keeper-qfmkslng0-...vercel.app`), ela devolveu
**302** (redirecionamento para login do Vercel). Isso é a **Deployment Protection**: URLs de versões específicas
exigem login da sua conta. O **alias** de produção (`vault-keeper-zeta.vercel.app`) é público. Não é erro; é o
padrão do Vercel.

---

## 10. Endereço próprio (domínio)

Para algo como `meucatalogo.com.br`:
1. Comprar o domínio (registro.br, Namecheap etc.), ou usar um que você já tenha.
2. No Vercel: *Settings → Domains → Add* e seguir as instruções (apontar o DNS).
3. Atualizar **Site URL** e **Redirect URLs** no Supabase com o endereço novo.

Alternativa simples e gratuita: **renomear o projeto** no Vercel muda o `.vercel.app` (por exemplo, para
`vault-keeper.vercel.app`, se estiver livre).

---

## 11. Checklist antes de publicar

- [ ] `npx tsc -b`, `npm test` e `npm run build` passam.
- [ ] `npm run preview` abre e funciona.
- [ ] Nenhum segredo no código ou no histórico do git.
- [ ] Variáveis de ambiente cadastradas no ambiente *Production*.
- [ ] `vercel.json` com a regra de reescrita.
- [ ] URLs do Supabase atualizadas.
- [ ] Cadastro/e-mail de confirmação configurados como você quer (capítulo 13).
- [ ] Você abriu o site publicado e **usou** (não só olhou).

---

## Exercícios
1. Rode `npm run build` e abra a pasta `dist/`. Quantos arquivos? Qual o tamanho do `.js`? Rode `npm run preview`
   e use o site.
2. Mude uma linha de texto, rode o build de novo e compare os **nomes** dos arquivos em `assets/`. O que mudou?
3. Pelo painel do Vercel, abra um deploy antigo e veja os *Build Logs*. Em que passo cada um demora mais?
4. Crie um projeto de estudo (um "olá mundo" em Vite), publique-o no Vercel pelo GitHub e confirme o deploy
   automático a cada `push`.
5. **Desafio:** quebre o build de propósito (um erro de tipo), dê `push` numa **branch** (não na `main`) e veja o
   Vercel recusar o deploy sem afetar o site no ar.

✅ **Checklist do capítulo 12**
- [ ] Explico as diferenças entre desenvolvimento e produção.
- [ ] Sei o que `tsc -b && vite build` faz e o que sai em `dist/`.
- [ ] Explico o hash nos nomes dos arquivos.
- [ ] Explico por que variáveis `VITE_` ficam visíveis e o que **nunca** pôr nelas.
- [ ] Descrevo o que o Vercel faz a cada `push`.
- [ ] Sei por que a regra de reescrita existe e o que o Supabase precisa saber do endereço novo.
- [ ] Sigo o roteiro de investigação quando algo falha só em produção.

Próximo: [13. Segurança](13-seguranca.md).
