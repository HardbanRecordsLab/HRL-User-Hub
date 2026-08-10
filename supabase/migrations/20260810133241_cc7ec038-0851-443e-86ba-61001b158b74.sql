
-- Views must run with the querying user's permissions
ALTER VIEW public.public_artist_profiles SET (security_invoker = true);
ALTER VIEW public.public_music_releases SET (security_invoker = true);

-- Column-level grants keep sensitive columns unreachable for guests
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, username, artist_name, label_name, avatar_url, bio, website, social_links, created_at, is_public)
  ON public.profiles TO anon;

CREATE POLICY "Anonymous can view public artist profiles"
ON public.profiles FOR SELECT TO anon
USING (is_public = true);

REVOKE SELECT ON public.music_releases FROM anon;
GRANT SELECT (id, user_id, title, artist_name, album_type, genre, description, cover_image_url, release_date, status, created_at)
  ON public.music_releases TO anon;

CREATE POLICY "Anonymous can view published releases"
ON public.music_releases FOR SELECT TO anon
USING (status = 'published');
