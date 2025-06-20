-- Remove duplicate resources, keeping only the one with the lowest id for each profile_id
DELETE FROM resources 
WHERE id NOT IN (
  SELECT MIN(id)
  FROM resources
  GROUP BY profile_id
);

-- Add unique constraint on profile_id to prevent future duplicates
-- (profile_id should be unique since each user has one profile)
ALTER TABLE resources 
ADD CONSTRAINT resources_profile_id_unique UNIQUE (profile_id); 