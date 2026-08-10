
-- 1. Profiles: remove public row-level read of the whole table
DROP POLICY IF EXISTS "Profiles are viewable by owner or when public" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public can view artist profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.profiles FROM anon;

CREATE OR REPLACE VIEW public.public_artist_profiles
WITH (security_invoker = false) AS
SELECT id, username, artist_name, label_name, avatar_url, bio, website, social_links, created_at
FROM public.profiles
WHERE is_public = true;

GRANT SELECT ON public.public_artist_profiles TO anon, authenticated;

-- 2. Music releases: remove public read of internal business columns
DROP POLICY IF EXISTS "Public can view published releases" ON public.music_releases;

CREATE OR REPLACE VIEW public.public_music_releases
WITH (security_invoker = false) AS
SELECT id, user_id, title, artist_name, album_type, genre, description,
       cover_image_url, release_date, status, created_at
FROM public.music_releases
WHERE status = 'published';

GRANT SELECT ON public.public_music_releases TO anon, authenticated;
