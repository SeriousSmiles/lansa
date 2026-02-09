
-- Delete related data for seeded jobs first
DELETE FROM job_skills WHERE job_id IN (
  SELECT id FROM job_listings_v2 WHERE created_by = 'e15bf03c-4d06-4902-9a95-0701c54e3ea9'
);

DELETE FROM job_recommendations WHERE job_id IN (
  SELECT id FROM job_listings_v2 WHERE created_by = 'e15bf03c-4d06-4902-9a95-0701c54e3ea9'
);

DELETE FROM job_interactions WHERE job_id IN (
  SELECT id FROM job_listings_v2 WHERE created_by = 'e15bf03c-4d06-4902-9a95-0701c54e3ea9'
);

DELETE FROM job_applications_v2 WHERE job_id IN (
  SELECT id FROM job_listings_v2 WHERE created_by = 'e15bf03c-4d06-4902-9a95-0701c54e3ea9'
);

-- Delete the seeded job listings
DELETE FROM job_listings_v2 WHERE created_by = 'e15bf03c-4d06-4902-9a95-0701c54e3ea9';
