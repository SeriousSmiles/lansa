-- Insert test certification for John Nathan Stephens
INSERT INTO public.user_certifications (
  user_id,
  lansa_certified,
  verified,
  certified_at
) VALUES (
  'e15bf03c-4d06-4902-9a95-0701c54e3ea9',
  true,
  true,
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  lansa_certified = true,
  verified = true,
  certified_at = NOW();