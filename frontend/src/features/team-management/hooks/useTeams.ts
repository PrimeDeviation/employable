import { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { Team, TeamWithMembers, TeamFilters, CreateTeamData, UpdateTeamData } from '../types';

export function useTeams() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const browseTeams = async (filters: TeamFilters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('teams')
        .select(`
          *,
          team_members (
            user_id,
            profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('public_profile', true);

      // Apply filters
      if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps('skills', filters.skills);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.availability) {
        query = query.eq('availability', filters.availability);
      }

      if (filters.remote_work !== undefined) {
        query = query.eq('remote_work', filters.remote_work);
      }

      if (filters.hourly_rate_min) {
        query = query.gte('hourly_rate_min', filters.hourly_rate_min);
      }

      if (filters.hourly_rate_max) {
        query = query.lte('hourly_rate_max', filters.hourly_rate_max);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform data to include computed fields
      const teams: TeamWithMembers[] = (data || []).map(team => ({
        ...team,
        member_count: team.team_members?.length || 0,
        is_owner: false, // Will be set by client if user is logged in
        is_member: false, // Will be set by client if user is logged in
      }));

      return teams;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to browse teams';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTeamById = async (teamId: number): Promise<TeamWithMembers | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (
            user_id,
            profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;

      if (!data) return null;

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      const team: TeamWithMembers = {
        ...data,
        member_count: data.team_members?.length || 0,
        is_owner: currentUserId === data.owner_id,
        is_member: data.team_members?.some((member: any) => member.user_id === currentUserId) || false,
      };

      return team;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTeams = async (): Promise<TeamWithMembers[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!inner (
            user_id
          )
        `)
        .eq('team_members.user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const teams: TeamWithMembers[] = (data || []).map(team => ({
        ...team,
        member_count: team.team_members?.length || 0,
        is_owner: user.id === team.owner_id,
        is_member: true,
      }));

      return teams;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user teams';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createTeam = async (teamData: CreateTeamData): Promise<Team> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .insert({
          ...teamData,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the owner as a team member
      await supabase
        .from('team_members')
        .insert({
          team_id: data.id,
          user_id: user.id,
        });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTeam = async (teamData: UpdateTeamData): Promise<Team> => {
    setIsLoading(true);
    setError(null);

    try {
      const { id, ...updateFields } = teamData;
      
      const { data, error } = await supabase
        .from('teams')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update team';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeam = async (teamId: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete team';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const inviteToTeam = async (teamId: number, email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.rpc('create_team_invitation', {
        p_team_id: teamId,
        p_invitee_email: email.trim()
      });

      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeTeamMember = async (teamId: number, userId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove team member';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };



  return {
    browseTeams,
    getTeamById,
    getUserTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteToTeam,
    removeTeamMember,
    isLoading,
    error,
  };
} 