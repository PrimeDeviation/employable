-- Migration: Allow rebidding after rejection
-- This removes the strict unique constraint and replaces it with a partial unique constraint
-- that only prevents multiple active bids, but allows new bids after rejection

-- Drop the existing unique constraint
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_offer_id_bidder_id_key;

-- Create a partial unique constraint that only applies to non-rejected bids
-- This allows users to submit new bids after their previous bid was rejected
CREATE UNIQUE INDEX bids_offer_id_bidder_id_active_key 
ON public.bids (offer_id, bidder_id) 
WHERE status != 'rejected';

-- Add a comment to explain the constraint
COMMENT ON INDEX bids_offer_id_bidder_id_active_key IS 
'Ensures users can only have one active bid per offer, but allows new bids after rejection'; 