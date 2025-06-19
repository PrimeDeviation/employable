-- Remove duplicate resources, keeping only the most recent one for each username
DELETE FROM resources r1
USING resources r2
INNER JOIN profiles p1 ON r1.profile_id = p1.id
INNER JOIN profiles p2 ON r2.profile_id = p2.id
WHERE r1.id < r2.id 
AND p1.username = p2.username;

-- Add unique constraint on profile_id to prevent future duplicates
-- (profile_id should be unique since each user has one profile)
ALTER TABLE resources 
ADD CONSTRAINT resources_profile_id_unique UNIQUE (profile_id); 