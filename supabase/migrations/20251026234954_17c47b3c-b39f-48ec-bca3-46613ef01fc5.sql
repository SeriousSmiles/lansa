-- Drop incorrect policies
drop policy if exists "Employers can upload company logos" on storage.objects;
drop policy if exists "Employers can update company logos" on storage.objects;

-- Create precise policy for INSERT (company-logos/{userId}/...)
create policy "company_logos_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'company-logos'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Create precise policy for UPDATE (company-logos/{userId}/...)
create policy "company_logos_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'company-logos'
  and (storage.foldername(name))[2] = auth.uid()::text
)
with check (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'company-logos'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Create precise policy for DELETE (company-logos/{userId}/...)
create policy "company_logos_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'user-uploads'
  and (storage.foldername(name))[1] = 'company-logos'
  and (storage.foldername(name))[2] = auth.uid()::text
);