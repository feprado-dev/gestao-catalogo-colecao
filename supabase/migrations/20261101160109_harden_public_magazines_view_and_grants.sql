-- 1. Elimina a superfície de escrita anônima via view auto-updatable
revoke all on public.public_magazines from anon, authenticated;

-- 2. View passa a executar com as permissões de quem consulta (RLS do caller)
alter view public.public_magazines set (security_invoker = on);

-- 3. Defesa em profundidade: dono da tabela também sujeito a RLS
alter table public.magazines force row level security;
alter table public.profiles force row level security;

-- 4. Com security_invoker ligado, o catálogo público precisa de policy própria
drop policy if exists "Catalogo publico visivel para todos" on public.magazines;
create policy "Catalogo publico visivel para todos"
  on public.magazines for select
  to anon, authenticated
  using (is_public = true);

-- 5. Grants mínimos: anon nunca enxerga user_id, notes ou updated_at
revoke all on public.magazines from anon;
revoke all on public.profiles from anon;
grant select (id, title, issue, year, month, condition,
              cover_model, cover_image_url, acquired,
              is_public, created_at)
  on public.magazines to anon;
grant select on public.public_magazines to anon, authenticated;

-- 6. Remove privilégios perigosos que vieram do grant default
revoke truncate, references, trigger on public.magazines from authenticated;
revoke truncate, references, trigger on public.profiles from authenticated;
