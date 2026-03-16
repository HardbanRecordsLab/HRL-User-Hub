-- Add UPDATE policy for ai_content table
CREATE POLICY "Users can update their own AI content"
ON public.ai_content
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);