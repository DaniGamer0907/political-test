-- Supabase/Postgres schema for the political compass test.
-- Run this in the Supabase SQL editor.
-- Never expose the service_role key in frontend code or GitHub.

create extension if not exists "pgcrypto";

create table if not exists public.participantes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nombre text not null,
  edad integer check (edad is null or edad >= 0),
  fecha timestamptz not null default now()
);

-- Migration helper for projects where participantes was created before user_id existed.
alter table public.participantes
add column if not exists user_id uuid default auth.uid() references auth.users(id) on delete cascade;

alter table public.participantes
alter column user_id set not null;

create table if not exists public.preguntas (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  eje_x numeric not null,
  eje_y numeric not null
);

create table if not exists public.respuestas (
  id uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes(id) on delete cascade,
  pregunta_id uuid not null references public.preguntas(id) on delete cascade,
  valor integer not null check (valor between -2 and 2),
  unique (participante_id, pregunta_id)
);

create table if not exists public.resultados (
  id uuid primary key default gen_random_uuid(),
  participante_id uuid not null unique references public.participantes(id) on delete cascade,
  x numeric not null,
  y numeric not null,
  categoria text not null
);

create index if not exists respuestas_participante_id_idx on public.respuestas(participante_id);
create index if not exists respuestas_pregunta_id_idx on public.respuestas(pregunta_id);
create index if not exists resultados_participante_id_idx on public.resultados(participante_id);
create index if not exists participantes_user_id_idx on public.participantes(user_id);

alter table public.participantes enable row level security;
alter table public.preguntas enable row level security;
alter table public.respuestas enable row level security;
alter table public.resultados enable row level security;

create policy "lectura publica preguntas"
on public.preguntas for select
using (true);

create policy "lectura publica resultados"
on public.resultados for select
using (true);

-- Participantes contiene nombre y edad. Por privacidad, solo el usuario dueño lee su registro.
-- Si realmente queres lectura publica de participantes, cambia esta policy por `using (true)`.
create policy "leer participante propio"
on public.participantes for select
using (user_id = auth.uid());

create policy "crear participante propio"
on public.participantes for insert
with check (user_id = auth.uid());

create policy "actualizar participante propio"
on public.participantes for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "leer respuestas propias"
on public.respuestas for select
using (
  exists (
    select 1
    from public.participantes
    where participantes.id = respuestas.participante_id
      and participantes.user_id = auth.uid()
  )
);

create policy "crear respuestas propias"
on public.respuestas for insert
with check (
  exists (
    select 1
    from public.participantes
    where participantes.id = respuestas.participante_id
      and participantes.user_id = auth.uid()
  )
);

create policy "actualizar respuestas propias"
on public.respuestas for update
using (
  exists (
    select 1
    from public.participantes
    where participantes.id = respuestas.participante_id
      and participantes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.participantes
    where participantes.id = respuestas.participante_id
      and participantes.user_id = auth.uid()
  )
);

create policy "crear resultado propio"
on public.resultados for insert
with check (
  exists (
    select 1
    from public.participantes
    where participantes.id = resultados.participante_id
      and participantes.user_id = auth.uid()
  )
);

create policy "actualizar resultado propio"
on public.resultados for update
using (
  exists (
    select 1
    from public.participantes
    where participantes.id = resultados.participante_id
      and participantes.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.participantes
    where participantes.id = resultados.participante_id
      and participantes.user_id = auth.uid()
  )
);
