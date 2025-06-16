-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    skills TEXT[],
    location TEXT
);

-- Seed with sample data
INSERT INTO resources (name, role, skills, location) VALUES
  ('Jane Doe', 'Frontend Developer', ARRAY['React', 'TypeScript', 'Tailwind'], 'Remote'),
  ('John Smith', 'Backend Developer', ARRAY['Node.js', 'PostgreSQL', 'Supabase'], 'New York'),
  ('Alice Johnson', 'Full Stack Engineer', ARRAY['React', 'Node.js', 'AWS'], 'San Francisco'),
  ('Bob Lee', 'DevOps Engineer', ARRAY['Docker', 'Kubernetes', 'CI/CD'], 'Remote'); 