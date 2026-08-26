
-- DISPUTES
CREATE TABLE public.payout_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_item_id uuid NOT NULL REFERENCES public.payout_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  disputed_amount numeric,
  status text NOT NULL DEFAULT 'open',
  resolution text,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payout_disputes_status_chk CHECK (status IN ('open','under_review','resolved','rejected'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payout_disputes TO authenticated;
GRANT ALL ON public.payout_disputes TO service_role;
ALTER TABLE public.payout_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own disputes" ON public.payout_disputes FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users create own disputes" ON public.payout_disputes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.payout_items pi WHERE pi.id = payout_item_id AND pi.user_id = auth.uid()));
CREATE POLICY "Users update own open disputes" ON public.payout_disputes FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'open')
  WITH CHECK (user_id = auth.uid() AND status IN ('open'));
CREATE POLICY "Admins manage disputes" ON public.payout_disputes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_payout_disputes_updated_at BEFORE UPDATE ON public.payout_disputes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- COMMENTS
CREATE TABLE public.payout_dispute_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid NOT NULL REFERENCES public.payout_disputes(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payout_dispute_comments TO authenticated;
GRANT ALL ON public.payout_dispute_comments TO service_role;
ALTER TABLE public.payout_dispute_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View dispute comments" ON public.payout_dispute_comments FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR (is_internal = false AND EXISTS (
      SELECT 1 FROM public.payout_disputes d WHERE d.id = dispute_id AND d.user_id = auth.uid()))
  );
CREATE POLICY "Add dispute comments" ON public.payout_dispute_comments FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND (
      public.has_role(auth.uid(),'admin')
      OR (is_internal = false AND EXISTS (
        SELECT 1 FROM public.payout_disputes d WHERE d.id = dispute_id AND d.user_id = auth.uid()))
    )
  );

-- ADJUSTMENTS
CREATE TABLE public.payout_item_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_item_id uuid NOT NULL REFERENCES public.payout_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  previous_gross numeric,
  new_gross numeric,
  previous_fee numeric,
  new_fee numeric,
  previous_net numeric,
  new_net numeric,
  reason text,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payout_item_adjustments TO authenticated;
GRANT ALL ON public.payout_item_adjustments TO service_role;
ALTER TABLE public.payout_item_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own adjustments" ON public.payout_item_adjustments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.log_payout_item_adjustment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.gross_amount IS DISTINCT FROM OLD.gross_amount
     OR NEW.platform_fee_amount IS DISTINCT FROM OLD.platform_fee_amount
     OR NEW.net_amount IS DISTINCT FROM OLD.net_amount THEN
    INSERT INTO public.payout_item_adjustments(
      payout_item_id, user_id, previous_gross, new_gross, previous_fee, new_fee,
      previous_net, new_net, reason, changed_by)
    VALUES (NEW.id, NEW.user_id, OLD.gross_amount, NEW.gross_amount,
      OLD.platform_fee_amount, NEW.platform_fee_amount,
      OLD.net_amount, NEW.net_amount, NEW.note, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_log_payout_item_adjustment AFTER UPDATE ON public.payout_items
  FOR EACH ROW EXECUTE FUNCTION public.log_payout_item_adjustment();
