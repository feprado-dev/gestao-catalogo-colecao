-- Endurecimento do banco, a partir dos alertas do Supabase e da revisão do projeto.
--  1. Políticas de RLS com (select auth.uid()): o Postgres calcula uma vez por consulta,
--     e não uma vez por linha. Também passam a valer só para quem está logado.
--  2. Privilégios mínimos: o visitante (anon) só lê a view; ninguém precisa de TRUNCATE etc.
--  3. Limite e tipos permitidos no bucket das capas.
--  4. Chave estrangeira de magazines.user_id e índice para a listagem do dono.

-- 1. Políticas ----------------------------------------------------------------
drop policy if exists "Users can view their own magazines" on public.magazines;
drop policy if exists "Users can create their own magazines" on public.magazines;
drop policy if exists "Users can update their own magazines" on public.magazines;
drop policy if exists "Users can delete their own magazines" on public.magazines;

create policy "Users can view their own magazines" on public.magazines
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own magazines" on public.magazines
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own magazines" on public.magazines
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own magazines" on public.magazines
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can view their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert their own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 2. Privilégios --------------------------------------------------------------
-- O visitante não acessa as tabelas: lê só a view (que roda com os direitos do dono).
revoke all on public.magazines from anon;
revoke all on public.profiles from anon;
revoke all on public.public_magazines from anon, authenticated;
grant select on public.public_magazines to anon, authenticated;

-- Quem está logado mexe nas linhas (a RLS limita às próprias), mas não precisa destes:
revoke truncate, references, trigger on public.magazines from authenticated;
revoke truncate, references, trigger on public.profiles from authenticated;

-- Sobre o alerta "Security Definer View" do Supabase: é INTENCIONAL.
-- A view precisa rodar com os direitos do dono para o visitante ler as revistas públicas
-- sem ter acesso à tabela (que tem user_id e notes). Trocar para security_invoker exigiria
-- dar ao visitante leitura direta da tabela, o que é pior.

-- 3. Bucket das capas ---------------------------------------------------------
update storage.buckets
set file_size_limit = 5242880, -- 5 MB, o mesmo limite do formulário
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif']
where id = 'magazine-covers';

-- 4. Integridade --------------------------------------------------------------
-- Se o usuário for apagado, as revistas dele vão junto.
alter table public.magazines
  add constraint magazines_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

-- profiles tem 3 linhas de usuários que já não existem. "not valid" protege as linhas
-- NOVAS sem apagar as antigas (limpar essas 3 linhas é uma decisão à parte).
alter table public.profiles
  add constraint profiles_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade not valid;

create index if not exists magazines_user_id_created_at_idx
  on public.magazines (user_id, created_at desc);
