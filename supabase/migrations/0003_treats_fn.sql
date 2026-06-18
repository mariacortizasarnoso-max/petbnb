-- EPIC 0 · U5 — Saldo materializado: apply_treat_tx (atómica, idempotente,
-- sin negativos) + trigger que crea profiles/treat_balances al alta de usuario.

-- Al crear un usuario (incl. sesión anónima) → perfil + saldo a 0
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.treat_balances (user_id, saldo) values (new.id, 0) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mueve el saldo de forma atómica. Solo la ejecutan server functions
-- (service_role); el cliente no tiene privilegio (revoke abajo).
create or replace function public.apply_treat_tx(
  p_user uuid,
  p_delta integer,
  p_kind text,
  p_idempotency_key text,
  p_label text default null,
  p_emoji text default null,
  p_counterparty text default null,
  p_walker_id text default null,
  p_note text default null,
  p_photo_url text default null,
  p_ref text default null
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_saldo integer;
  v_nuevo integer;
begin
  -- Idempotencia: si ya existe una tx con esa clave, no duplicar.
  if p_idempotency_key is not null
     and exists (select 1 from public.treat_transactions where idempotency_key = p_idempotency_key) then
    select saldo into v_saldo from public.treat_balances where user_id = p_user;
    return coalesce(v_saldo, 0);
  end if;

  -- Asegurar fila de saldo y bloquearla para evitar carreras.
  insert into public.treat_balances (user_id, saldo) values (p_user, 0)
    on conflict (user_id) do nothing;
  select saldo into v_saldo from public.treat_balances where user_id = p_user for update;

  v_nuevo := v_saldo + p_delta;
  if v_nuevo < 0 then
    raise exception 'saldo insuficiente: % no admite delta %', v_saldo, p_delta
      using errcode = 'check_violation';
  end if;

  insert into public.treat_transactions
    (user_id, delta, kind, label, emoji, counterparty, walker_id, note, photo_url, ref, idempotency_key)
  values
    (p_user, p_delta, p_kind, p_label, p_emoji, p_counterparty, p_walker_id, p_note, p_photo_url, p_ref, p_idempotency_key);

  update public.treat_balances set saldo = v_nuevo, updated_at = now() where user_id = p_user;
  return v_nuevo;
end;
$$;

-- El cliente NO puede ejecutar la función; solo service_role / postgres.
revoke all on function public.apply_treat_tx(uuid, integer, text, text, text, text, text, text, text, text, text) from public, anon, authenticated;
