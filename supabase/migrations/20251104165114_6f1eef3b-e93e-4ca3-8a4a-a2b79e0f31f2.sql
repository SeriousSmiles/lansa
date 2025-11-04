-- Add admin management capabilities to product_updates table

-- Add created_by and updated_at columns if they don't exist
ALTER TABLE public.product_updates 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS icon_name text,
ADD COLUMN IF NOT EXISTS badge_text text,
ADD COLUMN IF NOT EXISTS badge_color text;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_product_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_updates_updated_at ON public.product_updates;
CREATE TRIGGER product_updates_updated_at
  BEFORE UPDATE ON public.product_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_updates_updated_at();

-- Enable RLS on product_updates
ALTER TABLE public.product_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view published updates" ON public.product_updates;
DROP POLICY IF EXISTS "Admins can manage all updates" ON public.product_updates;

-- Public can view published updates
CREATE POLICY "Public can view published updates"
  ON public.product_updates
  FOR SELECT
  USING (published_at <= now());

-- Admins can manage all product updates
CREATE POLICY "Admins can manage all updates"
  ON public.product_updates
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on user_seen_updates
ALTER TABLE public.user_seen_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own seen updates" ON public.user_seen_updates;
DROP POLICY IF EXISTS "Users can mark updates as seen" ON public.user_seen_updates;

-- Users can view their own seen updates
CREATE POLICY "Users can view their own seen updates"
  ON public.user_seen_updates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark updates as seen
CREATE POLICY "Users can mark updates as seen"
  ON public.user_seen_updates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create storage policy for admin product update images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-updates', 'product-updates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-updates bucket
CREATE POLICY "Admins can upload product update images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-updates' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Public can view product update images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-updates');

CREATE POLICY "Admins can update product update images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-updates' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete product update images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-updates' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );