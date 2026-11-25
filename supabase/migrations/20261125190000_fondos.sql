-- Catálogo público de fondos de videollamada y sus contadores.
-- Lectura anónima por RLS; la única escritura posible desde la API pública es registrar_evento().

create table public.fondos (
  id text primary key,                 -- "<número de archivo>-<id de escena>", p. ej. "2b3-arcos-azules"
  codigo text not null,                -- código visible, p. ej. "2B-3"
  nombre text not null,
  familia text not null,
  orden integer not null,              -- posición en la galería
  me_gusta integer not null default 0 check (me_gusta >= 0),
  descargas integer not null default 0 check (descargas >= 0)
);

alter table public.fondos enable row level security;

create policy fondos_lectura_publica on public.fondos
  for select to anon, authenticated using (true);

grant select on public.fondos to anon, authenticated;

/**
 * Suma o resta un evento en los contadores de un fondo.
 *
 * @param p_fondo id del fondo (fondos.id)
 * @param p_tipo  'me_gusta' | 'quitar_me_gusta' | 'descarga'
 * @returns una fila con los contadores ya actualizados
 * @throws 22023 si el tipo no es válido; P0002 si el fondo no existe
 */
create function public.registrar_evento(p_fondo text, p_tipo text)
returns table (total_me_gusta integer, total_descargas integer)
language plpgsql
security definer            -- la tabla no tiene política de escritura: esta función es la única vía
set search_path = ''
as $$
begin
  if p_tipo not in ('me_gusta', 'quitar_me_gusta', 'descarga') then
    raise exception 'tipo de evento no válido: %', p_tipo using errcode = '22023';
  end if;

  return query
    update public.fondos f set
      me_gusta = case p_tipo
        when 'me_gusta' then f.me_gusta + 1
        when 'quitar_me_gusta' then greatest(f.me_gusta - 1, 0)
        else f.me_gusta end,
      descargas = case p_tipo when 'descarga' then f.descargas + 1 else f.descargas end
    where f.id = p_fondo
    returning f.me_gusta, f.descargas;

  if not found then
    raise exception 'fondo desconocido: %', p_fondo using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.registrar_evento(text, text) from public;
grant execute on function public.registrar_evento(text, text) to anon, authenticated;
