-- RLS filtra por user_id em toda leitura autenticada: sem índice vira seq scan por request
create index if not exists magazines_user_id_idx
  on public.magazines (user_id);

-- Catálogo público ordenado por edição: índice parcial só das linhas visíveis ao anon
create index if not exists magazines_public_issue_idx
  on public.magazines (year desc nulls last, month desc nulls last)
  where is_public;

-- Lookup de perfil por usuário (1:1, impede duplicata em race de signup)
create unique index if not exists profiles_user_id_key
  on public.profiles (user_id);
