-- Add team_id support to offers table
-- This allows offers to be associated with specific teams

-- Add team_id column to offers table
ALTER TABLE public.offers 
ADD COLUMN team_id INTEGER REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create index for team-based queries
CREATE INDEX IF NOT EXISTS idx_offers_team_id ON public.offers(team_id);

-- Update RLS policies to support team-based offers
-- Users can read offers from teams they belong to
DROP POLICY IF EXISTS "Users can read public offers" ON public.offers;
CREATE POLICY "Users can read public offers" 
ON public.offers FOR SELECT
USING (
  visibility = 'public' 
  OR created_by = auth.uid()
  OR team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
);

-- Users can create offers for teams they belong to (or individual offers)
DROP POLICY IF EXISTS "Users can create their own offers" ON public.offers;
CREATE POLICY "Users can create their own offers"
ON public.offers FOR INSERT
WITH CHECK (
  auth.uid() = created_by 
  AND (
    team_id IS NULL -- Individual offer
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ) -- Team offer where user is member
  )
);

-- Users can update offers they created (individual or team-based)
DROP POLICY IF EXISTS "Users can update their own offers" ON public.offers;
CREATE POLICY "Users can update their own offers"
ON public.offers FOR UPDATE
USING (
  auth.uid() = created_by 
  AND (
    team_id IS NULL -- Individual offer
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ) -- Team offer where user is member
  )
);

-- Users can delete offers they created (individual or team-based)
DROP POLICY IF EXISTS "Users can delete their own offers" ON public.offers;
CREATE POLICY "Users can delete their own offers"
ON public.offers FOR DELETE
USING (
  auth.uid() = created_by 
  AND (
    team_id IS NULL -- Individual offer
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    ) -- Team offer where user is member
  )
);

-- Helper function to get user's teams for offer creation
CREATE OR REPLACE FUNCTION public.get_user_teams()
RETURNS TABLE (
  team_id INTEGER,
  team_name TEXT,
  is_owner BOOLEAN
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as team_id,
    t.name as team_name,
    (t.owner_id = auth.uid()) as is_owner
  FROM public.teams t
  INNER JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = auth.uid()
  ORDER BY is_owner DESC, t.name ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_teams() TO authenticated; 