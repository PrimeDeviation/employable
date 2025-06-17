import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

interface Team {
  id: number;
  name: string;
  owner_id: string;
}

const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return;
      setLoading(true);
      // RLS policy will filter to only show teams the user is a member of.
      const { data, error } = await supabase
        .from('teams')
        .select('*');
      
      if (error) {
        console.error('Error fetching teams:', error);
      } else {
        setTeams(data || []);
      }
      setLoading(false);
    };

    fetchTeams();
  }, [user]);

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
      // Refresh the list of teams by re-fetching
      const { data: newTeamList } = await supabase
        .from('teams')
        .select('*');
      setTeams(newTeamList || []);
    }
  };

  if (loading) {
    return <div>Loading teams...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Your Teams</h1>
      
      <div className="mb-8">
        <form onSubmit={handleCreateTeam} className="flex gap-4">
          <input
            type="text"
            placeholder="New team name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
          <Button type="submit" disabled={!newTeamName.trim()}>Create Team</Button>
        </form>
      </div>

      <div className="space-y-4">
        {teams.length > 0 ? (
          teams.map(team => (
            <div key={team.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 flex justify-between items-center">
              <span className="font-semibold">{team.name}</span>
              {/* Future actions like 'Manage' or 'Delete' can go here */}
            </div>
          ))
        ) : (
          <p>You are not a member of any teams. Create one to get started!</p>
        )}
      </div>
    </div>
  );
};

export default TeamPage; 