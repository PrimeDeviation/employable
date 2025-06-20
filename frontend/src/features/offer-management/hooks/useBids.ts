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

interface CreateBidData {
  offer_id: number;
  proposal: string;
  proposed_budget?: number;
  proposed_timeline?: string;
  why_choose_us?: string;
}

export function useBids() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBid = async (data: CreateBidData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: bid, error } = await supabase
        .from('bids')
        .insert({
          offer_id: data.offer_id,
          proposal: data.proposal,
          proposed_budget: data.proposed_budget || null,
          proposed_timeline: data.proposed_timeline || null,
          why_choose_us: data.why_choose_us || null
        })
        .select()
        .single();

      if (error) throw error;

      return bid;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bid';
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

  return {
    createBid,
    fetchBidsForOffer,
    isLoading,
    error
  };
} 