-- EPIC 0 · U3 — Esquema. Refleja las shapes de src/data/*.ts (campos en español).

-- Identidad
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  created_at timestamptz not null default now()
);

create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  nombre text not null,
  notas text,
  created_at timestamptz not null default now()
);

-- Catálogo (lectura pública)
create table if not exists public.walkers (
  id text primary key,
  nombre text not null,
  foto text,
  barrio text,
  bio text,
  especialidades text[] not null default '{}',
  tags text[] not null default '{}',
  distancia_km numeric not null default 0,
  disponible_ahora boolean not null default false,
  tiempo_respuesta text,
  rating numeric not null default 0,
  num_resenas integer not null default 0,
  paseos_completados integer not null default 0,
  verificado boolean not null default false,
  anios_experiencia integer not null default 0,
  galeria text[] not null default '{}',
  nota_recogida text,
  tiene_perros boolean,
  texto_perros text,
  dias_no_disponibles integer[] not null default '{}',
  ofrece_estancia boolean not null default false,
  precio_estancia_noche numeric
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  walker_id text not null references public.walkers (id) on delete cascade,
  autor text not null,
  texto text not null
);

create table if not exists public.partners (
  id text primary key,
  nombre text not null,
  tagline text,
  color text,
  text_color text
);

create table if not exists public.products (
  id text primary key,
  partner_id text not null references public.partners (id) on delete cascade,
  nombre text not null,
  descripcion text,
  emoji text,
  costo_treats integer not null
);

create table if not exists public.treats (
  id text primary key,
  emoji text,
  nombre text not null,
  descripcion text,
  precio numeric not null
);

-- Datos del usuario (privados)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  walker_id text not null references public.walkers (id),
  tipo text not null check (tipo in ('paseo', 'estancia')),
  perro text,
  estado text not null default 'confirmada'
    check (estado in ('confirmada', 'en_curso', 'completada', 'cancelada')),
  fecha_label text,
  hora text,
  duracion integer,
  noches integer,
  nota text,
  recogida text,
  inicio_iso timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  walker_id text not null references public.walkers (id),
  created_at timestamptz not null default now(),
  unique (user_id, walker_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  de text not null check (de in ('yo', 'ellos')),
  texto text not null,
  foto text,
  created_at timestamptz not null default now()
);

-- Ledger de treats (append-only) + saldo materializado
create table if not exists public.treat_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta integer not null,
  kind text not null check (kind in ('earn', 'gift', 'redeem')),
  label text,
  emoji text,
  counterparty text,
  walker_id text,
  note text,
  photo_url text,
  ref text,
  idempotency_key text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.treat_balances (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  saldo integer not null default 0 check (saldo >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id text not null references public.products (id),
  costo_treats integer not null,
  estado text not null default 'en_camino' check (estado in ('en_camino', 'entregado')),
  direccion text,
  created_at timestamptz not null default now()
);

-- Índices
create index if not exists idx_dogs_owner on public.dogs (owner_id);
create index if not exists idx_reviews_walker on public.reviews (walker_id);
create index if not exists idx_products_partner on public.products (partner_id);
create index if not exists idx_bookings_user on public.bookings (user_id);
create index if not exists idx_chat_threads_user on public.chat_threads (user_id);
create index if not exists idx_chat_messages_thread on public.chat_messages (thread_id);
create index if not exists idx_treat_tx_user on public.treat_transactions (user_id);
create index if not exists idx_redemptions_user on public.redemptions (user_id);
