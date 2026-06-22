
-- Add privacy control to profiles and restrict public exposure
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles viewable when opted in or by owner"
  ON public.profiles FOR SELECT
  USING (is_public = true OR auth.uid() = id);
