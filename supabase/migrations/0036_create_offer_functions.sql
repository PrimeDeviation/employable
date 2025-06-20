-- Create database functions for offer and bid management
-- These functions will be called by the MCP server

-- Function to create a client offer
CREATE OR REPLACE FUNCTION create_client_offer(
  p_title TEXT,
  p_description TEXT,
  p_objectives TEXT[],
  p_required_skills TEXT[],
  p_budget_min NUMERIC DEFAULT NULL,
  p_budget_max NUMERIC DEFAULT NULL,
  p_budget_type TEXT DEFAULT 'negotiable'
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer_id INTEGER;
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Create the base offer
  INSERT INTO public.offers (
    title, description, offer_type, created_by, 
    budget_min, budget_max, budget_type
  ) VALUES (
    p_title, p_description, 'client_offer', v_user_id,
    p_budget_min, p_budget_max, p_budget_type
  ) RETURNING id INTO v_offer_id;

  -- Create the client-specific offer details
  INSERT INTO public.client_offers (
    offer_id, objectives, required_skills
  ) VALUES (
    v_offer_id, p_objectives, p_required_skills
  );

  RETURN v_offer_id;
END;
$$;

-- Function to create a team offer
CREATE OR REPLACE FUNCTION create_team_offer(
  p_title TEXT,
  p_description TEXT,
  p_services_offered TEXT[],
  p_team_size INTEGER DEFAULT NULL,
  p_experience_level TEXT DEFAULT 'mid'
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offer_id INTEGER;
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Create the base offer
  INSERT INTO public.offers (
    title, description, offer_type, created_by
  ) VALUES (
    p_title, p_description, 'team_offer', v_user_id
  ) RETURNING id INTO v_offer_id;

  -- Create the team-specific offer details
  INSERT INTO public.team_offers (
    offer_id, services_offered, team_size, experience_level
  ) VALUES (
    v_offer_id, p_services_offered, p_team_size, p_experience_level
  );

  RETURN v_offer_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_client_offer TO authenticated;
GRANT EXECUTE ON FUNCTION create_team_offer TO authenticated; 