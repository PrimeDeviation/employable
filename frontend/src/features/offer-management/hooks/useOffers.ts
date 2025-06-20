import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

interface Offer {
  id: number;
  title: string;
  description: string;
  offer_type: 'client_offer' | 'team_offer';
  budget_min?: number;
  budget_max?: number;
  budget_type?: string;
  status: string;
  visibility: string;
  created_at: string;
  created_by: string;
  location_preference?: string;
}

export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async (filters?: {
    offer_type?: 'client_offer' | 'team_offer' | 'all';
    limit?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('offers')
        .select('*')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (filters?.offer_type && filters.offer_type !== 'all') {
        query = query.eq('offer_type', filters.offer_type);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      setOffers(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch offers';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return {
    offers,
    isLoading,
    error,
    refetch: fetchOffers
  };
} 