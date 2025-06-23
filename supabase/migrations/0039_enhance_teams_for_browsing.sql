-- Enhance teams table for public browsing
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS remote_work BOOLEAN DEFAULT true;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS team_size INTEGER;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS hourly_rate_min NUMERIC(10,2);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS hourly_rate_max NUMERIC(10,2);
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS availability TEXT CHECK (availability IN ('available', 'busy', 'unavailable'));
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS public_profile BOOLEAN DEFAULT true;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_skills ON public.teams USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_teams_location ON public.teams(location);
CREATE INDEX IF NOT EXISTS idx_teams_availability ON public.teams(availability);
CREATE INDEX IF NOT EXISTS idx_teams_public_profile ON public.teams(public_profile);

-- Update the RLS policy to allow public browsing of teams with public_profile = true
DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
CREATE POLICY "Public teams are viewable by everyone"
ON public.teams FOR SELECT
USING (public_profile = true);

-- Allow team members to view their own teams regardless of public_profile setting
CREATE POLICY "Team members can view their teams"
ON public.teams FOR SELECT
USING (
  id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_teams_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE PROCEDURE public.update_teams_updated_at(); 