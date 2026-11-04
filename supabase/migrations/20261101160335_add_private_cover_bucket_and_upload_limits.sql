-- Bucket público: teto de 5 MB e whitelist rasterizada (SVG fora = sem XSS armazenado)
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif']
 where id = 'magazine-covers';

-- Bucket privado para capas de revistas não públicas (servido via signed URL)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('magazine-covers-private', 'magazine-covers-private', false, 5242880,
        array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update
   set public = excluded.public,
       file_size_limit = excluded.file_size_limit,
       allowed_mime_types = excluded.allowed_mime_types;

-- Policies do bucket privado: leitura e escrita apenas na pasta <uid>/
create policy "Dono le suas capas privadas"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'magazine-covers-private'
         and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "Dono envia suas capas privadas"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'magazine-covers-private'
              and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "Dono atualiza suas capas privadas"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'magazine-covers-private'
         and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "Dono apaga suas capas privadas"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'magazine-covers-private'
         and (select auth.uid())::text = (storage.foldername(name))[1]);
