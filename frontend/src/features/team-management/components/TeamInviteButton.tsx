import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTeams } from '../hooks/useTeams';
import { Team } from '../types';
import { supabase } from '../../../supabaseClient';

interface TeamInviteButtonProps {
  resourceUserId: string;
  resourceName: string;
  onInviteSent?: () => void;
}

export function TeamInviteButton({ resourceUserId, resourceName, onInviteSent }: TeamInviteButtonProps) {
  const { user } = useAuth();
  const { getUserTeams, inviteToTeam, isLoading } = useTeams();
  const [ownedTeams, setOwnedTeams] = useState<Team[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [resourceEmail, setResourceEmail] = useState<string>('');

  useEffect(() => {
    const fetchOwnedTeams = async () => {
      if (user) {
        try {
          const teams = await getUserTeams();
          // Filter to only teams owned by current user
          const owned = teams.filter(team => team.owner_id === user.id);
          setOwnedTeams(owned);
        } catch (error) {
          console.error('Error fetching owned teams:', error);
          setOwnedTeams([]);
        }
      } else {
        setOwnedTeams([]);
      }
    };

    fetchOwnedTeams();
  }, [user?.id]);

  useEffect(() => {
    const fetchResourceEmail = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', resourceUserId)
          .single();

        if (error) throw error;
        setResourceEmail(data.username || '');
      } catch (error) {
        console.error('Error fetching resource email:', error);
        setResourceEmail('');
      }
    };

    if (resourceUserId) {
      fetchResourceEmail();
    }
  }, [resourceUserId]);

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setShowDropdown(false);
    setShowInviteModal(true);
  };

  const handleSendInvite = async () => {
    if (!selectedTeam || !user || !resourceEmail) return;

    try {
      await inviteToTeam(selectedTeam.id, resourceEmail);

      alert(`Invitation sent to ${resourceName} for team "${selectedTeam.name}"!`);
      setShowInviteModal(false);
      setSelectedTeam(null);
      setInviteMessage('');
      onInviteSent?.();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowInviteModal(false);
    setSelectedTeam(null);
    setInviteMessage('');
  };

  // Don't show button if user is trying to invite themselves
  if (!user || user.id === resourceUserId || ownedTeams.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Invite Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
        disabled={isLoading}
      >
        Invite to Team
      </button>

      {/* Team Selection Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select a team:
            </div>
            {ownedTeams.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 p-2">
                You don't own any teams yet.
              </div>
            ) : (
              <div className="space-y-1">
                {ownedTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => handleTeamSelect(team)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowDropdown(false)}
              className="w-full mt-2 px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invitation Modal */}
      {showInviteModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Invite to Team
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Invite <strong>{resourceName}</strong> to join <strong>{selectedTeam.name}</strong>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message (optional)
                </label>
                <textarea
                  rows={3}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Add a personal message to your invitation..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 