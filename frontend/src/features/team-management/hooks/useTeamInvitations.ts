import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';

export interface TeamInvitation {
  id: string;
  team_id: number;
  inviter_id: string;
  invitee_email: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  expires_at: string;
  teams: {
    id: number;
    name: string;
  };
  profiles: {
    id: string;
    full_name?: string;
    username?: string;
  };
}

export function useTeamInvitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingInvitations = async () => {
    if (!user) {
      setInvitations([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current user's email
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user?.email) {
        throw new Error('User email not found');
      }

      // Use the existing database function that handles RLS properly
      const { data: invitationsData, error: invitationsError } = await supabase
        .rpc('get_user_invitations');

      if (invitationsError) throw invitationsError;

      if (!invitationsData || invitationsData.length === 0) {
        setInvitations([]);
        return;
      }

      // Transform the data to match our interface
      const transformedInvitations = invitationsData.map((invitation: any) => ({
        id: invitation.id,
        team_id: invitation.team_id,
        inviter_id: '', // Not provided by the function
        invitee_email: authUser.user.email,
        status: 'pending',
        created_at: invitation.created_at,
        expires_at: invitation.expires_at,
        teams: {
          id: invitation.team_id,
          name: invitation.team_name
        },
        profiles: {
          id: '', // Not provided by the function
          full_name: invitation.inviter_name,
          username: invitation.inviter_name
        }
      }));

      setInvitations(transformedInvitations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invitations';
      setError(errorMessage);
      console.error('Error fetching invitations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvitation = async (invitationId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('accept_team_invitation', {
        p_invitation_id: invitationId
      });

      if (error) throw error;

      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const declineInvitation = async (invitationId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('decline_team_invitation', {
        p_invitation_id: invitationId
      });

      if (error) throw error;

      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decline invitation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInvitations();
  }, [user?.id]);

  return {
    invitations,
    pendingCount: invitations.length,
    isLoading,
    error,
    fetchPendingInvitations,
    acceptInvitation,
    declineInvitation,
  };
} 