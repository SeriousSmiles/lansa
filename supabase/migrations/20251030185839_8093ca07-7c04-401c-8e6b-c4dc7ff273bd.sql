-- Grant admin roles to the two main accounts
INSERT INTO user_roles (user_id, role) 
VALUES 
  ('e15bf03c-4d06-4902-9a95-0701c54e3ea9', 'admin'),  -- jognnt@gmail.com (main)
  ('966954fb-48c3-429c-ac8e-aac000f64915', 'admin')   -- jlarmonie98@outlook.com
ON CONFLICT (user_id, role) DO NOTHING;