-- Fix the trigger on chat_messages to use sender_id instead of user_id
CREATE OR REPLACE FUNCTION public.update_user_last_active_from_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_active_at = NEW.created_at
  WHERE user_id = NEW.sender_id;
  RETURN NEW;
END;
$$;

-- Drop the broken trigger and recreate with correct function
DROP TRIGGER IF EXISTS on_new_message_update_last_active ON public.chat_messages;

CREATE TRIGGER on_new_message_update_last_active
AFTER INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.update_user_last_active_from_message();