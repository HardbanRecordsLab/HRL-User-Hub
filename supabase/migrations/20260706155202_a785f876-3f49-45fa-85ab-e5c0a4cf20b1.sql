
-- Rozszerz enum statusów wydań o brakujące
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid=e.enumtypid WHERE t.typname='release_status' AND e.enumlabel='pending_review') THEN
    ALTER TYPE release_status ADD VALUE IF NOT EXISTS 'pending_review';
  END IF;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE release_status ADD VALUE IF NOT EXISTS 'distributed';
EXCEPTION WHEN undefined_object THEN NULL; WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE release_status ADD VALUE IF NOT EXISTS 'live';
EXCEPTION WHEN undefined_object THEN NULL; WHEN duplicate_object THEN NULL; END $$;

-- 1) release_splits
CREATE TABLE IF NOT EXISTS public.release_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID NOT NULL REFERENCES public.music_releases(id) ON DELETE CASCADE,
  collaborator_name TEXT NOT NULL,
  collaborator_email TEXT,
  role TEXT NOT NULL DEFAULT 'artist',
  percentage NUMERIC(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMPTZ,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.release_splits TO authenticated;
GRANT ALL ON public.release_splits TO service_role;

ALTER TABLE public.release_splits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner and admins manage splits"
  ON public.release_splits FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.music_releases r WHERE r.id = release_id AND r.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.music_releases r WHERE r.id = release_id AND r.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Collaborators view own splits by email"
  ON public.release_splits FOR SELECT
  USING (collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_release_splits_release ON public.release_splits(release_id);
CREATE INDEX IF NOT EXISTS idx_release_splits_email ON public.release_splits(collaborator_email);

CREATE TRIGGER update_release_splits_updated_at
  BEFORE UPDATE ON public.release_splits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Walidacja sumy procentów <=100
CREATE OR REPLACE FUNCTION public.validate_release_splits_total()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE total NUMERIC;
BEGIN
  SELECT COALESCE(SUM(percentage),0) INTO total
  FROM public.release_splits
  WHERE release_id = COALESCE(NEW.release_id, OLD.release_id)
    AND id <> COALESCE(NEW.id, OLD.id);
  IF TG_OP <> 'DELETE' THEN
    total := total + NEW.percentage;
  END IF;
  IF total > 100 THEN
    RAISE EXCEPTION 'Suma procentów splitów nie może przekraczać 100 (aktualnie: %)', total;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_validate_release_splits_total
  BEFORE INSERT OR UPDATE ON public.release_splits
  FOR EACH ROW EXECUTE FUNCTION public.validate_release_splits_total();

-- 3) release_status_history
CREATE TABLE IF NOT EXISTS public.release_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id UUID NOT NULL REFERENCES public.music_releases(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.release_status_history TO authenticated;
GRANT ALL ON public.release_status_history TO service_role;

ALTER TABLE public.release_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner and admins view status history"
  ON public.release_status_history FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.music_releases r WHERE r.id = release_id AND r.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System inserts status history"
  ON public.release_status_history FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_release_status_history_release ON public.release_status_history(release_id, created_at DESC);

-- 4) Trigger nagrywający zmiany statusu
CREATE OR REPLACE FUNCTION public.log_release_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.release_status_history(release_id, previous_status, new_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status::text, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.release_status_history(release_id, previous_status, new_status, note, changed_by)
    VALUES (NEW.id, OLD.status::text, NEW.status::text, NEW.admin_notes, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_log_release_status ON public.music_releases;
CREATE TRIGGER trg_log_release_status
  AFTER INSERT OR UPDATE OF status ON public.music_releases
  FOR EACH ROW EXECUTE FUNCTION public.log_release_status_change();
