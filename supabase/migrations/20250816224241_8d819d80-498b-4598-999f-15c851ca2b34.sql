-- Add unique constraint on user_id for user_answers table
ALTER TABLE public.user_answers 
ADD CONSTRAINT user_answers_user_id_unique UNIQUE (user_id);