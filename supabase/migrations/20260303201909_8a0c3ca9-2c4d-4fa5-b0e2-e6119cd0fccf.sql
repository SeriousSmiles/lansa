-- Allow users to read public profile info of people they share a chat thread with
-- This fixes the "other_party is null" bug in chat because user_profiles RLS was blocking reads of other participants
CREATE POLICY "Allow reading profile info of chat participants"
ON public.user_profiles FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.chat_threads ct
    WHERE user_profiles.user_id = ANY(ct.participant_ids)
    AND auth.uid() = ANY(ct.participant_ids)
  )
);