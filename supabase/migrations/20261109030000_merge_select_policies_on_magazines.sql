-- Une as duas políticas de leitura do usuário logado numa só
-- (alerta de desempenho "multiple_permissive_policies" do Supabase).
-- As regras de acesso não mudam:
--   visitante (anon): só revistas públicas
--   usuário logado: revistas públicas + as próprias
drop policy if exists "Catalogo publico visivel para todos" on public.magazines;
drop policy if exists "Dono le suas revistas" on public.magazines;

create policy "Visitante le o catalogo publico"
  on public.magazines for select to anon
  using (is_public = true);

create policy "Usuario le o catalogo publico e as proprias revistas"
  on public.magazines for select to authenticated
  using (is_public = true or (select auth.uid()) = user_id);
