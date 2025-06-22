import { useState } from 'react';
import { supabase } from '../../../supabaseClient';

interface Bid {
  id: number;
  offer_id: number;
  bidder_id: string;
  proposal: string;
  proposed_budget?: number;
  proposed_timeline?: string;
  why_choose_us?: string;
  status: string;
  created_at: string;
}

interface BidResponse {
  bid_id: number;
  new_status: 'accepted' | 'rejected';
  response_comment?: string;
}

interface CreateBidData {
  offer_id: number;
  proposal: string;
  proposed_budget?: number;
  proposed_timeline?: string;
  why_choose_us?: string;
  is_counter_bid?: boolean;
}

export function useBids() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBid = async (data: CreateBidData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to submit a bid');
      }

      // Check if user is trying to bid on their own offer
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .select('created_by')
        .eq('id', data.offer_id)
        .single();

      if (offerError) {
        console.error('Error fetching offer:', offerError);
        throw new Error('Could not verify offer details');
      }

      if (offer.created_by === user.id && !data.is_counter_bid) {
        throw new Error('You cannot bid on your own offer');
      }

      const { data: bid, error } = await supabase
        .from('bids')
        .insert({
          offer_id: data.offer_id,
          bidder_id: user.id,
          proposal: data.proposal,
          proposed_budget: data.proposed_budget || null,
          proposed_timeline: data.proposed_timeline || null,
          why_choose_us: data.why_choose_us || null
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return bid;
    } catch (err) {
      console.error('Create bid error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bid';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addBidResponse = async (response: BidResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to respond to a bid');
      }

      const { data, error } = await supabase
        .from('bid_responses')
        .insert({
          bid_id: response.bid_id,
          responder_id: user.id,
          new_status: response.new_status,
          response_comment: response.response_comment
        })
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add bid response';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBidsForOffer = async (offerId: number): Promise<Bid[]> => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Failed to fetch bids:', err);
      return [];
    }
  };

  const updateBidStatus = async (bidId: number, status: 'accepted' | 'rejected') => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: bid, error } = await supabase
        .from('bids')
        .update({ status })
        .eq('id', bidId)
        .select()
        .single();

      if (error) throw error;

      return bid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bid status';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBid,
    fetchBidsForOffer,
    updateBidStatus,
    addBidResponse,
    isLoading,
    error
  };
} 