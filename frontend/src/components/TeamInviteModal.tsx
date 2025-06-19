import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Button } from './ui/button';

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTeams: Array<{ team_id: number; team_name: string; member_count: number }>;
}

const TeamInviteModal: React.FC<TeamInviteModalProps> = ({
  isOpen,
  onClose,
  userTeams,
}) => {
  const [email, setEmail] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill email if resourceEmail is provided
  React.useEffect(() => {
    if (userTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(userTeams[0].team_id);
    }
  }, [userTeams, selectedTeamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('create_team_invitation', {
        p_team_id: selectedTeamId,
        p_invitee_email: email.trim()
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setEmail('');
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setError('Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Invite to Team
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-green-600 dark:text-green-400 mb-2">
              ✓ Invitation sent successfully!
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              An invitation has been sent to {email}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Invite someone to join your team <strong>{userTeams.find(t => t.team_id === selectedTeamId)?.team_name}</strong>
              </p>
              
              <label htmlFor="team" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Team
              </label>
              <select
                id="team"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value as number | '')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                required
              >
                <option value="">Select a team</option>
                {userTeams.map(team => (
                  <option key={team.team_id} value={team.team_id}>{team.team_name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !email.trim() || !selectedTeamId}
                className="flex-1"
              >
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TeamInviteModal; 