import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { TeamEditModal } from '../features/team-management/components/TeamEditModal';
import { Team } from '../features/team-management/types';
import { useTeamInvitations } from '../features/team-management/hooks/useTeamInvitations';

export default function TeamPage() {
  const { user, loading: authLoading } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { invitations, acceptInvitation, declineInvitation, isLoading: invitationsLoading } = useTeamInvitations();

  useEffect(() => {
    const fetchTeams = async () => {
      if (!authLoading && user) {
        setLoading(true);
        // Fetch teams where the user is a member (RLS policy will handle access)
        const { data, error } = await supabase
          .from('teams')
          .select(`
            *,
            team_members!inner (user_id)
          `)
          .eq('team_members.user_id', user.id);
        
        if (error) {
          console.error('Error fetching teams:', error);
        } else {
          setTeams(data || []);
        }
        setLoading(false);
      } else if (!authLoading && !user) {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [user, authLoading]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !user) return;
    
    const { data, error } = await supabase.rpc('create_team', { name: newTeamName });

    if (error) {
      alert('Error creating team');
      console.error(error);
    } else {
      alert('Team created successfully!');
      setNewTeamName('');
      // Refresh the list of teams by re-fetching with proper membership filtering
      const { data: newTeamList } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!inner (user_id)
        `)
        .eq('team_members.user_id', user.id);
      setTeams(newTeamList || []);
    }
  };

  const handleTeamUpdated = (updatedTeam: Team) => {
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === updatedTeam.id ? updatedTeam : team
      )
    );
    setEditingTeam(null);
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      // Refresh teams list
      const { data: newTeamList } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!inner (user_id)
        `)
        .eq('team_members.user_id', user!.id);
      setTeams(newTeamList || []);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      alert('Failed to accept invitation. Please try again.');
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await declineInvitation(invitationId);
    } catch (error) {
      console.error('Failed to decline invitation:', error);
      alert('Failed to decline invitation. Please try again.');
    }
  };

  const formatRate = (team: Team) => {
    if (team.hourly_rate_min && team.hourly_rate_max) {
      return `$${team.hourly_rate_min} - $${team.hourly_rate_max}/hr`;
    } else if (team.hourly_rate_min) {
      return `From $${team.hourly_rate_min}/hr`;
    } else if (team.hourly_rate_max) {
      return `Up to $${team.hourly_rate_max}/hr`;
    }
    return 'Rate not set';
  };

  const getAvailabilityColor = (availability?: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return <div>Loading teams...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Your Teams</h1>
      
      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Pending Team Invitations ({invitations.length})
          </h2>
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      Invitation to join "{invitation.teams.name}"
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      From: {invitation.profiles.full_name || invitation.profiles.username}
                    </p>
                    {invitation.message && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                        "{invitation.message}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Received: {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleAcceptInvitation(invitation.id)}
                      disabled={invitationsLoading}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvitation(invitation.id)}
                      disabled={invitationsLoading}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <form onSubmit={handleCreateTeam} className="flex gap-4">
          <input
            type="text"
            placeholder="New team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
          />
          <Button type="submit" disabled={!newTeamName.trim()}>Create Team</Button>
        </form>
      </div>

      <div className="space-y-4">
        {teams.length > 0 ? (
          teams.map(team => (
            <div key={team.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{team.name}</h3>
                    {team.availability && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(team.availability)}`}>
                        {team.availability}
                      </span>
                    )}
                    {team.public_profile && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                  
                  {team.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{team.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {team.location && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {team.location}
                        {team.remote_work && <span className="text-green-600 dark:text-green-400">• Remote OK</span>}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {formatRate(team)}
                    </div>
                  </div>

                  {team.skills && team.skills.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {team.skills.slice(0, 6).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {team.skills.length > 6 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            +{team.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {user?.id === team.owner_id && (
                    <button
                      onClick={() => setEditingTeam(team)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">You are not a member of any teams. Create one to get started!</p>
        )}
      </div>

      {/* Team Edit Modal */}
      {editingTeam && (
        <TeamEditModal
          isOpen={!!editingTeam}
          onClose={() => setEditingTeam(null)}
          team={editingTeam}
          onTeamUpdated={handleTeamUpdated}
        />
      )}
    </div>
  );
} 