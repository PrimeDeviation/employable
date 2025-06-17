-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    skills TEXT[],
    location TEXT
);

-- Seed with sample data
-- This part is not idempotent but will only run once upon table creation.
-- A more robust seeding strategy might use a separate script or check for existing data.
INSERT INTO resources (name, role, skills, location) 
SELECT 'Jane Doe', 'Frontend Developer', ARRAY['React', 'TypeScript', 'Tailwind'], 'Remote'
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Jane Doe');

INSERT INTO resources (name, role, skills, location)
SELECT 'John Smith', 'Backend Developer', ARRAY['Node.js', 'PostgreSQL', 'Supabase'], 'New York'
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'John Smith');

INSERT INTO resources (name, role, skills, location)
SELECT 'Alice Johnson', 'Full Stack Engineer', ARRAY['React', 'Node.js', 'AWS'], 'San Francisco'
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Alice Johnson');

INSERT INTO resources (name, role, skills, location)
SELECT 'Bob Lee', 'DevOps Engineer', ARRAY['Docker', 'Kubernetes', 'CI/CD'], 'Remote'
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'Bob Lee'); 