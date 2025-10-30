-- Create or replace function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile with name from metadata
  INSERT INTO public.user_profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CONCAT(
        NEW.raw_user_meta_data->>'first_name',
        ' ',
        NEW.raw_user_meta_data->>'last_name'
      ),
      NEW.raw_user_meta_data->>'name',
      NEW.email
    ),
    NEW.email
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    name = COALESCE(
      EXCLUDED.name,
      user_profiles.name
    ),
    email = COALESCE(
      EXCLUDED.email,
      user_profiles.email
    );
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users with missing names
UPDATE public.user_profiles
SET name = COALESCE(
  (SELECT u.raw_user_meta_data->>'full_name' FROM auth.users u WHERE u.id = user_profiles.user_id),
  (SELECT CONCAT(u.raw_user_meta_data->>'first_name', ' ', u.raw_user_meta_data->>'last_name') FROM auth.users u WHERE u.id = user_profiles.user_id),
  (SELECT u.raw_user_meta_data->>'name' FROM auth.users u WHERE u.id = user_profiles.user_id),
  (SELECT u.email FROM auth.users u WHERE u.id = user_profiles.user_id),
  name
)
WHERE name IS NULL OR name = '';

-- Ensure all users have email in profile
UPDATE public.user_profiles
SET email = (SELECT u.email FROM auth.users u WHERE u.id = user_profiles.user_id)
WHERE email IS NULL OR email = '';