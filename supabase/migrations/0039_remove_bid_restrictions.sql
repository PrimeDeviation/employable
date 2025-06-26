-- Remove restrictions for bidding to allow testing
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can create bids" ON public.bids;

-- Create permissive policy that allows any authenticated user to bid
CREATE POLICY "Users can create bids"
ON public.bids FOR INSERT
WITH CHECK (auth.uid() = bidder_id); 