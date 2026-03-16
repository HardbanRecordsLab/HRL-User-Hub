-- Update music_releases status to handle verification workflow
ALTER TABLE public.music_releases 
DROP CONSTRAINT IF EXISTS music_releases_status_check;

-- Remove default first
ALTER TABLE public.music_releases 
ALTER COLUMN status DROP DEFAULT;

-- Add new status type for the workflow
DO $$ BEGIN
  CREATE TYPE release_status AS ENUM (
    'draft',
    'submitted', 
    'under_review',
    'approved',
    'published',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update the status column to use new type
ALTER TABLE public.music_releases 
ALTER COLUMN status TYPE release_status USING status::text::release_status;

-- Set new default
ALTER TABLE public.music_releases
ALTER COLUMN status SET DEFAULT 'draft'::release_status;

-- Add new columns for file uploads and admin review
ALTER TABLE public.music_releases
ADD COLUMN IF NOT EXISTS audio_file_url TEXT,
ADD COLUMN IF NOT EXISTS cover_file_url TEXT,
ADD COLUMN IF NOT EXISTS additional_files JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

-- Create storage bucket for music releases
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'music-releases',
  'music-releases',
  false,
  104857600, -- 100MB limit
  ARRAY['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-wav', 'image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for music-releases bucket
CREATE POLICY "Users can upload their own release files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'music-releases' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own release files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'music-releases' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
);

CREATE POLICY "Admins can view all release files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'music-releases' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can update their own release files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'music-releases' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own release files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'music-releases' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add RLS policy for admins to update any release (for review process)
CREATE POLICY "Admins can update any release"
ON public.music_releases
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);