# 01. Ferramentas: terminal, Node, npm, Vite e IntelliJ

## Objetivo
Perder o medo do terminal e entender as ferramentas que ficam *entre* você e o código: o que `npm install` faz de
verdade, o que há dentro do `package.json`, o que o Vite entrega e como as variáveis de ambiente funcionam.

---

## 1. O terminal

O terminal é uma janela onde você **digita comandos em vez de clicar**. Parece antigo, mas é mais rápido, repetível
e é como todas as ferramentas de programação funcionam por baixo.

### A regra que mais evita erros: o terminal "está em algum lugar"

O terminal sempre está dentro de uma pasta, e o prompt mostra qual:

```
unknown1@UNKNOWN3 vault-keeper %
                  └── pasta atual
```

Comandos do projeto (`npm install`, `npm run dev`, `git status`) só funcionam **dentro da pasta do projeto**.
No começo deste projeto, vários erros `ENOENT ... package.json` aconteceram porque o terminal estava em `~` ou em
`~/dev`, e o `package.json` está em `~/dev/vault-keeper`. A mensagem de erro dizia exatamente isso:
`open '/Users/unknown1/dev/package.json'`. **Ler o caminho no erro resolve metade dos problemas.**

### Comandos essenciais

| Comando | O que faz | Exemplo |
|---|---|---|
| `pwd` | Mostra a pasta atual | `pwd` |
| `ls` | Lista os arquivos | `ls -la` (inclui ocultos e detalhes) |
| `cd` | Entra numa pasta | `cd ~/dev/vault-keeper` |
| `cd ..` | Sobe uma pasta | |
| `mkdir` | Cria pasta | `mkdir -p estudos` |
| `cat` | Mostra o conteúdo de um arquivo | `cat package.json` |
| `cp` | Copia | `cp a.txt b.txt` |
| `mv` | Move ou renomeia | `mv antigo.txt novo.txt` |
| `rm` | **Apaga, sem lixeira e sem volta** | `rm arquivo.txt` |
| `clear` | Limpa a tela | ou `⌘K` |

Símbolos úteis: `~` é a sua pasta pessoal; `.` é a pasta atual; `..` é a pasta de cima; `&&` encadeia comandos
("rode o segundo só se o primeiro der certo").

🧪 **Experimente:** no terminal do IntelliJ (`⌥F12`), rode `pwd` e depois `ls`. Depois `cd src` e `ls` de novo.
Volte com `cd ..`.

⚠️ **Cuidado com o `rm`:** não existe lixeira. Antes de apagar, rode `ls` para ver o que vai sumir. Dentro de um
repositório git, o que está commitado sempre dá para recuperar; o que não está, não.

---

## 2. Node.js, npm e npx: quem é quem

| Nome | O que é | Analogia |
|---|---|---|
| **Node.js** | Programa que executa JavaScript fora do navegador | O "motor" |
| **npm** | Gerenciador de pacotes que acompanha o Node | A "loja de peças" |
| **npx** | Executa um pacote sem instalá-lo definitivamente | "Experimentar na loja" |

Por que precisamos do Node se o app roda no navegador? Porque as **ferramentas de desenvolvimento** (Vite,
TypeScript, Vitest) são programas escritos em JavaScript e rodam no Node. O app final roda no navegador, mas
*construí-lo* usa o Node.

---

## 3. O `package.json`: a "receita" do projeto

Abra `package.json`. Ele tem três partes que importam:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "oxlint",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.117.2",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.4"
  },
  "devDependencies": {
    "typescript": "~6.0.2",
    "vite": "^8.3.0",
    "vitest": "^5.0.3"
  }
}
```

### `scripts`: atalhos para comandos longos
Você roda `npm run dev` e o npm executa `vite`. É só um apelido.

| Comando | Faz | Quando usar |
|---|---|---|
| `npm run dev` | Sobe o servidor local com recarga automática | O dia a dia |
| `npm run build` | Confere os tipos (`tsc -b`) e gera a versão final em `dist/` | Antes de publicar |
| `npm test` | Roda todos os testes uma vez | Antes de cada commit |
| `npm run test:watch` | Fica rodando os testes a cada salvamento | Enquanto escreve código |
| `npm run lint` | Aponta práticas duvidosas | Antes de commitar |

(`npm test` e `npm start` são os únicos que dispensam o `run`.)

### `dependencies` × `devDependencies`
- **`dependencies`**: o app **precisa** no navegador (React, Supabase, Router).
- **`devDependencies`**: só ajudam **enquanto desenvolve** (TypeScript, Vite, Vitest).

### Os símbolos `^` e `~` (versionamento semântico)
Versões têm três números: `MAIOR.MENOR.CORREÇÃO`, por exemplo `19.2.8`.
- `^19.2.8` aceita atualizar para `19.x.x` (menor e correção, nunca o maior).
- `~6.0.2` aceita só `6.0.x` (apenas correções).
- Sem símbolo: exatamente aquela versão.

O número **maior** muda quando algo quebra a compatibilidade; por isso o `^` não pula para ele.

### `node_modules` e `package-lock.json`
- **`node_modules/`**: onde o npm baixa tudo. É enorme e **nunca vai para o git** (está no `.gitignore`).
  Se apagar, `npm install` recria.
- **`package-lock.json`**: registra a versão **exata** de cada pacote instalado, para que todos tenham o mesmo
  ambiente. **Este vai para o git.**

### Instalando e removendo
```bash
npm install                      # instala tudo o que o package.json pede
npm install react-router-dom     # instala um pacote e o registra em dependencies
npm install -D vitest            # -D registra em devDependencies
npm uninstall nome-do-pacote     # remove
```

---

## 4. Vite: o que ele faz por você

O navegador entende HTML, CSS e JavaScript. Mas escrevemos **TypeScript** e **JSX**, que o navegador não entende.
O Vite faz a ponte:

- **No desenvolvimento (`npm run dev`):** traduz os arquivos sob demanda e atualiza a página no instante em que
  você salva (isso se chama HMR, *Hot Module Replacement*).
- **Na produção (`npm run build`):** junta tudo, traduz, minimiza e gera uma pasta `dist/` com poucos arquivos
  rápidos de baixar.

📁 **No projeto:** `index.html` tem uma `<div id="root">` vazia e uma linha
`<script type="module" src="/src/main.tsx">`. O `main.tsx` pega essa `div` e "monta" o React dentro dela:

```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Tudo** que você vê no site nasce dessa linha. O resto é o `App` e seus filhos.

(`StrictMode` é uma ajuda só do desenvolvimento: ele roda certas coisas duas vezes de propósito para revelar
bugs escondidos. Não afeta o site publicado.)

### A pasta `public/`
Arquivos aqui são servidos **exatamente como estão**, sem processamento. Por isso os ícones da aba
(`favicon.svg`, `icon-512.png`) moram lá.

---

## 5. Variáveis de ambiente: configuração fora do código

O app precisa saber o endereço e a chave do Supabase. Escrever isso direto no código seria ruim (e para segredos,
perigoso). A solução: **variáveis de ambiente**, guardadas em um arquivo à parte.

`.env.local` (fora do git):
```
VITE_SUPABASE_URL=https://....supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

No código (`src/lib/supabase.ts`):
```ts
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('Faltam VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY no .env.local')
}
```

Pontos importantes:

1. **O prefixo `VITE_` é obrigatório.** O Vite só envia ao navegador as variáveis que começam com ele. É uma
   proteção: o `VERCEL_OIDC_TOKEN` que a CLI colocou no mesmo arquivo **não** chega ao site.
2. **O erro que lançamos de propósito** (`throw new Error`) é uma boa prática: se faltar configuração, o app falha
   *alto e claro*, em vez de abrir em branco e deixar você adivinhando.
3. **Essas variáveis são "queimadas" no código na hora do build.** O valor vira texto dentro do JavaScript final.
   Qualquer visitante consegue lê-las no navegador. Por isso só colocamos ali o que **pode** ser público (a chave
   *publishable*), e jamais uma chave secreta.
4. **O arquivo `.env.local` não vai para o git.** O `.gitignore` tem as linhas `*.local` e `.env*`.
   Cada ambiente (seu Mac, o Vercel) recebe os seus valores por outro caminho.

⚠️ **Cuidado:** depois de mudar o `.env.local`, **reinicie** o `npm run dev`. O Vite só lê o arquivo ao iniciar.

---

## 6. Os arquivos `tsconfig`

Configuram o TypeScript. Você não precisa decorar, mas vale conhecer três opções do `tsconfig.app.json`:

| Opção | O que faz | Por quê |
|---|---|---|
| `"noUnusedLocals": true` | Erro se uma variável é declarada e não usada | Mantém o código limpo |
| `"verbatimModuleSyntax": true` | Exige `import type` para tipos | Deixa claro o que existe só na compilação |
| `"erasableSyntaxOnly": true` | Proíbe recursos de TS que geram código extra | Mantém o TS "puro" |

Esse rigor é a razão de o TypeScript te avisar de coisas pequenas, como o `use` importado e nunca usado que
apareceu no começo do projeto.

---

## 7. IntelliJ: atalhos que valem ouro (Mac)

| Atalho | Faz |
|---|---|
| `⌘⇧O` | Abre qualquer arquivo pelo nome |
| `⌘B` | Vai à definição do que está sob o cursor |
| `⌘E` | Arquivos recentes |
| `⇧F6` | **Renomeia com segurança**, atualizando todos os usos |
| `⌥⏎` | Mostra correções e sugestões para o erro sob o cursor |
| `⌘/` | Comenta/descomenta a linha |
| `⌥F12` | Abre/fecha o terminal |
| `⌘K` | Janela de **commit** |
| `⌘⇧K` | **Push** |
| `⌘⇧F` | Busca em todos os arquivos do projeto |

🧪 **Experimente:** abra `Catalog.tsx`, clique sobre `applyFilters` e aperte `⌘B`. Você pula para `filters.ts`.
Para voltar, use `⌘[`.

---

## 8. A lista de verificação antes de cada commit

Um hábito profissional que custa 30 segundos:

```bash
npx tsc -b      # os tipos estão certos?
npm test        # os testes passam?
npm run build   # o build final funciona?
```

Se os três passam, o commit é seguro. Foi exatamente isso que fizemos antes de quase todo `git commit` deste
projeto.

---

## Erros comuns
| Sintoma | Causa provável | Solução |
|---|---|---|
| `ENOENT ... package.json` | Terminal na pasta errada | `cd ~/dev/vault-keeper` |
| `command not found: vite` | Esqueceu o `npm install` | `npm install` |
| Variável de ambiente `undefined` | Faltou o prefixo `VITE_` ou não reiniciou o servidor | Corrija o nome e reinicie |
| Site abre em branco | Erro de JavaScript | Abra o console do navegador (`⌥⌘J`) |

## Exercícios
1. Sem olhar este capítulo, liste o que cada script do `package.json` faz.
2. Rode `npm ls --depth=0`. Quais pacotes aparecem? Bate com `dependencies` + `devDependencies`?
3. Crie um arquivo `.env.local` de teste num projeto novo, com `VITE_OLA=mundo`, e mostre o valor na tela com
   `import.meta.env.VITE_OLA`. Depois renomeie a variável para `OLA` e veja o que acontece.
4. Apague a pasta `node_modules` e recupere-a com um comando. Quanto tempo levou?

✅ **Checklist do capítulo 01**
- [ ] Olho o prompt do terminal antes de rodar comandos do projeto.
- [ ] Sei a diferença entre Node, npm e npx.
- [ ] Explico `dependencies` × `devDependencies` e o significado do `^`.
- [ ] Sei o que é `node_modules` e por que não vai para o git.
- [ ] Explico por que o prefixo `VITE_` existe e por que a chave pública pode ficar no app, mas segredos não.
- [ ] Uso `tsc`, `test` e `build` antes de commitar.

Próximo: [02. JavaScript essencial](02-javascript-essencial.md).
