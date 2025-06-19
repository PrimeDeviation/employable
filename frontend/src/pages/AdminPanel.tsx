import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

interface User {
  id: string;
  email?: string;
  username?: string;
  full_name?: string;
  role: string;
}

interface Team {
  id: number;
  name: string;
  owner_id: string;
  created_at: string;
  owner_profile?: {
    username?: string;
    full_name?: string;
  };
  member_count?: number;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchUsers();
      fetchTeams();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;
    
    const { data, error } = await supabase.rpc('get_user_role');
    if (!error && data) {
      setUserRole(data);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, role')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
  };

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        owner_profile:profiles!teams_owner_id_fkey (username, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching teams:', error);
    } else {
      // Get member counts for each team
      const teamsWithCounts = await Promise.all(
        (data || []).map(async (team) => {
          const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id);
          
          return { ...team, member_count: count || 0 };
        })
      );
      setTeams(teamsWithCounts);
    }
    setLoading(false);
  };

  const promoteToAdmin = async (userId: string) => {
    setPromoting(true);
    
    const { data, error } = await supabase.rpc('promote_to_admin', {
      target_user_id: userId
    });

    if (error) {
      console.error('Error promoting user:', error);
      alert('Error promoting user to admin. You might not have permission.');
    } else if (data) {
      alert('User promoted to admin successfully!');
      fetchUsers();
      if (userId === user?.id) {
        fetchUserRole();
      }
    } else {
      alert('Failed to promote user. You might not have permission.');
    }
    
    setPromoting(false);
  };

  const assignTeamOwnership = async (teamId: number, newOwnerId: string) => {
    const { data, error } = await supabase.rpc('assign_team_ownership', {
      team_id: teamId,
      new_owner_id: newOwnerId
    });

    if (error) {
      console.error('Error assigning team ownership:', error);
      alert('Error assigning team ownership.');
    } else if (data) {
      alert('Team ownership assigned successfully!');
      fetchTeams();
    } else {
      alert('Failed to assign team ownership. You might not have permission.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200';
      case 'moderator':
        return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage users, teams, and system permissions
        </p>
                 <div className="mt-4">
           <span className="text-sm text-gray-500 dark:text-gray-400">Your role: </span>
           <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
             {userRole}
           </span>
           <div className="mt-2 text-xs text-gray-400">
             Database: Cloud (kvtqkvifglyytdsvsyzo.supabase.co) • Users: {users.length} • Teams: {teams.length}
             <br />
             Your User ID: {user?.id?.substring(0, 8)}...
           </div>
           <div className="mt-1 text-xs text-gray-400">
             Your User ID: {user?.id ? `${user.id.substring(0, 8)}...` : 'Not logged in'}
           </div>
         </div>
      </div>

      {/* Admin Actions */}
      {userRole !== 'admin' && (
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
          <p>Admin privileges required to view management panels.</p>
        </div>
      )}

      {userRole === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Users Management
            </h2>
            
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {user.full_name || user.username || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.id.substring(0, 8)}...
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    {user.role !== 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => promoteToAdmin(user.id)}
                        disabled={promoting}
                      >
                        Make Admin
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teams Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Teams Management
              </h2>
            </div>
            
            <div className="space-y-3">
              {teams.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No teams found.</p>
              ) : (
                teams.map(team => (
                  <div key={team.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {team.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Owner: {team.owner_profile?.full_name || team.owner_profile?.username || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {team.member_count} members • Created {new Date(team.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            assignTeamOwnership(team.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="">Reassign owner...</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.full_name || user.username || 'Unknown User'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 