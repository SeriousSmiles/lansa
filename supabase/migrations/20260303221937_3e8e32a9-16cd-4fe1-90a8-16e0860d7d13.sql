-- Enable RLS on catalogue_entries (currently has no policies — security gap)
ALTER TABLE public.catalogue_entries ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read catalogue entries (discovery feature)
CREATE POLICY "catalogue_entries_select_authenticated"
ON public.catalogue_entries
FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert/update/delete only their own entries
CREATE POLICY "catalogue_entries_insert_owner"
ON public.catalogue_entries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "catalogue_entries_update_owner"
ON public.catalogue_entries
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "catalogue_entries_delete_owner"
ON public.catalogue_entries
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);