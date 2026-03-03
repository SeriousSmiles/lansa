CREATE POLICY "chat_messages_update_read"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (is_thread_participant(thread_id, auth.uid()))
WITH CHECK (is_thread_participant(thread_id, auth.uid()));