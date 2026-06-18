-- EPIC 0 · U4 — RLS. Catálogo público; datos de usuario privados;
-- treats no mutables por el cliente (solo service_role, vía server functions).

-- Habilitar RLS en todo
alter table public.profiles            enable row level security;
alter table public.dogs                enable row level security;
alter table public.walkers             enable row level security;
alter table public.reviews             enable row level security;
alter table public.partners            enable row level security;
alter table public.products            enable row level security;
alter table public.treats              enable row level security;
alter table public.bookings            enable row level security;
alter table public.chat_threads        enable row level security;
alter table public.chat_messages       enable row level security;
alter table public.treat_transactions  enable row level security;
alter table public.treat_balances      enable row level security;
alter table public.redemptions         enable row level security;

-- Catálogo: lectura pública (anon + authenticated)
create policy "catalogo_walkers_select"  on public.walkers  for select to anon, authenticated using (true);
create policy "catalogo_reviews_select"  on public.reviews  for select to anon, authenticated using (true);
create policy "catalogo_partners_select" on public.partners for select to anon, authenticated using (true);
create policy "catalogo_products_select" on public.products for select to anon, authenticated using (true);
create policy "catalogo_treats_select"   on public.treats   for select to anon, authenticated using (true);

-- Perfil: el usuario gestiona el suyo
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Perros: del dueño
create policy "dogs_all_own" on public.dogs for all to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Reservas: del dueño (lee/crea/actualiza las suyas)
create policy "bookings_select_own" on public.bookings for select to authenticated using (auth.uid() = user_id);
create policy "bookings_insert_own" on public.bookings for insert to authenticated with check (auth.uid() = user_id);
create policy "bookings_update_own" on public.bookings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Chat: hilos del dueño; mensajes por pertenencia al hilo (lectura).
-- El envío de mensajes lo hace una server function (service_role) en EPIC 3.
create policy "threads_select_own" on public.chat_threads for select to authenticated using (auth.uid() = user_id);
create policy "threads_insert_own" on public.chat_threads for insert to authenticated with check (auth.uid() = user_id);
create policy "messages_select_own" on public.chat_messages for select to authenticated using (
  exists (select 1 from public.chat_threads t where t.id = thread_id and t.user_id = auth.uid())
);

-- Treats: el cliente SOLO lee lo suyo. Las mutaciones van por service_role
-- (apply_treat_tx desde server functions). Sin políticas de insert/update.
create policy "treat_tx_select_own"  on public.treat_transactions for select to authenticated using (auth.uid() = user_id);
create policy "treat_bal_select_own" on public.treat_balances     for select to authenticated using (auth.uid() = user_id);
create policy "redemptions_select_own" on public.redemptions      for select to authenticated using (auth.uid() = user_id);
