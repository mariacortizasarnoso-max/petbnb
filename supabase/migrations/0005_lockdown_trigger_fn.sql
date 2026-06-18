-- EPIC 0 · U6 (fix advisor) — handle_new_user es una función de TRIGGER; no debe
-- ser invocable vía RPC por anon/authenticated. El trigger sigue funcionando
-- (corre con privilegios del owner), solo se cierra el endpoint RPC.

revoke all on function public.handle_new_user() from public, anon, authenticated;
