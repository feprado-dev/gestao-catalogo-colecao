# 13. Segurança de um app web

## Objetivo
Aprender a **pensar como quem ataca** para proteger melhor. Você vai entender o que, neste projeto, protege os dados
(e o que parece proteger, mas não protege), reconhecer os riscos que ainda existem e sair com um checklist para
qualquer app futuro.

> Segurança não é um recurso que se "liga" no fim. É um modo de pensar que acompanha **cada** decisão.

---

## 1. A premissa fundamental: o navegador é território hostil

Tudo que roda no navegador do visitante está **nas mãos dele**. Ele pode:
- ler **todo** o seu JavaScript (inclusive as variáveis `VITE_`);
- abrir o console e **chamar suas funções** com argumentos que você nunca previu;
- **ignorar** o seu frontend e conversar direto com a API do banco, com ferramentas como `curl`;
- **alterar** o código em memória (esconder a validação, mostrar botões "escondidos").

Daí a regra que atravessa o projeto:

> **Validação no frontend é conforto para o usuário honesto. Segurança só existe onde o atacante não alcança:
> no servidor.**

| Parece segurança, mas não é | A segurança real |
|---|---|
| Esconder o botão "Deletar" de quem não é dono | Política RLS de `delete` no banco |
| Validar tamanho e tipo da imagem no formulário | Limites do bucket no servidor |
| Redirecionar para o login quem não tem sessão | RLS recusando leituras sem token |
| O `AgeGate` de 18+ | **Nada**: é um aviso, não uma verificação |
| Colocar a chave "escondida" num arquivo | Só chaves **públicas por desenho** no frontend |

---

## 2. Camadas de defesa (*defense in depth*)

Nunca dependa de **uma** proteção. O projeto empilha várias:

```
Visitante ──► [ Frontend: conforto + validação ]
          ──► [ Auth: quem é você? (JWT) ]
          ──► [ RLS: o que ESTA linha permite a VOCÊ? ]
          ──► [ View: quais COLUNAS saem? ]
          ──► [ Storage policies: qual PASTA é sua? ]
          ──► [ Configurações: cadastro fechado, e-mail confirmado ]
```
Se uma camada falhar, outra ainda protege. Exemplo: o `.eq('user_id', userId)` no `listMyMagazines` é uma
proteção a mais **por cima** do RLS.

---

## 3. Segredos e chaves

### As duas chaves do Supabase (relembrando)
| Chave | No navegador? | Poder |
|---|---|---|
| `sb_publishable_...` (anon) | ✅ Sim | Só o que o RLS autoriza |
| `service_role` | ❌ **Jamais** | **Ignora o RLS**: acesso total |

### Regras para segredos
1. **Nunca** commite um segredo. O histórico do git é **permanente**: apagar o arquivo depois não remove o
   segredo dos commits antigos. Se vazou, **troque a chave** imediatamente.
2. Segredos vivem em **variáveis de ambiente**, fora do código (`.env.local`, painel da hospedagem).
3. **Prefixo `VITE_` = público.** Tudo que começa com `VITE_` vai para o navegador de todos.
4. O arquivo `.gitignore` do projeto tem `*.local` e `.env*` para impedir acidentes.
5. Em conversas, tickets e prints: **não cole** chaves secretas nem senhas. O que é público por desenho
   (a chave `publishable`) tem menos risco, mas é um bom hábito tratar tudo com cuidado.

### Como verificar se vazou um segredo no histórico
```bash
git log -p --all | grep -iE "service_role|password *=|secret"
```
Foi o que rodamos antes do primeiro `push`: o resultado vazio mostrou o histórico limpo.

---

## 4. RLS: a camada que de fato protege os dados

Resumo do capítulo 08, agora sob a ótica de ataque:

| Atacante tenta... | O que acontece |
|---|---|
| Ler revistas **privadas** de outra pessoa | O RLS filtra: recebe `[]` |
| Apagar revistas **de outra pessoa** | O RLS filtra: `0` linhas afetadas |
| Inserir uma revista com o `user_id` de **outro** usuário | `with check` falha: erro |
| Enviar um arquivo para a **pasta de outro** usuário | A política do Storage recusa |
| Ler a tabela direto (sem login) | Sem política para `anon`: `[]` |

### O que o RLS **não** faz
- **Não filtra colunas** (só linhas). Para isso usamos a **view**.
- **Não valida o conteúdo** (um dono pode gravar texto estranho nas próprias linhas). Para isso há `check` e
  restrições no esquema.
- **Não impede abuso de cota** (alguém com conta pode subir muitos arquivos).

### Teste que você mesmo pode fazer
No console do navegador, **sem login**:
```js
await fetch('SUA_URL/rest/v1/magazines?select=*', { headers: { apikey: 'SUA_CHAVE_PUBLICA' } }).then(r => r.json())
```
Se o RLS estiver certo, o resultado é `[]` (era o exercício que fizemos). Se vierem dados privados, **há uma falha
de segurança grave**. **Teste seu RLS como atacante, não só como usuário.**

---

## 5. O caso da view: vazamento de colunas

A política antiga deixava qualquer visitante ler as revistas públicas, mas a API devolvia a **linha inteira**,
incluindo `user_id` e `notes`. O `user_id` é o identificador interno da sua conta: não é um segredo crítico, mas
é **informação que o público não precisa ter**.

O princípio por trás: **mínimo privilégio.** Cada papel deve ver **o mínimo necessário**. Corrigimos com a view
`public_magazines` e removemos o acesso direto à tabela.

Perguntas que valem fazer em qualquer endpoint público: *"quais campos saem aqui? precisamos de todos?"*

---

## 6. Autenticação e contas

### O que configuramos
| Ajuste | Para quê |
|---|---|
| Cadastro **fechado** (*Allow new users to sign up* desligado) | Ninguém além do dono cria conta; some uma enorme superfície de ataque |
| **Confirmação de e-mail** ligada | Quem se cadastrasse precisaria provar o endereço |
| **Redirect URLs** como lista de permitidos | Evita *open redirect* |

### O que ainda é uma lacuna
- **Proteção contra senhas vazadas** está desligada no Supabase (o painel de segurança avisa). Ela rejeita senhas que
  já apareceram em vazamentos conhecidos.
- Não há **autenticação em dois fatores (2FA)** para a conta do dono.
- O token de sessão fica no `localStorage` do navegador (padrão do `supabase-js`). Isso significa que, se algum dia
  houver uma falha de **XSS** (seção 8), o token poderia ser roubado.

### Boas práticas de senha (para você e para qualquer app)
- Longa, única, de um gerenciador de senhas.
- **Nunca** reutilize a senha de outro serviço.
- Ligue o 2FA nas contas importantes (GitHub, Supabase, Vercel): quem controla essas contas controla o seu projeto.

---

## 7. Validação: no cliente **e** no servidor

| Onde | Para quê | Pode ser burlada? |
|---|---|---|
| **Cliente** (formulário, `accept="image/*"`, limite de 5 MB) | Resposta imediata ao usuário honesto | ✅ **Sim, trivialmente** |
| **Servidor** (`check` no banco, limites do bucket, RLS) | Barrar qualquer um | ❌ Não |

A regra: **valide nos dois**. O do cliente é por **usabilidade**; o do servidor é por **segurança**.

### A lacuna conhecida do projeto
O bucket de capas **não tem** limite de tamanho nem de tipo. A validação de 5 MB e `image/*` só existe no
navegador. A trava de servidor (capítulo 08) seria:
```sql
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
where id = 'magazine-covers';
```
Hoje o risco é baixo porque o **cadastro está fechado**: só o dono envia arquivos. Mas é exatamente o tipo de
decisão ("aceito o risco porque a camada de cima o reduz") que deve ser **consciente e anotada**.

### Validação dos dados que vêm de fora (até do navegador!)
`useViewMode` só aceita um valor conhecido do `localStorage`:
```ts
return MODES.find((mode) => mode === saved) ?? 'vertical'
```
**Nunca confie em dados que você não controla**, nem os que estão no próprio navegador, que o usuário pode editar.

---

## 8. XSS: scripts injetados

**XSS** (*cross-site scripting*) é quando um atacante consegue fazer **o navegador de outra pessoa executar um
script dele** dentro do seu site. Ex.: alguém cadastra uma revista chamada `<img src=x onerror=roubaToken()>` e,
se o site inserisse esse texto como HTML, o código rodaria no navegador de quem visse.

### Como o React protege
```tsx
<h2>{magazine.title}</h2>
```
O React **escapa** o texto: `<script>` vira o texto literal `<script>`, mostrado na tela, **sem executar**. Você
está protegido **por padrão**.

### Como você poderia desfazer essa proteção sem querer
```tsx
<div dangerouslySetInnerHTML={{ __html: magazine.title }} />    // ⚠️⚠️ NUNCA com dados de usuário
```
O nome é um aviso. Se precisar, **sanitize** (com uma biblioteca como DOMPurify). Outras armadilhas: construir
`href`/`src` a partir de dados do usuário sem validar (`javascript:...`), e usar `eval`.

---

## 9. *Open redirect* e a lista de permitidos

Se o Supabase aceitasse **qualquer** endereço de retorno após o login, um atacante poderia criar um link tipo
`seu-login?redirect=https://site-falso.com`, e a vítima, depois de logar de verdade, cairia num site falso idêntico
ao seu, que roubaria dados. A **lista de Redirect URLs** (só os seus endereços) impede isso.

---

## 10. Operações destrutivas: o cuidado que evita desastres

Durante o projeto, vários **dados reais** foram alterados. As práticas que seguimos (e que você deve copiar):

1. **Olhe antes de mexer.** Rode um `select` com o mesmo `where` e **conte** as linhas antes do `delete`/`update`.
2. **Confira os números.** O comando prometia `DELETE 64`; o esperado era 64. Se viesse outro número, **parar**.
3. **Verifique depois.** A mensagem "Success. No rows returned" do editor **não** diz quantas linhas foram
   apagadas. Quem diz é uma nova consulta.
4. **Guarde como reverter.** Antes de mudar o dono de 69 revistas, anotamos os donos antigos.
5. **Prefira "adicionar o novo, depois remover o velho"** (a ordem da view).
6. **Backup.** O plano gratuito do Supabase não tem backup que você restaure. Para dados importantes, **exporte**
   (Table Editor → Export → CSV) antes de operações irreversíveis.
7. **Quem apaga é o dono.** Operações irreversíveis em dados reais merecem que **uma pessoa**, e não uma
   automação, aperte o botão, depois de ler o que vai acontecer.

---

## 11. Dependências (a cadeia de fornecimento)

O projeto depende de centenas de pacotes do npm, escritos por estranhos. Riscos e hábitos:

```bash
npm audit            # lista vulnerabilidades conhecidas nas dependências
npm outdated         # o que está desatualizado
```
- Mantenha o `package-lock.json` no git (versões travadas).
- Desconfie de pacotes pouco conhecidos e de nomes parecidos com os famosos (*typosquatting*).
- Atualize com regularidade, e rode os testes depois.

---

## 12. Privacidade e responsabilidade

- **Dados pessoais:** o app guarda o e-mail do dono (no Supabase Auth). Em apps com outros usuários, leis como a
  **LGPD** (Brasil) exigem cuidado com o que se coleta, por quê e por quanto tempo.
- **Conteúdo e marca:** o catálogo mostra capas de uma revista adulta e usa um logotipo registrado de terceiros.
  Isso levanta duas questões que **não são técnicas**, mas que quem publica precisa considerar:
  1. **Público:** o aviso de 18+ é só um aviso. Verificação real de idade exige serviços próprios.
  2. **Marca registrada:** usar o nome e o logotipo de uma empresa pode ser lido como site **oficial**. Um rodapé
     ("acervo pessoal, não oficial") reduz essa confusão, mas **não substitui** orientação jurídica, caso o site
     cresça ou seja comercial.
- **Imagens de terceiros:** capas de revistas têm direitos autorais. Um acervo pessoal é uma coisa; republicar em
  larga escala é outra.

---

## 13. Checklist de segurança do projeto (estado atual)

| Item | Estado |
|---|---|
| RLS ligado nas tabelas | ✅ |
| Políticas por dono (select/insert/update/delete) | ✅ |
| Leitura pública só pela view, sem `user_id` | ✅ |
| Storage: escrita só na própria pasta | ✅ |
| Chave `service_role` fora do frontend | ✅ |
| Segredos fora do git (`.gitignore`) | ✅ |
| Cadastro fechado | ✅ |
| Confirmação de e-mail ligada | ✅ |
| Redirect URLs apenas dos seus endereços | ✅ |
| Limite de tamanho/tipo no bucket (servidor) | ⚠️ **Lacuna** |
| Proteção contra senhas vazadas | ⚠️ **Lacuna** |
| 2FA nas contas (GitHub, Supabase, Vercel) | ⚠️ A conferir |
| Chave estrangeira em `user_id` | ⚠️ **Lacuna** (causou órfãs) |
| Migration "de base" versionada | ⚠️ **Lacuna** |
| Backup regular dos dados | ⚠️ **Lacuna** |
| Atualização do Postgres | ⚠️ Disponível |

> **Nota de transparência:** os itens de **Auth** (cadastro fechado, confirmação de e-mail, Redirect URLs) são
> configurações do painel do Supabase, feitas por você. Elas **não aparecem no código** nem nas migrations, e não
> dá para verificá-las daqui. Revise-as de tempos em tempos no painel (*Authentication*). É a mesma lacuna que
> aparece em "migration de base": **configuração que vive só num painel é configuração que ninguém audita**.

> Um sistema "seguro" não é o que tem zero lacunas, mas o que **conhece as suas lacunas** e decidiu conviver com
> cada uma de forma consciente.

---

## Erros comuns
| Erro | Consequência | Prevenção |
|---|---|---|
| Colocar `service_role` numa variável `VITE_` | Acesso total ao banco para qualquer visitante | Só a chave pública no frontend |
| Confiar só na validação do formulário | Qualquer um burla | Valide também no servidor |
| Esquecer de ligar o RLS | Todos leem e apagam tudo | RLS ligado **antes** de pôr dados |
| `dangerouslySetInnerHTML` com dados de usuário | XSS | Deixe o React escapar |
| Commitar `.env` | Segredo permanente no histórico | `.gitignore` + trocar a chave |
| `delete` sem `where` | Perda total de dados | `select` antes; backup |

## Exercícios
1. **Ataque o seu projeto de estudo.** Em um projeto Supabase de teste, crie uma tabela **sem** RLS, consulte-a
   como `anon` e veja os dados vazarem. Depois ligue o RLS **sem** políticas e veja `[]`.
2. Escreva a política `delete` para uma tabela de `wishlist`. Tente apagar a linha de outro usuário e leia o
   resultado.
3. Rode `npm audit` no projeto. Quantas vulnerabilidades? Pesquise o que uma delas significa.
4. Aplique no projeto de estudo o `update storage.buckets ...` da seção 7 e tente subir um arquivo `.pdf` e um
   de 10 MB.
5. Procure no projeto qualquer uso de `dangerouslySetInnerHTML` ou `eval`. (Não deve haver nenhum.)
6. **Desafio:** escreva um **modelo de ameaças** de uma página: liste quem pode atacar, o que querem e qual camada
   os barra. Compare com a seção 2.

✅ **Checklist do capítulo 13**
- [ ] Explico por que segurança não pode ficar só no frontend.
- [ ] Diferencio a chave publishable da `service_role` e o que o `VITE_` implica.
- [ ] Traduzo o que cada política RLS impede a um atacante.
- [ ] Explico por que a view existe (mínimo privilégio).
- [ ] Diferencio validação do cliente e do servidor, e dou o exemplo do bucket.
- [ ] Explico XSS e por que o React protege por padrão.
- [ ] Sigo o ritual de operações destrutivas (`select` antes, conferir, verificar depois).
- [ ] Reconheço as lacunas do projeto e proponho como fechá-las.

Próximo: [14. Acessibilidade e qualidade](14-acessibilidade-e-qualidade.md).
