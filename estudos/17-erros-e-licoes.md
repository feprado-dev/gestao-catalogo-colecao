# 17. Erros e lições do projeto

## Por que este capítulo existe

Programadores experientes **não** erram menos. Eles **descobrem os erros mais rápido** e **sabem como investigar**.
Este capítulo reúne os tropeços **reais** que aconteceram ao construir o Vault Keeper, **inclusive os meus**
(o assistente também errou várias vezes). Cada caso segue o mesmo roteiro:

> **Sintoma** → **Causa** → **Como descobrimos** → **Lição**

Leia como histórias de detetive. Antes de ler a causa, tente adivinhar.

---

## O método de depuração em 7 passos

Todos os casos abaixo foram resolvidos com variações disto:

1. **Reproduza.** Consiga fazer o erro acontecer de novo, de forma previsível.
2. **Leia a mensagem inteira.** Ela quase sempre diz o problema, e muitas vezes a linha.
3. **Reduza.** Isole o menor trecho que ainda falha.
4. **Formule uma hipótese** ("acho que é X porque...").
5. **Teste a hipótese** com um experimento barato (um `console.log`, um `select`, uma inspeção).
6. **Conserte uma coisa por vez** e confira.
7. **Registre a lição** (e, se couber, escreva um teste que impeça o erro de voltar).

> **Nunca mude cinco coisas ao mesmo tempo.** Se funcionar, você não sabe qual resolveu. Se piorar, não sabe qual
> estragou.

---

# Grupo A: ambiente e ferramentas

### A1. `npm error code ENOENT ... package.json` (duas vezes)
- **Sintoma:** `npm run dev` e `cd vault-keeper && npm install` falharam com "no such file or directory".
- **Causa:** o terminal estava em `~` e depois em `~/dev`, mas o projeto está em `~/dev/vault-keeper`.
- **Como descobrimos:** a **mensagem dizia o caminho**: `open '/Users/unknown1/dev/package.json'`. O npm procurou o
  arquivo na pasta errada. O prompt também mostrava `dev %`, a pasta atual.
- **Lição:** o terminal sempre **está em algum lugar**. Antes de rodar um comando do projeto, olhe o prompt. *Leia o
  caminho no erro.*

### A2. `command not found: gh`
- **Sintoma:** o comando `gh repo clone ...` falhou.
- **Causa:** a CLI do GitHub não estava instalada.
- **Solução:** `git clone https://github.com/...` faz o mesmo e **já vem com o git**.
- **Lição:** muitas ferramentas têm um caminho alternativo. Quando o primeiro falha por falta de uma ferramenta,
  procure o que você **já tem**.

### A3. `sed -i` no Mac não fez o que o Linux faz
- **Sintoma:** tentei renomear `coverModel` para `cover_model` com `sed -i 's/.../.../g' arquivo`. O terminal
  reclamou (`undefined label`), mas o **TypeScript passou** (`TIPOS OK`) e o projeto parecia pronto.
- **Causa:** no macOS, o `sed -i` **exige um argumento a mais** (`sed -i '' ...`). O comando falhou e **a renomeação
  não aconteceu**. O TypeScript não reclamou porque o cliente do Supabase ainda não conhecia as colunas.
- **Como descobrimos:** uma `grep` depois mostrou que `coverModel` **continuava lá**.
- **Consequência se passasse batido:** o banco recusaria `coverModel` na hora de gravar.
- **Lição:** **"compilou" não é "funciona".** Depois de uma alteração em massa, **confirme** com uma busca
  (`grep -rn "nome" src`). E scripts de Linux nem sempre rodam igual no Mac.

### A4. Colar a chave no terminal errado
- **Sintoma:** o Vercel esperava um valor em um terminal, mas a chave apareceu em **outro**, rodando o servidor
  de desenvolvimento.
- **Causa:** eram **dois terminais diferentes** (o do app do Claude e o do IntelliJ). O comando foi aberto em um,
  a colagem aconteceu no outro.
- **Como descobrimos:** a captura de tela do usuário mostrou o texto no lugar errado, e o comando original
  continuava aguardando.
- **Lição:** confirme **qual janela está em foco** antes de colar. Em caso de dúvida, olhe o prompt da aba.
  (A chave era pública, então não houve dano. Com um segredo, teria sido um incidente.)

### A5. A animação "travou" no navegador de testes
- **Sintoma:** textos pareciam apagados numa captura de tela do tema claro; uma operação pesada estourou o tempo.
- **Causa:** o painel do navegador estava **oculto**, e navegadores **pausam ou desaceleram** animações e tarefas
  de abas escondidas. As cores estavam corretas; a captura pegou uma transição pela metade.
- **Como descobrimos:** medimos as **cores calculadas** (`getComputedStyle`) em vez de confiar no olho, e repetimos
  com a aba em primeiro plano.
- **Lição:** quando a imagem engana, **meça**. E teste o que é visual **com a janela visível**.

---

# Grupo B: código

### B1. Os tipos "mentiram": `null/null` na tela
- **Sintoma:** os cards mostravam `null/null` no lugar da data.
- **Causa:** `Magazine` dizia `year: number`, mas as 64 revistas importadas tinham `year = null`. O TypeScript
  **não consulta o banco**; ele confia no que você escreve.
- **Como descobrimos:** ao olhar o **site real** com dados reais. Na etapa de dados de exemplo, nunca apareceu.
- **Correção:** tipo honesto (`year: number | null`) e tratar o `null` em todo lugar. O TS apontou cada ponto.
- **Lição:** tipos descrevem o que você **acredita**, não o que os dados **são**. Dados que vêm de fora podem
  divergir. **Teste com dados reais.**

### B2. A classe CSS que não casava: `gallery--mosaic` × `gallery--mosaico`
- **Sintoma:** ao escolher o mosaico, apareceu **uma única capa gigante**.
- **Causa:** o código gera a classe a partir do nome do modo (`gallery--mosaico`), mas no CSS eu escrevi
  `.gallery--mosaic`. Nenhuma regra se aplicou.
- **Como descobrimos:** **olhando a tela**. O TypeScript e os testes passaram (classes de CSS são só texto).
- **Lição:** alguns erros **só** aparecem olhando. Teste visual e teste automático se complementam. E evite
  duplicar um nome em dois lugares: aqui, a classe poderia vir de **uma constante**.

### B3. Os botões roxos
- **Sintoma:** os botões da página inicial (que são `<a>`) saíram com texto roxo.
- **Causa:** o navegador tem uma regra de cor para links; a nossa `.btn` não definia `color`.
- **Como descobrimos:** o olho, numa captura. A inspeção mostraria a regra do navegador sobrepondo.
- **Lição:** a **cascata**. Cor "inexplicável" costuma ser uma regra do navegador que você não sobrescreveu.

### B4. `undefined` × `null` ao editar
- **Sintoma (previsto):** o usuário apaga o "Modelo da capa" e salva, mas o valor antigo continua.
- **Causa:** `|| undefined` faz o campo **sumir do envio**, e o banco entende "não mexa". Só `null` esvazia.
- **Como descobrimos:** ao **raciocinar sobre o envio** antes de o bug aparecer em produção.
- **Lição:** em atualizações parciais, `undefined` = "não mencionei", `null` = "limpe isto".

### B5. O filtro que faltava: coleção misturada
- **Sintoma (previsto):** a "Minha coleção" mostraria também revistas **públicas de outras pessoas**.
- **Causa:** a política pública deixava qualquer um (inclusive logado) ler as públicas; `select('*')` sem
  filtro traria todas.
- **Como descobrimos:** ao **pensar nas consequências da nova política** antes de ela ir ao ar.
- **Lição:** o RLS decide o que *pode* ser lido; o filtro decide o que *você quer* ver. **Pense no efeito colateral
  de cada mudança de segurança.**

### B6. O `import { use, useState }` que sobrou
- **Sintoma:** o TypeScript acusou uma variável importada e nunca usada.
- **Causa:** muito provavelmente o `use` entrou pelo autocompletar do editor, durante o teste do IntelliJ.
- **Lição:** o rigor do compilador (`noUnusedLocals`) mantém o código limpo. **Aceite os avisos**, não os silencie.

### B7. A edição que falhou por causa de uma edição simultânea
- **Sintoma:** uma alteração automática não aplicou, porque o texto procurado não existia mais.
- **Causa:** você tinha mudado o botão de "Apagar" para "Deletar" **ao mesmo tempo**.
- **Lição:** editar o mesmo arquivo em dois lugares gera conflito. **Avise** (ou releia) quando mexer em um
  arquivo que outra pessoa/ferramenta também edita. Isto é o que o git ajuda a gerenciar.

### B8. Teste vermelho de propósito
- **Sintoma:** `Cannot find module './parseCoverFilename'` ao rodar os testes.
- **Causa:** era **intencional**: no TDD, o primeiro passo é ver o teste **falhar**.
- **Lição:** um teste que **nunca** falhou não prova nada. Quebre de propósito para validar.

---

# Grupo C: dados e banco

### C1. "O banco está vazio": 0 linhas... que na verdade eram 133 ⚠️ (erro do assistente)
- **Sintoma:** a ferramenta de listagem de tabelas mostrou `rows: 0`. **Afirmei** que não havia dados reais em
  risco e que podíamos reaproveitar o banco com segurança.
- **Causa:** aquele número vinha de uma **estimativa do painel**, desatualizada. Uma consulta de verdade,
  `select count(*)`, revelou **133 revistas**.
- **Como descobrimos:** ao preparar o fechamento do cadastro, rodei uma contagem real antes de mexer em qualquer
  coisa.
- **Consequência:** nada foi alterado até então (só leituras), mas a informação que dei estava errada.
- **Lição (a mais importante do capítulo):** **estimativas não são fatos.** Antes de afirmar algo sobre dados,
  rode uma consulta de verdade. E: **diga quando errar**, corrija e siga.

### C2. 69 revistas "órfãs" invisíveis
- **Sintoma:** 64 + 0 não somavam 133. Havia 69 revistas **sem dono** que nenhuma conta enxergava.
- **Causa:** `user_id` **não tinha chave estrangeira**. Quando o dono (uma conta antiga) foi apagado, as
  revistas ficaram, apontando para um usuário que não existe. O RLS só mostra ao dono, então ninguém as via. As
  imagens delas também tinham sumido do Storage (capas quebradas).
- **Como descobrimos:** uma consulta que juntou `magazines` com `auth.users` (`left join`) mostrou `dono_existe: false`.
- **Lição:** **chave estrangeira com `on delete cascade`** teria apagado as revistas junto com o usuário (sem
  órfãs). Dados sem dono são lixo invisível. **Modele as relações no banco, não só na cabeça.**

### C3. A consulta voltou `[]` e não um erro
- **Sintoma:** o teste de ataque (sem login) devolveu uma lista vazia, em vez de "acesso negado".
- **Causa:** é assim que o RLS funciona: **filtra em silêncio**. (E as revistas eram privadas.)
- **Lição:** vazio **não** quer dizer "não existe". Se uma consulta volta vazia e você tem certeza de que há dados,
  **suspeite do RLS primeiro.**

### C4. A coluna que existia só no painel
- **Sintoma:** o código usava `is_public`, mas nenhuma migration do repositório original a criava.
- **Causa:** a coluna e a política pública foram criadas **direto no painel**, sem versionar.
- **Lição:** configuração que vive só num painel é configuração que ninguém audita nem consegue **recriar**.
  Versione o banco com migrations.

### C5. A conta apagada antes do delete
- **Sintoma:** depois de pedir ao usuário que rodasse o `delete` das duplicatas, **o banco não tinha mudado**
  (ainda 69 + 64), mas a conta de agosto tinha **sumido**.
- **Causa:** o usuário tinha removido a conta no painel (um passo opcional do plano) e respondido "tudo ok",
  mas o `delete` **não foi executado**.
- **Como descobrimos:** **reli o banco antes de agir**, em vez de confiar na resposta.
- **Lição:** **verifique o estado real antes de cada passo seguinte.** "Tudo ok" é uma informação; o banco é a
  verdade.

### C6. `DELETE 0` e "Success. No rows returned"
- **Sintoma:** primeiro, um `0`; depois, a mensagem "Success. No rows returned" ao rodar o `delete` certo.
- **Causa:** a mensagem do editor para um `delete` **não diz quantas linhas** foram afetadas. (E um `0` pode
  indicar que o editor rodou com um **papel restrito** que o RLS filtra.)
- **Como descobrimos:** conferimos com um `select current_user`, depois recontamos as linhas.
- **Lição:** **verifique depois de apagar.** A mensagem de sucesso não prova que o resultado foi o esperado.

### C7. Duas respostas que se contradiziam
- **Sintoma:** o usuário escolheu "mandar as 5 órfãs para a conta de agosto" **e** "a conta final é a de hoje".
- **Causa:** as duas respostas respondiam a perguntas separadas, sem perceber o conflito.
- **O que fizemos:** **não agimos**; apontamos a contradição, explicamos a consequência e perguntamos de novo.
- **Lição:** diante de instruções conflitantes, **pare e esclareça.** Mexer em dados reais com base num palpite é
  assumir um risco desnecessário.

### C8. Operações em dados reais: o ritual que seguimos
Em todas as mudanças de dados:
1. **Leitura primeiro** (contar, listar, conferir).
2. **Número esperado** declarado antes (`DELETE 64`).
3. **Comando reversível quando possível** (guardamos os donos antigos antes do `update`; salvamos o nome
   original em `notes` antes de converter os títulos).
4. **Verificação depois.**

---

# Grupo D: segurança

### D1. O vazamento de `user_id` na API pública
- **Sintoma:** ao consultar como visitante, a resposta trazia `user_id`.
- **Causa:** o RLS filtra **linhas**, não colunas.
- **Correção:** a view `public_magazines`, seguida da remoção da política antiga, **nesta ordem**.
- **Lição:** **mínimo privilégio**; e a **ordem** em mudanças de segurança: primeiro adicione o novo, depois remova o
  velho.

### D2. Confirmação de e-mail desligada num site público
- **Sintoma (previsto):** com o cadastro aberto e sem confirmação, qualquer pessoa criaria contas falsas, e o
  bucket (sem limites) aceitaria arquivos delas.
- **Correção:** cadastro **fechado** e confirmação ligada. O catálogo público não precisa de conta.
- **Lição:** o risco está na **combinação** (cadastro aberto + sem limite no bucket). **Camadas se compensam.**

### D3. Segredos na conversa
- **Situação:** durante a configuração, uma chave precisava ir para o Vercel.
- **O que fizemos:** o assistente **não digitou** a chave: copiou para a área de transferência (sem mostrá-la) e
  o usuário colou.
- **Lição:** o princípio de que **você** entra com credenciais, por mais que seja uma chave pública, é um bom
  hábito. E sempre se pergunta: *"esta chave pode ser pública?"* (a `publishable` sim, a `service_role` jamais).

---

# Grupo E: processo e comunicação

### E1. `git push` e "não há nada para enviar"
- **Sintoma:** o usuário pediu "outro push"; não havia commits novos.
- **Causa:** a edição estava **só na pasta de trabalho**, sem commit. O push só envia commits.
- **Lição:** as três áreas do git (capítulo 11).

### E2. O `<h1></h1>` vazio
- **Sintoma:** um commit publicaria uma página sem título.
- **Como descobrimos:** lendo o **diff** antes do commit (`git diff`).
- **Lição:** **leia o diff antes de commitar.** Uma decisão de design pode ter um efeito colateral (aqui, de
  acessibilidade). Avisar, e deixar a pessoa decidir, é o certo.

### E3. "Vercel não está ligado ao GitHub" (erro do assistente) ⚠️
- **Sintoma:** afirmei que o deploy não era automático e que faltava conectar o repositório.
- **Causa:** a CLI do Vercel **já tinha ligado** o repositório, no momento do `vercel link`. Eu **presumi** sem
  verificar.
- **Como descobrimos:** o usuário mandou uma captura do painel mostrando o repositório conectado há 50 minutos.
- **Lição:** **verifique antes de afirmar.** E quando um fato for provado errado, **corrija abertamente**.

### E4. O ícone de baixa resolução
- **Sintoma:** o ícone da aba saiu serrilhado.
- **Causa:** a imagem de origem tinha só 276×356 px.
- **Correção:** uma imagem de 840×1279 px, com **recorte do fundo** (um xadrez de dois tons de branco, `237` e
  `254`, que deixava um "fantasma" quadriculado quando o limiar era frouxo).
- **Lição:** qualidade de saída depende da qualidade de **entrada**. E em processamento de imagem, **olhe o
  resultado ampliado.**

### E5. O que significa "estar pronto"
Em vários momentos, "compilou" e "os testes passaram" **não** bastavam. O que mais pegou erros foi **usar o
produto de verdade**: abrir o site, clicar, olhar com dados reais, olhar como visitante, testar o teclado.

---

## As 12 lições que mais valem

1. **Leia a mensagem de erro inteira.** Ela quase sempre diz onde olhar.
2. **O terminal está em algum lugar.** Confira a pasta antes de rodar.
3. **"Compilou" não é "funciona".** Verifique o resultado.
4. **Tipos descrevem o que você acredita, não o que os dados são.** Teste com dados reais.
5. **Estimativas não são fatos.** Conte de verdade.
6. **Vazio não é "não existe".** Suspeite do RLS.
7. **Valide no servidor.** O navegador é território hostil.
8. **Leia o `select` antes do `delete`.** E confira o número esperado.
9. **Verifique o estado real antes de cada passo.** "Tudo ok" não substitui olhar.
10. **Ordem importa:** adicione o novo antes de remover o velho.
11. **Leia o diff antes de commitar.**
12. **Quando errar, diga.** Corrija, aprenda e siga em frente.

## Exercício final do capítulo
Escolha **três** casos e, para cada um:
1. Escreva **como você teria detectado** o problema **mais cedo**.
2. Escreva **um teste ou uma verificação automática** que o impediria de voltar. (Ex.: para B2, um teste que
   confirma que toda classe usada no TSX existe no CSS; para C2, uma restrição de chave estrangeira.)
3. Anote, no **seu diário técnico**, a lição em uma frase.

Próximo: [18. Cola rápida e glossário](18-cola-rapida-e-glossario.md).
