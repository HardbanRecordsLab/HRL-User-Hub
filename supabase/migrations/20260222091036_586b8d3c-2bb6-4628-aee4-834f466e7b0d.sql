
-- Allow public read access to profiles (for artist public pages)
CREATE POLICY "Public can view artist profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Allow public read access to published music releases (for artist discography)
CREATE POLICY "Public can view published releases"
ON public.music_releases
FOR SELECT
USING (status = 'published');
