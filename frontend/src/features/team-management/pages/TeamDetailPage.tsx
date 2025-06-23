import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTeams } from '../hooks/useTeams';
import { TeamWithMembers } from '../types';
import { TeamEditModal } from '../components/TeamEditModal';

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getTeamById, isLoading, error } = useTeams();
  const [team, setTeam] = useState<TeamWithMembers | null>(null);
  const [editingTeam, setEditingTeam] = useState<TeamWithMembers | null>(null);

  useEffect(() => {
    const loadTeam = async () => {
      if (id) {
        try {
          const teamData = await getTeamById(parseInt(id));
          setTeam(teamData);
        } catch (err) {
          console.error('Failed to load team:', err);
        }
      }
    };

    loadTeam();
  }, [id]); // Only depend on id, not the function

  const handleTeamUpdated = (updatedTeam: any) => {
    // Reload the team data to get the updated information with members
    if (id) {
      getTeamById(parseInt(id)).then(setTeam).catch(err => {
        console.error('Failed to reload team after update:', err);
      });
    }
    setEditingTeam(null);
  };

  const formatRate = (team: TeamWithMembers) => {
    if (team.hourly_rate_min && team.hourly_rate_max) {
      return `$${team.hourly_rate_min} - $${team.hourly_rate_max}/hr`;
    } else if (team.hourly_rate_min) {
      return `From $${team.hourly_rate_min}/hr`;
    } else if (team.hourly_rate_max) {
      return `Up to $${team.hourly_rate_max}/hr`;
    }
    return 'Rate negotiable';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Team Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The team you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link
              to="/teams/browse"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/teams/browse"
            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Browse Teams
          </Link>
        </div>

        {/* Team Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{team.name}</h1>
                {team.availability && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(team.availability)}`}>
                    {team.availability}
                  </span>
                )}
                {team.public_profile && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                    Public Profile
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-400">
                <div>
                  <p className="mb-2">
                    <span className="font-medium">Team Size:</span> {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                  </p>
                  {team.team_size && (
                    <p className="mb-2">
                      <span className="font-medium">Target Size:</span> {team.team_size} members
                    </p>
                  )}
                  {team.location && (
                    <p className="mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">Location:</span> {team.location}
                      {team.remote_work && <span className="text-green-600 dark:text-green-400">• Remote OK</span>}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-2">
                    <span className="font-medium">Rate:</span> {formatRate(team)}
                  </p>
                  {team.website && (
                    <p className="mb-2">
                      <span className="font-medium">Website:</span> 
                      <a 
                        href={team.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {team.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {user?.id === team.owner_id && (
                <button
                  onClick={() => setEditingTeam(team)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Team
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {team.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">About</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{team.description}</p>
            </div>
          )}

          {/* Skills */}
          {team.skills && team.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {team.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Team Members */}
        {team.team_members && team.team_members.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Team Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.team_members.map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                     <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                     {member.profiles?.full_name?.[0] || member.profiles?.username?.[0] || '?'}
                   </div>
                   <div>
                     <p className="font-medium text-gray-900 dark:text-gray-100">
                       {member.profiles?.full_name || member.profiles?.username || 'Unknown'}
                     </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {member.user_id === team.owner_id ? 'Team Owner' : 'Member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
    </div>
  );
} 