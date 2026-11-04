-- A view public_magazines é security_invoker: o visitante precisa de SELECT nas colunas que ela expõe
-- (e só nelas: user_id e notes continuam fora do alcance do visitante).
-- Esta migration corrigiu um "revoke all" da migration anterior, que tirou o acesso e deixou o catálogo público fora do ar.
grant select (id, title, issue, year, month, condition, cover_model, cover_image_url, acquired, is_public, created_at)
  on public.magazines to anon;
