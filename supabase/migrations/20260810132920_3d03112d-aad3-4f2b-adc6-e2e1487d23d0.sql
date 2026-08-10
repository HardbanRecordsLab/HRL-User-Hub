
CREATE TABLE public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  actor_id uuid,
  actor_role text,
  object_type text,
  object_identity text,
  action text,
  old_value jsonb,
  new_value jsonb,
  details jsonb,
  succeeded boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sal_created_at ON public.security_audit_log (created_at DESC);
CREATE INDEX idx_sal_event_type ON public.security_audit_log (event_type);
CREATE INDEX idx_sal_actor ON public.security_audit_log (actor_id);

GRANT SELECT ON public.security_audit_log TO authenticated;
GRANT ALL ON public.security_audit_log TO service_role;

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read security audit log"
ON public.security_audit_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- generic writer (security definer, not exposed to clients)
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type text,
  _object_type text DEFAULT NULL,
  _object_identity text DEFAULT NULL,
  _action text DEFAULT NULL,
  _old_value jsonb DEFAULT NULL,
  _new_value jsonb DEFAULT NULL,
  _details jsonb DEFAULT NULL,
  _succeeded boolean DEFAULT true
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.security_audit_log(
    event_type, actor_id, actor_role, object_type, object_identity,
    action, old_value, new_value, details, succeeded)
  VALUES (
    _event_type, auth.uid(), current_user, _object_type, _object_identity,
    _action, _old_value, _new_value, _details, _succeeded);
END; $$;

REVOKE EXECUTE ON FUNCTION public.log_security_event(text,text,text,text,jsonb,jsonb,jsonb,boolean) FROM PUBLIC, anon, authenticated;

-- role change auditing
CREATE OR REPLACE FUNCTION public.audit_user_roles_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_security_event('role_change','user_roles', NEW.user_id::text, 'grant', NULL, to_jsonb(NEW), NULL, true);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_security_event('role_change','user_roles', NEW.user_id::text, 'update', to_jsonb(OLD), to_jsonb(NEW), NULL, true);
    RETURN NEW;
  ELSE
    PERFORM public.log_security_event('role_change','user_roles', OLD.user_id::text, 'revoke', to_jsonb(OLD), NULL, NULL, true);
    RETURN OLD;
  END IF;
END; $$;

REVOKE EXECUTE ON FUNCTION public.audit_user_roles_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_audit_user_roles ON public.user_roles;
CREATE TRIGGER trg_audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_user_roles_change();

-- audit SECURITY DEFINER role-assignment executions (success + denial)
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    PERFORM public.log_security_event(
      'security_definer_exec','function','assign_user_role','denied',
      NULL, jsonb_build_object('target_user', _user_id, 'role', _role), NULL, false);
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  PERFORM public.log_security_event(
    'security_definer_exec','function','assign_user_role','executed',
    NULL, jsonb_build_object('target_user', _user_id, 'role', _role), NULL, true);
END; $$;

REVOKE EXECUTE ON FUNCTION public.assign_user_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_user_role(uuid, app_role) TO authenticated;

-- audit has_role executions (privileged check surface)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _result boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  ) INTO _result;
  RETURN _result;
END; $$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- DDL auditing: RLS policies, grants, security definer function definitions
CREATE OR REPLACE FUNCTION public.audit_ddl_security_changes()
RETURNS event_trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM pg_event_trigger_ddl_commands() LOOP
    IF r.command_tag IN ('CREATE POLICY','ALTER POLICY','DROP POLICY','ALTER TABLE','GRANT','REVOKE','CREATE FUNCTION','ALTER FUNCTION') THEN
      INSERT INTO public.security_audit_log(event_type, actor_id, actor_role, object_type, object_identity, action, details)
      VALUES ('ddl_security_change', auth.uid(), current_user, r.object_type, r.object_identity, r.command_tag,
              jsonb_build_object('schema', r.schema_name));
    END IF;
  END LOOP;
END; $$;

DROP EVENT TRIGGER IF EXISTS trg_audit_ddl_security;
CREATE EVENT TRIGGER trg_audit_ddl_security
ON ddl_command_end
EXECUTE FUNCTION public.audit_ddl_security_changes();
