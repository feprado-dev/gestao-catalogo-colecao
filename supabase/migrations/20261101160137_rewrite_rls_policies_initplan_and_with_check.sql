-- magazines: TO authenticated + (select auth.uid()) avaliado uma vez como InitPlan
drop policy if exists "Users can view their own magazines" on public.magazines;
drop policy if exists "Users can create their own magazines" on public.magazines;
drop policy if exists "Users can update their own magazines" on public.magazines;
drop policy if exists "Users can delete their own magazines" on public.magazines;

create policy "Dono le suas revistas"
  on public.magazines for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Dono cria suas revistas"
  on public.magazines for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Dono atualiza suas revistas"
  on public.magazines for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Dono apaga suas revistas"
  on public.magazines for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- profiles
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Dono le seu perfil"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Dono cria seu perfil"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Dono atualiza seu perfil"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
