# 11. Git e GitHub

## Objetivo
Dominar o fluxo básico que você usou ao longo do projeto (`status`, `add`, `commit`, `push`), entender o que cada
comando faz por baixo, saber **desfazer** coisas com segurança e conhecer o próximo nível (branches e Pull
Requests).

---

## 1. A ideia: fotografias do projeto

**Git** é um sistema que guarda o **histórico** do seu código como uma sequência de **fotografias**
(*commits*). Cada commit registra:
- o estado de **todos os arquivos** naquele momento;
- **quem** fez, **quando**;
- uma **mensagem** dizendo o que mudou e por quê.

Você pode voltar a qualquer fotografia antiga. Por isso o git é a sua **rede de segurança**: experimente à vontade,
porque o que está commitado sempre se recupera.

**GitHub** é um site que guarda uma **cópia do repositório na nuvem**. Git é a ferramenta; GitHub é um serviço
que a usa. (Existem outros, como GitLab.) O Vercel lê o GitHub para publicar o site.

---

## 2. As três "áreas" do git (o modelo mental que resolve 90% das confusões)

```
┌────────────────────┐   git add    ┌───────────────┐  git commit  ┌─────────────────┐  git push  ┌──────────┐
│  Pasta de trabalho │ ───────────► │ Área de       │ ───────────► │ Repositório     │ ─────────► │ GitHub   │
│  (seus arquivos,   │              │ preparação    │              │ local           │            │ (nuvem)  │
│  como você edita)  │              │ ("staging")   │              │ (histórico)     │            │          │
└────────────────────┘              └───────────────┘              └─────────────────┘            └──────────┘
```

| Etapa | Pergunta que responde |
|---|---|
| **Editar** | Você muda arquivos normalmente |
| **`add`** | "**Quais** mudanças vão entrar na próxima foto?" |
| **`commit`** | "Tire a foto, com esta mensagem" |
| **`push`** | "Envie as fotos novas para o GitHub" |

⚠️ **Por isso "fazer o push" sozinho não envia suas edições.** O `push` só envia **commits**. Edições não
commitadas ficam só no seu computador. Foi exatamente o que aconteceu quando você pediu "outro push" e não havia
nada para enviar: a sua mudança estava só na pasta de trabalho.

---

## 3. Os comandos, um por um

### `git status`: "o que está acontecendo?"
O comando que você mais usa. **Rode sempre antes de qualquer outro.**
```bash
git status          # completo
git status -sb      # curto: uma linha por arquivo + a situação da branch
```

Saída curta:
```
## main...origin/main [ahead 1]
 M src/pages/PublicCatalog.tsx
?? estudos/
```

| Símbolo | Significa |
|---|---|
| `M` (modified) | Arquivo existente que mudou |
| `??` | Arquivo **novo**, que o git ainda não conhece |
| `A` | Novo e já preparado (`add`) |
| `[ahead 1]` | Você tem **1 commit** que ainda não foi enviado ao GitHub |
| `main...origin/main` sem nada depois | Tudo sincronizado |

### `git diff`: "o que exatamente mudou?"
```bash
git diff                          # mudanças ainda não preparadas
git diff src/pages/Catalog.tsx    # só um arquivo
```
Mostra linha por linha: `-` (em vermelho) removida, `+` (em verde) adicionada. **Leia o diff antes de
commitar**: foi assim que achamos o seu `<h1></h1>` vazio.

### `git add`: escolher o que entra
```bash
git add src/pages/Catalog.tsx       # um arquivo
git add src/                        # uma pasta
git add -A                          # TUDO (use com cuidado: confira antes com git status)
```
⚠️ `git add -A` é conveniente, mas pode levar junto algo que você não queria (um arquivo de teste, uma edição
esquecida). **Prefira nomear os arquivos**, ou revise o `git status` logo antes.

### `git commit`: tirar a foto
```bash
git commit -m "Remove o título da página do catálogo público"
```
A mensagem fica no histórico **para sempre**. Veja a seção 5 sobre como escrevê-las.

### `git log`: ver o histórico
```bash
git log --oneline            # uma linha por commit
git log --oneline -5         # só os 5 últimos
```
O histórico real do projeto (o mais recente primeiro) tem este formato:
```
61843e9 Ícone da aba com o coelho em alta resolução
ecf29fa Troca o ícone da aba pelo coelhinho
b66359e Remove o título da página do catálogo público
2e7fc52 Modo mosaico e botões de visualização só com símbolos
647caad Importação em massa de capas, com leitura do nome do arquivo
...
cea1611 Catálogo de revistas: login, CRUD, capas, busca e edição
```
Cada código (`61843e9`) é o **identificador** da fotografia.

### `git push` e `git pull`
```bash
git push        # envia seus commits ao GitHub
git pull        # traz commits do GitHub que você ainda não tem
```

### `git remote`: onde fica a cópia da nuvem
```bash
git remote -v                  # mostra os endereços
git remote add origin <url>    # registra o endereço (feito uma vez)
```
`origin` é só o **apelido** convencional do repositório remoto principal. O `-u` no primeiro push
(`git push -u origin main`) memoriza o destino, e depois basta `git push`.

---

## 4. Desfazendo coisas (a parte que dá tranquilidade)

| Situação | Comando | Cuidado |
|---|---|---|
| Quero **descartar** minhas edições num arquivo, voltando ao último commit | `git restore src/App.tsx` | ⚠️ **Perde as edições, sem volta** |
| Tirei um arquivo da área de preparação (`add` por engano) | `git restore --staged arquivo` | Seguro: mantém a edição |
| Errei a **mensagem** do último commit (ainda não enviado) | `git commit --amend -m "nova mensagem"` | Só se ainda **não** deu `push` |
| Quero **desfazer um commit já enviado** sem reescrever a história | `git revert <código>` | Cria um commit novo que desfaz o anterior |
| Quero **ver** como o projeto era antes | `git log` + `git show <código>` | Só leitura |

### A regra para mexer sem medo
> **Commite antes de arriscar.** Tudo que está commitado se recupera. Tudo que não está, não.

O `git restore` é seguro justamente porque, se você commita com frequência, o pior que perde são alguns minutos
de edição.

### Nunca faça (sem entender) em um repositório compartilhado
`git push --force` e `git reset --hard`: reescrevem ou descartam história. Podem apagar o trabalho de outras
pessoas e **não têm desfazer fácil**.

---

## 5. Mensagens de commit que ajudam o seu eu do futuro

**Bom commit:** pequeno, sobre **um assunto**, com mensagem que explica o **porquê**.

```
✅ Card esconde a condição quando não informada
✅ Revistas novas entram públicas; ano e mês passam a ser opcionais
✅ Adiciona vercel.json para rotas da SPA

❌ ajustes
❌ mudanças
❌ asdf
```

Estrutura recomendada:
```
Linha de resumo curta (até ~70 caracteres), no presente

Corpo opcional: explica o PORQUÊ, o que foi considerado, o que mudou.
Por exemplo: "Sem a regra, abrir /catalog direto retorna 404, porque
o servidor procura um arquivo com esse nome."
```

### O que significa a linha `Co-Authored-By: ...` que aparece nos commits
Nos commits que fizemos juntos, a última linha indica **coautoria**: um jeito padrão do git de registrar que mais de
uma "mão" participou. É só texto na mensagem, que o GitHub reconhece e exibe.

### Commits pequenos e frequentes
Um commit gigante ("fiz tudo ontem") é impossível de revisar e de desfazer parcialmente. **Um commit por ideia**
permite voltar atrás só no que deu errado. Neste projeto, repare que o visual, os testes e o ícone viraram commits
**separados**.

---

## 6. O `.gitignore`: o que o git **não** deve guardar

📁 `.gitignore`:
```
node_modules       ← milhares de arquivos baixados; o npm recria
dist               ← o resultado do build; se recria
*.local            ← .env.local e similares: SEGREDOS
.env*              ← qualquer arquivo de ambiente
.vercel            ← ligação local com a hospedagem
.DS_Store          ← lixo do macOS
```

Duas regras de ouro:
1. **Nunca** commite segredos (chaves, senhas, tokens). O histórico do git **é permanente**: se um segredo entrar
   num commit e você apagar depois, **ele continua no histórico**. A única solução segura é **trocar a chave**.
2. Só o que se **reproduz** (`node_modules`, `dist`) fica de fora. O `package-lock.json`, que garante as mesmas
   versões para todos, **entra** no git.

Antes de commitar algo novo, uma verificação de 5 segundos:
```bash
git status        # esse arquivo deveria estar aqui?
```
Foi assim que conferimos que o `.env.local` **não** estava na lista antes do primeiro commit.

---

## 7. Fazendo isso pelo IntelliJ

| Ação | Atalho/Caminho |
|---|---|
| Janela de commit (com o diff ao lado) | `⌘K` |
| **Commit and Push** | Setinha ao lado de **Commit** → *Commit and Push...* |
| Só push | `⌘⇧K` |
| Ver histórico | Aba **Git** (canto inferior) → *Log* |
| Ver o que mudou em um arquivo | Clique duplo na lista da janela de commit |
| Descartar edições de um arquivo | Clique direito → *Rollback* (equivale ao `restore`) |
| Linhas alteradas na margem do editor | Barras **verdes** (novas) e **azuis** (alteradas) |

A interface e o terminal fazem **exatamente** a mesma coisa. Aprenda os comandos no terminal (sempre funciona
em qualquer lugar) e use a interface para ganhar velocidade.

### Problemas comuns no push
| Mensagem | Significado | O que fazer |
|---|---|---|
| Pede usuário e senha | O GitHub **não aceita mais senha** em pushes | Use um **Personal Access Token**, ou o login do IntelliJ (*Settings → Version Control → GitHub*) |
| `rejected ... non-fast-forward` | O GitHub tem commits que você não tem | `git pull` primeiro; **não force** |
| `Updates were rejected` | O mesmo de cima | `git pull` e resolva conflitos, se houver |

---

## 8. Branches e Pull Requests (o próximo nível)

Até agora trabalhamos só na `main`. Em equipes (e em projetos maiores), o fluxo é:

```
main ──●────●────●─────────────────────●──►   (a versão "oficial")
              \                       /
 minha-ideia   ●───●───●───●─────────●        (uma "linha paralela" para trabalhar sem risco)
                              Pull Request: "posso juntar minha linha na main?"
```

```bash
git switch -c adiciona-wishlist       # cria e entra numa branch nova
# ... edita, commita à vontade ...
git push -u origin adiciona-wishlist  # envia a branch
# No GitHub: abrir um Pull Request, revisar, aprovar, "Merge"
```

**Por que usar branches?**
- A `main` fica **sempre funcionando** (e é o que o Vercel publica).
- Você experimenta sem risco; se não der certo, descarta a branch.
- O **Pull Request** é o momento de **revisar** o código antes de juntar.

O Vercel também cria um **link de pré-visualização** para cada branch/PR, para você testar antes de publicar.

---

## 9. Um fluxo de trabalho diário completo

```bash
git status                       # 1. onde estou? tem algo pendente?
# ... trabalha no código ...
npx tsc -b && npm test           # 2. está tudo bem?
git status                       # 3. o que mudei?
git diff                         # 4. confiro linha por linha
git add src/components/X.tsx     # 5. escolho o que entra
git commit -m "Descreve a mudança"   # 6. tiro a foto
git push                         # 7. envio (e o Vercel publica sozinho)
```

---

## Erros comuns
| Sintoma | Causa | Solução |
|---|---|---|
| "Fiz push e não subiu nada" | Não fez o commit antes | `git status`, depois `add` e `commit` |
| Arquivo secreto entrou no histórico | Faltou o `.gitignore` | Troque a chave **imediatamente** e corrija o `.gitignore` |
| `git add -A` levou algo indesejado | Não conferiu o status | Prefira `add` com nomes de arquivo; confira antes |
| Perdi minhas edições | Usou `git restore` com edições não commitadas | Commite com frequência |
| Commit gigante e confuso | Acumulou muito trabalho | Commits menores, um por ideia |

## Exercícios
1. Rode `git log --oneline` e escolha um commit. Com `git show <código>`, descreva em uma frase o que ele mudou.
2. Faça uma mudança pequena, rode `git diff`, comite com uma boa mensagem e confira com `git log -1`.
3. Faça outra mudança e **descarte-a** com `git restore`. Confirme que sumiu.
4. Crie uma branch `experimento`, faça um commit nela e volte para a `main` com `git switch main`. Seu commit
   "sumiu"? Volte à branch e confira. Depois apague com `git branch -D experimento`.
5. Escreva, para os seus últimos 3 commits, mensagens **melhores** e justifique.
6. **Desafio:** no GitHub, abra um Pull Request de uma branch pequena para a `main` e junte (*Merge*). Veja o
   Vercel gerar o deploy.

✅ **Checklist do capítulo 11**
- [ ] Explico as três áreas e por que `push` sozinho não envia edições.
- [ ] Uso `status`, `diff`, `add`, `commit`, `log` e `push` sem consultar.
- [ ] Sei descartar edições (`restore`) e desfazer um commit enviado (`revert`).
- [ ] Escrevo mensagens que explicam o porquê.
- [ ] Sei o que vai e o que não vai no git, e por que segredos nunca entram.
- [ ] Faço commit e push pelo IntelliJ e pelo terminal.
- [ ] Explico o fluxo de branches e Pull Requests.

Próximo: [12. Build e deploy](12-build-e-deploy.md).
