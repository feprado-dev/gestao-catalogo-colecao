# 08. Banco de dados e Supabase

## Objetivo
Entender onde e como os dados do app vivem: tabelas, SQL, segurança por linha (RLS), views, armazenamento de
arquivos, autenticação e migrations. Ao final, você deve conseguir ler as regras de segurança do projeto e dizer,
para qualquer pessoa (visitante, dono, outro usuário), **o que ela pode ver e fazer**.

> ⚠️ **Antes de praticar SQL:** crie um **projeto Supabase separado, só para estudo**. O banco do Vault Keeper tem
> dados reais. Comandos como `delete` e `update` não têm "desfazer". Nunca experimente em dados que você não quer
> perder.

---

## 1. O que é um banco relacional

Um banco **relacional** guarda dados em **tabelas**, como planilhas muito disciplinadas:

| id (chave primária) | title | issue | year | month | is_public |
|---|---|---|---|---|---|
| `a1b2...` | Joana Prado Feiticeira | 293 | 1999 | 12 | true |
| `c3d4...` | Marina Lima | 292 | 1999 | 11 | true |

- **Tabela:** um tipo de coisa (`magazines`).
- **Linha (*row*):** uma coisa (uma revista).
- **Coluna:** uma característica (`title`, `year`), com **tipo fixo** e regras.
- **Chave primária (*primary key*):** a coluna que identifica a linha de forma **única** (`id`).

**Postgres** é o programa de banco que o Supabase usa. **SQL** é a linguagem para conversar com ele.

---

## 2. A tabela `magazines`

Reconstruída a partir do que existe no banco (para estudo):

```sql
create table public.magazines (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  title           text not null,
  issue           text,
  year            integer,
  month           integer,
  condition       text check (condition in ('Excelente', 'Bom', 'Regular', 'Ruim')),
  notes           text,
  cover_model     text,
  acquired        boolean default false,
  cover_image_url text,
  is_public       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```

Leia coluna por coluna:

| Trecho | Significa |
|---|---|
| `uuid` | Identificador único e longo (`a1b2c3d4-...`), impossível de adivinhar |
| `default gen_random_uuid()` | Se você não informar o `id`, o banco gera um |
| `not null` | **Obrigatória**: o banco recusa a linha se faltar |
| `text`, `integer`, `boolean` | Tipos: texto, inteiro, verdadeiro/falso |
| `check (condition in (...))` | **Regra de validação no banco**: só esses 4 valores |
| `timestamptz` | Data e hora **com fuso horário** |
| `default now()` | Preenche com o momento da criação |

### Duas observações sobre o desenho (vale refletir)

1. **`year` e `month` aceitam `null`.** Foi uma decisão consciente: o acervo importado não tinha datas. Um campo
   obrigatório forçaria a inventar um valor. É por isso que o tipo TypeScript tem `year: number | null`.
2. **`user_id` não tem chave estrangeira**, um desenho que custou caro (capítulo 17).
   O correto seria `user_id uuid not null references auth.users(id) on delete cascade`. Assim, **apagar um usuário
   apagaria também suas revistas**, em vez de deixá-las órfãs, invisíveis e inalcançáveis. Foi exatamente o que
   aconteceu: 69 revistas ficaram sem dono depois que a conta foi apagada.

### Camada de segurança: `enable row level security`
```sql
alter table public.magazines enable row level security;
```
Veja a seção 5.

---

## 3. SQL essencial: as quatro operações (CRUD)

| Operação | SQL | Equivalente no `supabase-js` |
|---|---|---|
| **C**reate | `insert into ... values (...)` | `.insert({...})` |
| **R**ead | `select ... from ... where ...` | `.select().eq(...)` |
| **U**pdate | `update ... set ... where ...` | `.update({...}).eq(...)` |
| **D**elete | `delete from ... where ...` | `.delete().eq(...)` |

### Ler (`select`)
```sql
select title, year from public.magazines;                       -- só duas colunas
select * from public.magazines where is_public = true;          -- só as públicas
select * from public.magazines order by created_at desc;        -- mais novas primeiro
select count(*) from public.magazines;                          -- quantas linhas
select count(*) filter (where is_public) from public.magazines; -- contar só as públicas
```

### Inserir
```sql
insert into public.magazines (user_id, title, year)
values ('11111111-...', 'Marina Lima', 1999);
```

### Atualizar e apagar
```sql
update public.magazines set is_public = true where id = '...';
delete from public.magazines where id = '...';
```

### ⚠️⚠️ A regra de ouro do `update` e do `delete`: **sempre `where`**
```sql
delete from public.magazines;          -- apaga TODAS as linhas da tabela
```
Sem `where`, o comando vale para **todas** as linhas. Hábito de profissional: **escreva primeiro o `select` com o
mesmo `where`**, confira quantas linhas aparecem, e só então troque por `delete`/`update`.

```sql
-- 1) confira
select count(*) from public.magazines where user_id = 'X';
-- 2) só se o número for o esperado:
delete from public.magazines where user_id = 'X';
```

Foi o que fizemos para remover as 64 duplicatas: contamos primeiro (64 pares), depois apagamos.

### Um exemplo avançado do projeto: remover duplicatas
```sql
delete from public.magazines m
using public.magazines v                       -- compara a tabela com ELA MESMA (apelido v)
where m.user_id = 'DONO_ANTIGO'
  and v.user_id = 'DONO_ATUAL'
  and lower(trim(m.title)) = lower(trim(v.title))
  and m.issue is not distinct from v.issue     -- igualdade que trata NULL como valor comparável
  and m.year  is not distinct from v.year
  and m.month is not distinct from v.month;
```
Dois conceitos novos:
- **`using`**: junta a tabela com outra (ou com ela mesma) para decidir quais linhas apagar.
- **`is not distinct from`**: em SQL, `null = null` **não é verdadeiro** (é "desconhecido"). Esse operador
  considera dois `null` iguais, essencial quando há colunas opcionais.

### `NULL` é um conceito à parte
`null` significa "**não sei**", e não "zero" nem "vazio". Por isso `where year = null` nunca acha nada: use
`where year is null`.

---

## 4. Autenticação: quem é você?

O **Supabase Auth** cuida de cadastro, login e sessão.

### O fluxo do login
```
1. Usuário digita e-mail e senha  →  supabase.auth.signInWithPassword(...)
2. O Supabase confere e devolve um TOKEN (JWT) assinado
3. O navegador guarda o token (localStorage)
4. Em cada pedido ao banco, o supabase-js envia o token junto
5. O banco lê o token e sabe: "este pedido vem do usuário X"
```
O **JWT** é um texto assinado que diz "este é o usuário X" e **não pode ser falsificado** sem a chave secreta do
servidor. Dentro do Postgres, a função `auth.uid()` devolve o `id` desse usuário.

### Duas chaves diferentes (a confusão mais perigosa para iniciantes)

| Chave | Pode ficar no navegador? | O que permite |
|---|---|---|
| **anon / publishable** (`sb_publishable_...`) | ✅ **Sim**, é pública por desenho | Só o que o RLS autorizar |
| **service_role** | ❌ **Nunca** | **Ignora o RLS**: acesso total ao banco |

A chave pública *não é perigosa* porque, sozinha, **só abre as portas que o RLS deixou abertas**. A `service_role`
abre tudo, então só pode viver em servidores seus, jamais num app que roda no navegador.

### Configurações de autenticação que você ajustou no painel
- **Allow new users to sign up** desligado → ninguém novo consegue criar conta.
- **Confirm email** ligado → quem se cadastrasse precisaria provar o e-mail.
- **Redirect URLs / Site URL** → os endereços para onde o Supabase pode mandar o usuário depois de confirmar um
  e-mail. É uma **lista de permitidos**: evita o ataque de *open redirect* (um link que levaria a vítima para um
  site falso após o login).

---

## 5. RLS: Row Level Security ⭐ (a ideia mais importante do capítulo)

### O problema
O código do frontend roda no navegador do visitante, que pode abrir o console e escrever:
```js
await supabase.from('magazines').delete()   // tenta apagar TUDO
```
Se o banco obedecesse, qualquer pessoa destruiria seus dados. Proteger só no frontend ("esconder o botão") não
adianta: o atacante **não usa** o seu frontend.

### A solução
Com o **RLS ligado**, o próprio banco **filtra as linhas** antes de responder, conforme **políticas** (*policies*)
que você escreve. Sem política que permita, **nada** passa.

### As políticas da tabela `magazines`

```sql
-- O dono pode LER as próprias revistas
create policy "Users can view their own magazines" on public.magazines
  for select using (auth.uid() = user_id);

-- O dono pode CRIAR revistas, mas só com o próprio user_id
create policy "Users can create their own magazines" on public.magazines
  for insert with check (auth.uid() = user_id);

-- O dono pode ATUALIZAR e APAGAR as próprias
create policy "Users can update their own magazines" on public.magazines
  for update using (auth.uid() = user_id);

create policy "Users can delete their own magazines" on public.magazines
  for delete using (auth.uid() = user_id);
```

| Trecho | Significa |
|---|---|
| `for select` / `insert` / `update` / `delete` | A qual operação a regra se aplica |
| `using (condição)` | Quais linhas **já existentes** a operação pode enxergar/alterar |
| `with check (condição)` | O que uma linha **nova ou alterada** precisa satisfazer |
| `auth.uid() = user_id` | "o usuário do pedido é o dono da linha" |

**Tradução:** *cada usuário só enxerga e mexe nas linhas em que `user_id` é o seu.*

### O `with check` no INSERT: por que importa
Sem ele, um usuário poderia inserir uma revista com o `user_id` **de outra pessoa**. O `with check` exige que o
`user_id` que você manda seja o **seu**.

### O comportamento silencioso do RLS ⚠️
O RLS **não** responde "acesso negado" para leituras. Ele simplesmente **não devolve** as linhas proibidas.
Um visitante sem login que consulta a tabela recebe `[]` (lista vazia), como se as revistas não existissem.
O capítulo 17 conta o caso real.

> **Se uma consulta volta vazia e você tem certeza de que há dados, a primeira suspeita é o RLS**, antes de achar
> que é bug no código.

### Quem é "visitante" para o banco?
O Supabase distingue **papéis** (*roles*):

| Papel | Quem é |
|---|---|
| `anon` | Visitante **sem login** (só a chave pública) |
| `authenticated` | Usuário **logado** |
| `postgres` / `service_role` | Administração; **ignora o RLS** |

⚠️ **Detalhe do SQL Editor:** o editor do painel pode rodar como `postgres` (enxerga tudo) ou simulando um
usuário. Se um `delete` devolve `DELETE 0` mesmo havendo linhas, confira o papel selecionado ao lado do botão
**Run**. Confirme com `select current_user;`.

---

## 6. Views: mostrar só algumas colunas

### O problema que levou à view
A política antiga deixava **qualquer visitante** ler as revistas públicas, mas lia a **linha inteira**, incluindo
`user_id` (identificador da sua conta) e `notes` (anotações privadas). O RLS filtra **linhas**, não **colunas**.

### A solução: uma view
Uma **view** é uma consulta salva, que se comporta como uma tabela.

📁 `supabase/migrations/20261004190000_create_public_magazines_view.sql`:
```sql
create or replace view public.public_magazines as
select id, title, issue, year, month, condition, cover_model, cover_image_url, acquired, is_public, created_at
from public.magazines
where is_public = true;

grant select on public.public_magazines to anon, authenticated;
```

- Escolhemos **só as colunas seguras** (sem `user_id`, sem `notes`).
- O `where is_public = true` embutido garante que só as públicas aparecem.
- `grant select ... to anon` dá permissão de leitura ao visitante.

Em seguida, removemos a política que dava acesso direto à tabela:
```sql
drop policy if exists "Public magazines are viewable by everyone" on public.magazines;
```
Resultado: o visitante lê **só pela view**. Verificamos: a tabela direta devolve `[]`, a view devolve as 64.

### A ordem das mudanças importa
1. Criar a view (**acrescenta**, não quebra nada);
2. Atualizar o código para ler da view e publicar;
3. **Só então** remover a política antiga.

Se a ordem fosse invertida, o site publicado ficaria sem dados durante o intervalo. **Mudanças de segurança e de
estrutura seguem "primeiro adicione o novo, depois remova o velho".**

### O aviso do painel de segurança
O Supabase marca views como **"Security Definer View"** (erro): ela roda com os direitos do **dono** da view e, por
isso, ignora o RLS da tabela de baixo. Aqui isso é **intencional** (a view precisa ler linhas que o RLS esconderia
do visitante, mas só entrega as colunas seguras). Mas é bom saber que o aviso existe e entender o porquê.

---

## 7. Storage: onde as imagens ficam

Imagens **não** vão para o banco. Bancos são ruins para arquivos grandes. O Supabase Storage guarda os arquivos e
o banco guarda **só o endereço** (`cover_image_url`).

### Conceitos
- **Bucket:** uma "pasta raiz" de arquivos (`magazine-covers`). Pode ser pública ou privada.
- **Objeto:** um arquivo dentro dele, com um caminho (`<user_id>/<uuid>.jpg`).

### O caminho dos arquivos importa
```ts
const path = `${userId}/${crypto.randomUUID()}.${ext}`
```
A **pasta é o `user_id`** do dono, e o nome do arquivo é um **UUID aleatório**. Dois motivos:
1. **Segurança:** as regras do Storage verificam a pasta.
2. **Nunca sobrescrever:** nomes únicos impedem que um upload apague a capa de outra revista.

### As políticas do Storage (também são RLS)
```sql
-- Qualquer um pode VER arquivos do bucket (o catálogo público precisa)
create policy "Anyone can view magazine cover files" on storage.objects
  for select to anon, authenticated using (bucket_id = 'magazine-covers');

-- Só pode ENVIAR/ALTERAR/APAGAR dentro da PRÓPRIA pasta
create policy "Users can upload their own magazine covers" on storage.objects
  for insert with check (bucket_id = 'magazine-covers' and auth.uid()::text = (storage.foldername(name))[1]);
```
`(storage.foldername(name))[1]` extrai a **primeira pasta** do caminho, e a regra exige que seja o `user_id` de
quem está enviando.

### A estrutura da URL pública
```
https://<projeto>.supabase.co/storage/v1/object/public/magazine-covers/<user_id>/<uuid>.jpg
```
Para **apagar**, precisamos só do trecho depois de `/magazine-covers/`. Por isso `magazineService.ts` tem
`pathFromUrl`, que corta a URL.

### Um ponto fraco conhecido (com a correção)
O bucket **não limita tipo nem tamanho** de arquivo. Qualquer usuário logado poderia subir um arquivo enorme ou de
tipo estranho **na própria pasta**. A validação do formulário é só conforto, não segurança. A trava de verdade é no
servidor:

```sql
update storage.buckets
set file_size_limit = 5242880,                                               -- 5 MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
where id = 'magazine-covers';
```
Como o cadastro está fechado, o risco hoje é baixo, mas **este é o tipo de defesa em camadas que um sistema
profissional tem**. Tente aplicar no seu projeto de estudo.

### Armazenamento órfão
Apagar a **linha** da tabela **não** apaga o arquivo no Storage. São duas coisas separadas, e o código precisa
cuidar das duas (`deleteMagazine` apaga a linha e depois a imagem). Quando o dono de 69 revistas foi apagado, as
imagens delas também sumiram: as linhas continuaram, apontando para arquivos que já não existiam (capas
quebradas).

---

## 8. Migrations: o histórico do banco

Uma **migration** é um arquivo SQL que descreve **uma mudança** do banco. O conjunto, em ordem, conta como o
banco chegou ao estado atual, como o git faz com o código.

📁 `supabase/migrations/`:
```
20261004190000_create_public_magazines_view.sql
20261004191000_remove_anon_read_on_magazines_table.sql
```
- **O prefixo é data e hora** (`2026-10-04 19:00:00`), que define a **ordem**.
- **Uma mudança por arquivo**, com nome que descreve.
- **Inclua como reverter** (em comentário), como na segunda migration.

### Por que importa
Sem migrations, o banco existe só "na cabeça do painel": ninguém consegue **recriá-lo** em outro lugar ou saber
**quem mudou o quê**. O repositório original que analisamos no começo tinha exatamente esse defeito: a coluna
`is_public` existia no banco, mas **em nenhuma migration**.

⚠️ **Lacuna do nosso projeto:** as migrations de `supabase/migrations/` só cobrem a view e a remoção da política.
A **tabela e as políticas básicas** (as dos blocos acima) foram criadas direto no painel e **não estão
versionadas**. Escrever essa migration "de base" é um dos desafios do capítulo 16.

---

## 9. Painel do Supabase: onde olhar cada coisa

| Quero... | Vou em... |
|---|---|
| Ver/editar linhas manualmente | **Table Editor** |
| Rodar SQL | **SQL Editor** |
| Ver usuários, ajustar login, e-mails | **Authentication** |
| Ver arquivos | **Storage** |
| Ver erros de segurança/performance | **Advisors** |
| Ver registros do que aconteceu | **Logs** |
| Pegar a URL e a chave pública | **Project Settings → API** |

---

## Erros comuns
| Sintoma | Causa | Solução |
|---|---|---|
| Consulta volta `[]` mas há dados | RLS escondendo, ou papel errado | Confira políticas e `current_user` |
| `new row violates row-level security policy` | `with check` falhou (ex.: `user_id` diferente do seu) | Envie o `user_id` do usuário logado |
| `delete`/`update` mexeu em linhas demais | Esqueceu o `where` | Sempre rode o `select` antes |
| `where coluna = null` não acha nada | `null` não é igual a nada | `is null` / `is not distinct from` |
| Capa quebrada depois de apagar | Apagou a linha mas não o arquivo (ou o contrário) | Cuide das duas operações |
| Estimativa de linhas errada no painel | Contagem aproximada, desatualizada | Use `select count(*)` |

## Exercícios (em um projeto Supabase **de estudo**)
1. Crie uma tabela `wishlist` (`id`, `user_id`, `title`, `created_at`) com RLS e as quatro políticas do dono.
2. Insira 3 linhas e confira, em um `select`, que outro usuário **não** as enxerga.
3. Crie uma view `wishlist_public` sem a coluna `user_id`.
4. Escreva um `select` que mostre quantas revistas existem **por ano** (`group by year`).
5. Tente (num bucket de teste) enviar um arquivo para a pasta de **outro** usuário. Leia o erro.
6. **Desafio:** escreva a migration "de base" do projeto: tabela, RLS ligado, quatro políticas e as políticas do
   Storage. Teste recriando o banco do zero num projeto vazio.

✅ **Checklist do capítulo 08**
- [ ] Explico tabela, linha, coluna e chave primária.
- [ ] Escrevo `select`, `insert`, `update` e `delete` e **nunca** esqueço o `where`.
- [ ] Explico `NULL` e `is not distinct from`.
- [ ] Explico a diferença entre a chave pública e a `service_role`.
- [ ] Leio uma política RLS (`using` × `with check`) e traduzo para português.
- [ ] Explico por que a view `public_magazines` existe e por que a ordem das mudanças importou.
- [ ] Explico por que a pasta no Storage é o `user_id`.
- [ ] Explico o que é uma migration e a lacuna do projeto.

Próximo: [09. Ligando o app ao banco](09-ligando-app-e-banco.md).
