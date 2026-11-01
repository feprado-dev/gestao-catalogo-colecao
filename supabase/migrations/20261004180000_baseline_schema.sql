-- BASE: como o banco estava ANTES das outras migrations deste diretório.
-- Foi criada pelo painel do Supabase e só foi versionada depois, lendo o banco real.
-- É idempotente (if not exists): rodar em um banco que já tem as tabelas não muda nada.
-- Serve para recriar o projeto do zero (por exemplo, em um projeto novo de testes).

create table if not exists public.magazines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  issue text,
  year integer,
  month integer,
  condition text,
  notes text,
  cover_model text,
  acquired boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cover_image_url text,
  is_public boolean not null default false,
  constraint magazines_condition_check
    check (condition = any (array['Excelente', 'Bom', 'Regular', 'Ruim']))
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_magazines_updated_at on public.magazines;
create trigger update_magazines_updated_at before update on public.magazines
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

alter table public.magazines enable row level security;
alter table public.profiles enable row level security;

-- Bucket das capas (público para leitura; escrita só na pasta do próprio usuário).
insert into storage.buckets (id, name, public)
values ('magazine-covers', 'magazine-covers', true)
on conflict (id) do nothing;

-- As políticas de RLS desta base foram recriadas na migration 20261101100000.
