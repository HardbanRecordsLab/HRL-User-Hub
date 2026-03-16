-- Create storage bucket for brand assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf']
);

-- Storage policies for brand assets
CREATE POLICY "Users can view their own brand assets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'brand-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own brand assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'brand-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own brand assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'brand-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own brand assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'brand-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add revenue tracking table
CREATE TABLE public.revenue_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL, -- 'music', 'publication', 'campaign', 'other'
  source_id UUID, -- Reference to release/publication/campaign
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  transaction_date DATE NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.revenue_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own revenue"
ON public.revenue_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revenue"
ON public.revenue_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue"
ON public.revenue_transactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue"
ON public.revenue_transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_revenue_transactions_updated_at
BEFORE UPDATE ON public.revenue_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();