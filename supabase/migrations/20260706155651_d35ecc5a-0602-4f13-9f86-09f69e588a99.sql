
ALTER TABLE public.revenue_transactions
  ADD COLUMN IF NOT EXISTS gross_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS platform_fee_pct NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  ADD COLUMN IF NOT EXISTS platform_fee_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS net_to_artist NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS release_id UUID REFERENCES public.music_releases(id) ON DELETE SET NULL;

-- Trigger: auto-calc commission
CREATE OR REPLACE FUNCTION public.calc_revenue_commission()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.gross_amount IS NULL THEN
    NEW.gross_amount := NEW.amount;
  END IF;
  IF NEW.platform_fee_pct IS NULL THEN
    NEW.platform_fee_pct := 15.00;
  END IF;
  NEW.platform_fee_amount := ROUND(COALESCE(NEW.gross_amount,0) * NEW.platform_fee_pct / 100.0, 2);
  NEW.net_to_artist := ROUND(COALESCE(NEW.gross_amount,0) - NEW.platform_fee_amount, 2);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_calc_revenue_commission ON public.revenue_transactions;
CREATE TRIGGER trg_calc_revenue_commission
  BEFORE INSERT OR UPDATE ON public.revenue_transactions
  FOR EACH ROW EXECUTE FUNCTION public.calc_revenue_commission();

-- Backfill: historic rows treat amount as gross with 15%
UPDATE public.revenue_transactions
SET gross_amount = amount,
    platform_fee_pct = 15.00,
    platform_fee_amount = ROUND(amount * 0.15, 2),
    net_to_artist = ROUND(amount * 0.85, 2)
WHERE gross_amount IS NULL;

CREATE INDEX IF NOT EXISTS idx_revenue_release ON public.revenue_transactions(release_id);
CREATE INDEX IF NOT EXISTS idx_revenue_user_date ON public.revenue_transactions(user_id, transaction_date DESC);
