-- Aplicada em produção como "harden_rls_privileges_bucket" (20261104223202); só o que sobrou dela está aqui.
-- Se o usuário for apagado, as revistas dele vão junto.
alter table public.magazines
  add constraint magazines_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

-- profiles tem 3 linhas de usuários que já não existem. "not valid" protege as linhas
-- NOVAS sem apagar as antigas (limpar essas 3 linhas é uma decisão à parte).
alter table public.profiles
  add constraint profiles_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade not valid;
