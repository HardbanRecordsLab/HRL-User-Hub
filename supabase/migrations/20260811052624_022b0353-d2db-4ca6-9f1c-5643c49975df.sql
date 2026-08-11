ALTER TABLE public.release_splits
  ADD COLUMN IF NOT EXISTS collaborator_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_release_splits_collaborator_user_id
  ON public.release_splits(collaborator_user_id);

-- Backfill from existing emails where a matching account exists
UPDATE public.release_splits s
SET collaborator_user_id = u.id
FROM auth.users u
WHERE s.collaborator_user_id IS NULL
  AND s.collaborator_email IS NOT NULL
  AND lower(u.email) = lower(s.collaborator_email);

-- Keep the link in sync when a split is created/updated with an email
CREATE OR REPLACE FUNCTION public.link_split_collaborator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.collaborator_user_id IS NULL AND NEW.collaborator_email IS NOT NULL THEN
    SELECT u.id INTO NEW.collaborator_user_id
    FROM auth.users u
    WHERE lower(u.email) = lower(NEW.collaborator_email)
    LIMIT 1;
  END IF;
  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.link_split_collaborator() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_link_split_collaborator ON public.release_splits;
CREATE TRIGGER trg_link_split_collaborator
BEFORE INSERT OR UPDATE OF collaborator_email ON public.release_splits
FOR EACH ROW EXECUTE FUNCTION public.link_split_collaborator();

-- Replace the email-matching policy with verified user_id matching
DROP POLICY IF EXISTS "Collaborators view own splits by email" ON public.release_splits;

CREATE POLICY "Collaborators view own splits"
ON public.release_splits
FOR SELECT
TO authenticated
USING (collaborator_user_id = auth.uid());

-- Collaborators may accept their own split, but cannot change money fields
CREATE POLICY "Collaborators accept own split"
ON public.release_splits
FOR UPDATE
TO authenticated
USING (collaborator_user_id = auth.uid())
WITH CHECK (
  collaborator_user_id = auth.uid()
  AND percentage = (SELECT o.percentage FROM public.release_splits o WHERE o.id = release_splits.id)
  AND paid_amount = (SELECT o.paid_amount FROM public.release_splits o WHERE o.id = release_splits.id)
  AND release_id = (SELECT o.release_id FROM public.release_splits o WHERE o.id = release_splits.id)
);