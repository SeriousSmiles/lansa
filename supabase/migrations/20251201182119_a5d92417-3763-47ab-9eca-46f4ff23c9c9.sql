-- Add color_palette column to user_profiles
-- This enables the new palette-based color system

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS color_palette JSONB DEFAULT jsonb_build_object(
  'mode', 'light',
  'palette_id', 'coral_professional'
);

-- Add comment explaining the new column
COMMENT ON COLUMN user_profiles.color_palette IS 
'JSONB object containing palette configuration: { mode: "light"|"dark", palette_id: string, primary?: string, secondary?: string, background?: string, surface?: string }';
