-- Remove as políticas duplicadas recriadas por engano (as oficiais são as "Dono ...").
drop policy if exists "Users can view their own magazines" on public.magazines;
drop policy if exists "Users can create their own magazines" on public.magazines;
drop policy if exists "Users can update their own magazines" on public.magazines;
drop policy if exists "Users can delete their own magazines" on public.magazines;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

-- Volta a lista de tipos do bucket público ao que foi decidido antes (sem GIF).
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
where id = 'magazine-covers';

-- Índice redundante com magazines_user_id_idx.
drop index if exists public.magazines_user_id_created_at_idx;
