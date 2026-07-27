
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS legal_name text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS tax_id text,
  ADD COLUMN IF NOT EXISTS iban text,
  ADD COLUMN IF NOT EXISTS iban_holder text,
  ADD COLUMN IF NOT EXISTS payout_currency text DEFAULT 'PLN',
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

CREATE TABLE IF NOT EXISTS public.partnership_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version text NOT NULL DEFAULT '1.0',
  agreement_text text NOT NULL,
  commission_percentage numeric(5,2) NOT NULL DEFAULT 15.00,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.partnership_agreements TO authenticated;
GRANT ALL ON public.partnership_agreements TO service_role;

ALTER TABLE public.partnership_agreements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pa_select_own_or_admin" ON public.partnership_agreements;
CREATE POLICY "pa_select_own_or_admin" ON public.partnership_agreements FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "pa_insert_own" ON public.partnership_agreements;
CREATE POLICY "pa_insert_own" ON public.partnership_agreements FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_pa_user ON public.partnership_agreements(user_id, accepted_at DESC);
