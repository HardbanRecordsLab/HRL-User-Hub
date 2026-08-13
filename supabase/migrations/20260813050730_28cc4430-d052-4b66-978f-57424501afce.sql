CREATE TABLE public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'PLN',
  period_start date,
  period_end date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','processing','paid','rejected')),
  iban text,
  iban_holder text,
  reference text,
  notes text,
  admin_notes text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  paid_at timestamptz,
  processed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payouts TO authenticated;
GRANT ALL ON public.payouts TO service_role;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts" ON public.payouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert payouts" ON public.payouts
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payouts" ON public.payouts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete payouts" ON public.payouts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payout_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id uuid NOT NULL REFERENCES public.payouts(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  note text,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payout_status_history TO authenticated;
GRANT ALL ON public.payout_status_history TO service_role;
ALTER TABLE public.payout_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View payout history" ON public.payout_status_history
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.payouts p WHERE p.id = payout_id AND p.user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.log_payout_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.payout_status_history(payout_id, previous_status, new_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status, auth.uid());
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.payout_status_history(payout_id, previous_status, new_status, note, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.admin_notes, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_log_payout_status AFTER INSERT OR UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.log_payout_status_change();

CREATE INDEX idx_payouts_user ON public.payouts(user_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);