CREATE POLICY "Users manage own publication files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'publications' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'publications' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins view publication files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'publications' AND public.has_role(auth.uid(), 'admin'));