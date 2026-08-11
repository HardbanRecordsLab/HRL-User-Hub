-- 1. Rozszerzenie digital_publications
ALTER TABLE public.digital_publications
  ADD COLUMN IF NOT EXISTS pub_status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS file_format text,
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_size_bytes bigint,
  ADD COLUMN IF NOT EXISTS page_count integer,
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'pl',
  ADD COLUMN IF NOT EXISTS price_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS price_currency text DEFAULT 'PLN',
  ADD COLUMN IF NOT EXISTS target_channels jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid;

-- 2. Splity publikacji
CREATE TABLE IF NOT EXISTS public.publication_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES public.digital_publications(id) ON DELETE CASCADE,
  collaborator_name text NOT NULL,
  collaborator_email text,
  collaborator_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'co-author',
  percentage numeric(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  accepted boolean NOT NULL DEFAULT false,
  accepted_at timestamptz,
  paid_amount numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.publication_splits TO authenticated;
GRANT ALL ON public.publication_splits TO service_role;
ALTER TABLE public.publication_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages publication splits" ON public.publication_splits
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.digital_publications p WHERE p.id = publication_id AND p.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.digital_publications p WHERE p.id = publication_id AND p.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Collaborators view own publication splits" ON public.publication_splits
FOR SELECT TO authenticated
USING (collaborator_user_id = auth.uid());

CREATE POLICY "Collaborators accept own publication split" ON public.publication_splits
FOR UPDATE TO authenticated
USING (collaborator_user_id = auth.uid())
WITH CHECK (collaborator_user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_publication_splits_pub ON public.publication_splits(publication_id);
CREATE INDEX IF NOT EXISTS idx_publication_splits_user ON public.publication_splits(collaborator_user_id);

CREATE TRIGGER update_publication_splits_updated_at
BEFORE UPDATE ON public.publication_splits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- walidacja sumy
CREATE OR REPLACE FUNCTION public.validate_publication_splits_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(percentage),0) INTO total
  FROM public.publication_splits
  WHERE publication_id = COALESCE(NEW.publication_id, OLD.publication_id)
    AND id <> COALESCE(NEW.id, OLD.id);
  IF TG_OP <> 'DELETE' THEN
    total := total + NEW.percentage;
  END IF;
  IF total > 100 THEN
    RAISE EXCEPTION 'Suma procentów splitów nie może przekraczać 100 (aktualnie: %)', total;
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.validate_publication_splits_total() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_validate_publication_splits_total
BEFORE INSERT OR UPDATE ON public.publication_splits
FOR EACH ROW EXECUTE FUNCTION public.validate_publication_splits_total();

-- auto-link po e-mailu
CREATE OR REPLACE FUNCTION public.link_publication_split_collaborator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.collaborator_user_id IS NULL AND NEW.collaborator_email IS NOT NULL THEN
    SELECT u.id INTO NEW.collaborator_user_id
    FROM auth.users u WHERE lower(u.email) = lower(NEW.collaborator_email) LIMIT 1;
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.link_publication_split_collaborator() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_link_publication_split_collaborator
BEFORE INSERT OR UPDATE ON public.publication_splits
FOR EACH ROW EXECUTE FUNCTION public.link_publication_split_collaborator();

-- 3. Historia statusów publikacji
CREATE TABLE IF NOT EXISTS public.publication_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES public.digital_publications(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  note text,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.publication_status_history TO authenticated;
GRANT ALL ON public.publication_status_history TO service_role;
ALTER TABLE public.publication_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner and admins view publication history" ON public.publication_status_history
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.digital_publications p WHERE p.id = publication_id AND p.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_publication_status_history_pub ON public.publication_status_history(publication_id);

CREATE OR REPLACE FUNCTION public.log_publication_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.publication_status_history(publication_id, previous_status, new_status, changed_by)
    VALUES (NEW.id, NULL, NEW.pub_status, auth.uid());
  ELSIF NEW.pub_status IS DISTINCT FROM OLD.pub_status THEN
    INSERT INTO public.publication_status_history(publication_id, previous_status, new_status, note, changed_by)
    VALUES (NEW.id, OLD.pub_status, NEW.pub_status, NEW.admin_notes, auth.uid());
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.log_publication_status_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_log_publication_status
AFTER INSERT OR UPDATE ON public.digital_publications
FOR EACH ROW EXECUTE FUNCTION public.log_publication_status_change();