import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

interface UserTeam {
  id: number;
  name: string;
  owner_id: string;
}

export function useUserTeams() {
  const [teams, setTeams] = useState<UserTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserTeams();
  }, []);

  const fetchUserTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTeams([]);
        return;
      }

      // Get user's teams by joining with team_members
      const { data: userTeams, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          teams:team_id (
            id,
            name,
            owner_id
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Extract team data and format it
      const formattedTeams = userTeams?.map((membership: any) => ({
        id: membership.teams.id,
        name: membership.teams.name,
        owner_id: membership.teams.owner_id
      })) || [];

      setTeams(formattedTeams);
    } catch (err) {
      console.error('Error fetching user teams:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    teams,
    isLoading,
    error,
    refetch: fetchUserTeams
  };
} 