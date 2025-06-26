-- Fix RLS policy for bids to prevent self-bidding
-- Drop existing policy
DROP POLICY IF EXISTS "Users can create bids" ON public.bids;

-- Create new policy that prevents users from bidding on their own offers
CREATE POLICY "Users can create bids"
ON public.bids FOR INSERT
WITH CHECK (
  auth.uid() = bidder_id AND
  offer_id NOT IN (
    SELECT id FROM public.offers WHERE created_by = auth.uid()
  )
); 