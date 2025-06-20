-- Create offers and bids system for MCP-first marketplace
-- This replaces the form-based contract system with an offer/bid/contract flow

-- Base offers table for common properties
CREATE TABLE IF NOT EXISTS public.offers (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL, -- Rich multiline description for MCP population
  offer_type TEXT NOT NULL CHECK (offer_type IN ('client_offer', 'team_offer')),
  created_by UUID REFERENCES auth.users NOT NULL,
  
  -- Budget information
  budget_min NUMERIC(10, 2),
  budget_max NUMERIC(10, 2),
  budget_type TEXT CHECK (budget_type IN ('fixed', 'hourly', 'milestone', 'negotiable')),
  
  -- Status and visibility
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'expired')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'team_only')),
  
  -- Location and remote preferences
  location_preference TEXT, -- 'remote', 'on-site', 'hybrid', or specific location
  timezone_preference TEXT,
  
  -- Metadata
  tags TEXT[], -- For categorization and search
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Client offers table for hiring organizations
CREATE TABLE IF NOT EXISTS public.client_offers (
  offer_id INTEGER PRIMARY KEY REFERENCES public.offers(id) ON DELETE CASCADE,
  
  -- Project objectives and requirements
  objectives TEXT[] NOT NULL, -- Array of clear objectives
  success_criteria TEXT[], -- What defines project success
  deliverables TEXT[], -- Expected deliverables
  
  -- Timeline and scheduling
  timeline TEXT, -- Flexible timeline description
  start_date DATE,
  deadline DATE,
  estimated_duration TEXT, -- "2-3 months", "ongoing", etc.
  
  -- Technical requirements
  required_skills TEXT[] NOT NULL,
  preferred_skills TEXT[],
  project_type TEXT, -- 'web_app', 'mobile_app', 'api', 'ai_integration', etc.
  technical_requirements TEXT, -- Detailed technical specs
  
  -- Team preferences
  team_size_preference TEXT, -- '1-2 people', 'small team', 'enterprise team'
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'expert', 'any')),
  
  -- Communication and process
  communication_style TEXT, -- 'daily updates', 'weekly reports', 'async', etc.
  project_management_style TEXT -- 'agile', 'waterfall', 'flexible', etc.
);

-- Team offers table for service providers
CREATE TABLE IF NOT EXISTS public.team_offers (
  offer_id INTEGER PRIMARY KEY REFERENCES public.offers(id) ON DELETE CASCADE,
  
  -- Service offerings
  services_offered TEXT[] NOT NULL, -- What services the team provides
  service_categories TEXT[], -- 'web_development', 'ai_consulting', 'devops', etc.
  
  -- Team information
  team_size INTEGER,
  team_composition TEXT, -- Description of team roles and experience
  methodology TEXT, -- Development methodology and approach
  
  -- Experience and portfolio
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'expert')),
  years_experience INTEGER,
  portfolio_examples TEXT[], -- URLs or descriptions of past work
  client_testimonials TEXT[],
  
  -- Specializations and differentiators
  specializations TEXT[], -- What makes this team unique
  certifications TEXT[],
  technologies_expertise TEXT[], -- Deep expertise areas
  
  -- Availability and capacity
  current_availability TEXT, -- 'immediate', 'within 2 weeks', 'Q2 2025'
  capacity TEXT, -- 'full-time', 'part-time', '20hrs/week'
  
  -- Process and communication
  onboarding_process TEXT, -- How they start new projects
  communication_approach TEXT, -- How they work with clients
  quality_assurance TEXT -- QA and testing approach
);

-- Bids table for responses to offers
CREATE TABLE IF NOT EXISTS public.bids (
  id SERIAL PRIMARY KEY,
  offer_id INTEGER REFERENCES public.offers(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES auth.users NOT NULL,
  
  -- Bid details
  proposal TEXT NOT NULL, -- Detailed response to the offer
  proposed_budget NUMERIC(10, 2),
  proposed_timeline TEXT,
  
  -- Bid-specific information
  why_choose_us TEXT, -- Why this bidder is the best choice
  approach TEXT, -- How they would tackle the project
  questions TEXT[], -- Questions for the offer creator
  
  -- Status
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'accepted', 'rejected', 'withdrawn')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one bid per user per offer
  UNIQUE(offer_id, bidder_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_offers_type ON public.offers(offer_type);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_created_by ON public.offers(created_by);
CREATE INDEX IF NOT EXISTS idx_offers_tags ON public.offers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON public.offers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_client_offers_skills ON public.client_offers USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_client_offers_project_type ON public.client_offers(project_type);

CREATE INDEX IF NOT EXISTS idx_team_offers_services ON public.team_offers USING GIN(services_offered);
CREATE INDEX IF NOT EXISTS idx_team_offers_categories ON public.team_offers USING GIN(service_categories);

CREATE INDEX IF NOT EXISTS idx_bids_offer ON public.bids(offer_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON public.bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids(status);

-- Enable RLS on all tables
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offers table
DROP POLICY IF EXISTS "Users can read public offers" ON public.offers;
CREATE POLICY "Users can read public offers" 
ON public.offers FOR SELECT
USING (visibility = 'public' OR created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create their own offers" ON public.offers;
CREATE POLICY "Users can create their own offers"
ON public.offers FOR INSERT
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own offers" ON public.offers;
CREATE POLICY "Users can update their own offers"
ON public.offers FOR UPDATE
USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own offers" ON public.offers;
CREATE POLICY "Users can delete their own offers"
ON public.offers FOR DELETE
USING (auth.uid() = created_by);

-- RLS Policies for client_offers table
DROP POLICY IF EXISTS "Users can read client offer details" ON public.client_offers;
CREATE POLICY "Users can read client offer details"
ON public.client_offers FOR SELECT
USING (
  offer_id IN (
    SELECT id FROM public.offers 
    WHERE visibility = 'public' OR created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage their client offers" ON public.client_offers;
CREATE POLICY "Users can manage their client offers"
ON public.client_offers FOR ALL
USING (
  offer_id IN (
    SELECT id FROM public.offers WHERE created_by = auth.uid()
  )
);

-- RLS Policies for team_offers table
DROP POLICY IF EXISTS "Users can read team offer details" ON public.team_offers;
CREATE POLICY "Users can read team offer details"
ON public.team_offers FOR SELECT
USING (
  offer_id IN (
    SELECT id FROM public.offers 
    WHERE visibility = 'public' OR created_by = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage their team offers" ON public.team_offers;
CREATE POLICY "Users can manage their team offers"
ON public.team_offers FOR ALL
USING (
  offer_id IN (
    SELECT id FROM public.offers WHERE created_by = auth.uid()
  )
);

-- RLS Policies for bids table
DROP POLICY IF EXISTS "Users can read bids on their offers" ON public.bids;
CREATE POLICY "Users can read bids on their offers"
ON public.bids FOR SELECT
USING (
  bidder_id = auth.uid() OR 
  offer_id IN (SELECT id FROM public.offers WHERE created_by = auth.uid())
);

DROP POLICY IF EXISTS "Users can create bids" ON public.bids;
CREATE POLICY "Users can create bids"
ON public.bids FOR INSERT
WITH CHECK (auth.uid() = bidder_id);

DROP POLICY IF EXISTS "Users can update their own bids" ON public.bids;
CREATE POLICY "Users can update their own bids"
ON public.bids FOR UPDATE
USING (auth.uid() = bidder_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION public.update_offers_updated_at()
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

CREATE OR REPLACE FUNCTION public.update_bids_updated_at()
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

-- Create triggers for timestamp updates
DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE PROCEDURE public.update_offers_updated_at();

DROP TRIGGER IF EXISTS update_bids_updated_at ON public.bids;
CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW EXECUTE PROCEDURE public.update_bids_updated_at();

-- Helper function to create client offers with proper validation
CREATE OR REPLACE FUNCTION public.create_client_offer(
  p_title TEXT,
  p_description TEXT,
  p_objectives TEXT[],
  p_required_skills TEXT[],
  p_budget_min NUMERIC DEFAULT NULL,
  p_budget_max NUMERIC DEFAULT NULL,
  p_budget_type TEXT DEFAULT 'negotiable'
)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_offer_id INTEGER;
BEGIN
  -- Create base offer
  INSERT INTO public.offers (
    title, description, offer_type, created_by, 
    budget_min, budget_max, budget_type
  ) VALUES (
    p_title, p_description, 'client_offer', auth.uid(),
    p_budget_min, p_budget_max, p_budget_type
  ) RETURNING id INTO v_offer_id;
  
  -- Create client offer details
  INSERT INTO public.client_offers (
    offer_id, objectives, required_skills
  ) VALUES (
    v_offer_id, p_objectives, p_required_skills
  );
  
  RETURN v_offer_id;
END;
$$;

-- Helper function to create team offers
CREATE OR REPLACE FUNCTION public.create_team_offer(
  p_title TEXT,
  p_description TEXT,
  p_services_offered TEXT[],
  p_team_size INTEGER DEFAULT NULL,
  p_experience_level TEXT DEFAULT 'mid'
)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_offer_id INTEGER;
BEGIN
  -- Create base offer
  INSERT INTO public.offers (
    title, description, offer_type, created_by
  ) VALUES (
    p_title, p_description, 'team_offer', auth.uid()
  ) RETURNING id INTO v_offer_id;
  
  -- Create team offer details
  INSERT INTO public.team_offers (
    offer_id, services_offered, team_size, experience_level
  ) VALUES (
    v_offer_id, p_services_offered, p_team_size, p_experience_level
  );
  
  RETURN v_offer_id;
END;
$$; 