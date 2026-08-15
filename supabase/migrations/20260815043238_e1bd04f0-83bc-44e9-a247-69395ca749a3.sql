
-- ============ PAYOUT ITEMS ============
CREATE TABLE public.payout_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payout_id UUID NOT NULL REFERENCES public.payouts(id) ON DELETE CASCADE,
  revenue_transaction_id UUID NOT NULL REFERENCES public.revenue_transactions(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  platform_fee_amount NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'PLN',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (payout_id, revenue_transaction_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payout_items TO authenticated;
GRANT ALL ON public.payout_items TO service_role;

ALTER TABLE public.payout_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payout items"
ON public.payout_items FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage payout items"
ON public.payout_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_payout_items_updated_at
BEFORE UPDATE ON public.payout_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_payout_items_payout ON public.payout_items(payout_id);
CREATE INDEX idx_payout_items_user ON public.payout_items(user_id);

-- mark settled revenue transactions
ALTER TABLE public.revenue_transactions
  ADD COLUMN IF NOT EXISTS settled_payout_id UUID REFERENCES public.payouts(id) ON DELETE SET NULL;

-- keep revenue_transactions in sync with payout items
CREATE OR REPLACE FUNCTION public.sync_revenue_settlement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.revenue_transactions
      SET settled_payout_id = NULL
      WHERE id = OLD.revenue_transaction_id AND settled_payout_id = OLD.payout_id;
    RETURN OLD;
  END IF;
  UPDATE public.revenue_transactions
    SET settled_payout_id = NEW.payout_id
    WHERE id = NEW.revenue_transaction_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_sync_revenue_settlement
AFTER INSERT OR UPDATE OR DELETE ON public.payout_items
FOR EACH ROW EXECUTE FUNCTION public.sync_revenue_settlement();

-- ============ DISTRIBUTION EVENTS ============
CREATE TABLE public.distribution_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES public.music_releases(id) ON DELETE CASCADE,
  publication_id UUID REFERENCES public.digital_publications(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  status TEXT NOT NULL,
  external_id TEXT,
  url TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.distribution_events TO authenticated;
GRANT ALL ON public.distribution_events TO service_role;

ALTER TABLE public.distribution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own distribution events"
ON public.distribution_events FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage distribution events"
ON public.distribution_events FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_distribution_events_updated_at
BEFORE UPDATE ON public.distribution_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_distribution_events_release ON public.distribution_events(release_id);
CREATE INDEX idx_distribution_events_publication ON public.distribution_events(publication_id);
CREATE INDEX idx_distribution_events_user ON public.distribution_events(user_id);
