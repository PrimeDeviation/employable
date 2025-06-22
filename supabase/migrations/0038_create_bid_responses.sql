CREATE TABLE IF NOT EXISTS public.bid_responses (
  id SERIAL PRIMARY KEY,
  bid_id INTEGER REFERENCES public.bids(id) ON DELETE CASCADE NOT NULL,
  responder_id UUID REFERENCES auth.users NOT NULL,
  new_status TEXT NOT NULL CHECK (new_status IN ('accepted', 'rejected')),
  response_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT fk_bid
    FOREIGN KEY(bid_id) 
    REFERENCES bids(id),
  CONSTRAINT fk_responder
    FOREIGN KEY(responder_id) 
    REFERENCES auth.users(id)
);

ALTER TABLE public.bid_responses ENABLE ROW LEVEL SECURITY;

-- Responders can see their own responses
CREATE POLICY "Responders can see their own responses"
ON public.bid_responses FOR SELECT
USING (auth.uid() = responder_id);

-- Offer owners can see responses on their bids
CREATE POLICY "Offer owners can see responses on their bids"
ON public.bid_responses FOR SELECT
USING (
  bid_id IN (
    SELECT b.id
    FROM bids b
    JOIN offers o ON b.offer_id = o.id
    WHERE o.created_by = auth.uid()
  )
);

-- Bidders can see responses to their bids
CREATE POLICY "Bidders can see responses to their bids"
ON public.bid_responses FOR SELECT
USING (
  bid_id IN (
    SELECT id
    FROM bids
    WHERE bidder_id = auth.uid()
  )
);

-- Responders can create responses
CREATE POLICY "Responders can create responses"
ON public.bid_responses FOR INSERT
WITH CHECK (
  auth.uid() = responder_id
);

-- A user must either be the offer creator or the bidder to respond
-- (This check logic is complex for a policy, better handled in an RPC)

-- Fix the bids UPDATE policy to allow offer creators to update bid status
DROP POLICY IF EXISTS "Users can update their own bids" ON public.bids;
CREATE POLICY "Users can update bids"
ON public.bids FOR UPDATE
USING (
  auth.uid() = bidder_id OR 
  offer_id IN (SELECT id FROM public.offers WHERE created_by = auth.uid())
);
