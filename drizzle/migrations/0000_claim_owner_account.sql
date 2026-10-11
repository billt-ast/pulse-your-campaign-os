CREATE OR REPLACE FUNCTION public.claim_owner_account()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _org uuid;
BEGIN
  IF lower(NEW.email) = 'odinga.bill@lucene.co' AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
    DELETE FROM public.user_roles WHERE role = 'admin' AND user_id = 'b08fbee2-64cb-4194-9fb9-bbb59e86f2d8';
    FOR _org IN SELECT id FROM public.organizations WHERE name = 'Unity Alliance' LOOP
      INSERT INTO public.organization_members (organization_id, user_id, role)
      VALUES (_org, NEW.id, 'owner')
      ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'owner';
      UPDATE public.organizations SET created_by = NEW.id WHERE id = _org;
      UPDATE public.missions SET created_by = NEW.id WHERE organization_id = _org;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.claim_owner_account() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER on_auth_user_created_claim_owner AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.claim_owner_account();
CREATE TRIGGER on_auth_user_confirmed_claim_owner AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.claim_owner_account();