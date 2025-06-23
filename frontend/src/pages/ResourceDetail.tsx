import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import TeamInviteModal from '../components/TeamInviteModal';
import { TeamInviteButton } from '../features/team-management';

interface Resource {
  id: number;
  name: string;
  role: string;
  skills: string[];
  location: string;
  profile_id: string;
  work_history?: any[];
  projects?: any[];
  portfolio_urls?: string[];
}

interface Profile {
  hourly_rate?: number;
  availability?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  username?: string;
  full_name?: string;
  company_name?: string;
  website?: string;
}

interface TeamMembership {
  team_id: number;
  team_name: string;
  owner_name?: string;
}

interface TeamOwnership {
  team_id: number;
  team_name: string;
  member_count: number;
}

const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ownedTeams, setOwnedTeams] = useState<TeamOwnership[]>([]);
  const [memberTeams, setMemberTeams] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [userOwnedTeams, setUserOwnedTeams] = useState<TeamOwnership[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  // Check if current user owns this resource
  const isOwner = user && resource && user.id === resource.profile_id;

  useEffect(() => {
    const fetchResourceAndProfile = async () => {
      setLoading(true);
      setError(null);

      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .select(`
          *,
          profile:profiles (
            full_name,
            username,
            hourly_rate,
            availability,
            bio,
            linkedin_url,
            github_url,
            username,
            company_name,
            website
          )
        `)
        .eq('id', id)
        .single();

      if (resourceError) {
        setError('Resource not found.');
        setLoading(false);
        return;
      }
      
      setResource(resourceData);
      if (resourceData.profile) {
        setProfile(resourceData.profile);
      }

      // Fetch team information for this user
      if (resourceData.profile_id) {
        console.log('Fetching teams for user ID:', resourceData.profile_id);
        
        // Get teams where user is owner/manager
        const { data: ownedTeamsData, error: ownedTeamsError } = await supabase
          .from('teams')
          .select('id, name, owner_id')
          .eq('owner_id', resourceData.profile_id);
        
        console.log('Owned teams data:', ownedTeamsData, 'Error:', ownedTeamsError);
        if (!ownedTeamsError && ownedTeamsData) {
          // Get member counts for each team
          const teamsWithCounts = await Promise.all(
            ownedTeamsData.map(async (team: any) => {
              const { count } = await supabase
                .from('team_members')
                .select('*', { count: 'exact', head: true })
                .eq('team_id', team.id);
              
              return {
                team_id: team.id,
                team_name: team.name,
                member_count: count || 0
              };
            })
          );
          setOwnedTeams(teamsWithCounts);
        }

        // Get teams where user is member but not owner
        const { data: memberTeamsData, error: memberTeamsError } = await supabase
          .from('team_members')
          .select(`
            team_id,
            teams!inner(id, name, owner_id)
          `)
          .eq('user_id', resourceData.profile_id)
          .neq('teams.owner_id', resourceData.profile_id);
        
        console.log('Member teams data:', memberTeamsData, 'Error:', memberTeamsError);
        if (!memberTeamsError && memberTeamsData) {
          // Get owner names for each team
          const teamsWithOwners = await Promise.all(
            memberTeamsData.map(async (membership: any) => {
              const { data: ownerData } = await supabase
                .from('profiles')
                .select('full_name, username')
                .eq('id', membership.teams.owner_id)
                .single();
              
              return {
                team_id: membership.teams.id,
                team_name: membership.teams.name,
                owner_name: ownerData?.full_name || ownerData?.username || 'Unknown'
              };
            })
          );
          setMemberTeams(teamsWithOwners);
        }
      }

      // Fetch current user's owned teams (for invitation functionality)
      if (user) {
        console.log('Fetching teams for current user ID:', user.id);
        const { data: userOwnedTeamsData, error: userOwnedTeamsError } = await supabase
          .from('teams')
          .select('id, name, owner_id')
          .eq('owner_id', user.id);
        
        console.log('Current user owned teams data:', userOwnedTeamsData, 'Error:', userOwnedTeamsError);
        if (!userOwnedTeamsError && userOwnedTeamsData) {
          // Get member counts for each team
          const teamsWithCounts = await Promise.all(
            userOwnedTeamsData.map(async (team: any) => {
              const { count } = await supabase
                .from('team_members')
                .select('*', { count: 'exact', head: true })
                .eq('team_id', team.id);
              
              return {
                team_id: team.id,
                team_name: team.name,
                member_count: count || 0
              };
            })
          );
          console.log('Teams with counts:', teamsWithCounts);
          setUserOwnedTeams(teamsWithCounts);
        }
      }

      setLoading(false);
    };
    if (id) {
      fetchResourceAndProfile().catch(err => {
        console.error('Error in fetchResourceAndProfile:', err);
        setError('Failed to load resource details.');
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    const fetchInvites = async () => {
      if (user && resource && user.id === resource.profile_id) {
        try {
          const { data, error } = await supabase
            .from('team_invitations')
            .select('id, team_id, team:teams(name)')
            .eq('invitee_email', user.email)
            .eq('status', 'pending');
          
          if (error) {
            console.error('Error fetching invites:', error);
          } else {
            setPendingInvites(data || []);
          }
        } catch (err) {
          console.error('Error fetching invites:', err);
        }
      }
    };
    fetchInvites();
  }, [user, resource]);

  const handleInviteToTeam = () => {
    setInviteModalOpen(true);
  };

  const handleAcceptInvite = async (inviteId: string) => {
    const { error } = await supabase.rpc('accept_team_invitation', { p_invitation_id: inviteId });
    if (!error) {
      setPendingInvites(pendingInvites.filter(inv => inv.id !== inviteId));
      // Optionally refresh teams here
    } else {
      alert('Failed to accept invitation');
    }
  };

  // Debug logging (commented out to prevent console spam)
  // console.log('ResourceDetail render - user:', user?.id, 'userOwnedTeams:', userOwnedTeams.length, 'isOwner:', isOwner);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <Link to="/resources" className="text-indigo-600 dark:text-indigo-300 hover:underline mb-4 inline-block">&larr; Back to Browse</Link>
        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : resource ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{profile?.full_name || profile?.username || resource.name}</h1>
                {profile?.username && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <span className="font-medium">Email:</span> {profile.username}
                  </div>
                )}
                <p className="text-lg text-gray-600 dark:text-gray-300">{resource.role}</p>
              </div>
              {isOwner ? (
                <Link to="/profile/edit">
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </Link>
              ) : user ? (
                <div className="flex gap-2">
                  <TeamInviteButton 
                    resourceUserId={resource.profile_id}
                    resourceName={resource.name}
                  />
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {resource.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div className="text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Location:</span> {resource.location}
                </div>
                {profile?.hourly_rate && (
                  <div className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Rate:</span> ${profile.hourly_rate}/hr
                  </div>
                )}
                {profile?.availability && (
                  <div className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Availability:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      profile.availability === 'available' 
                        ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100'
                        : profile.availability === 'on-request'
                        ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100'
                        : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'
                    }`}>
                      {profile.availability}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {profile?.company_name && (
                  <div className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Company:</span> {profile.company_name}
                  </div>
                )}
                {profile?.website && (
                  <div className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Website:</span> 
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Team Information */}
            {(ownedTeams.length > 0 || memberTeams.length > 0) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Team Affiliations</h3>
                
                {/* Teams as Manager */}
                {ownedTeams.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">Manager of:</h4>
                    <div className="space-y-2">
                      {ownedTeams.map((team) => (
                        <Link key={team.team_id} to={`/teams/${team.team_id}`}>
                          <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{team.team_name}</span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teams as Member */}
                {memberTeams.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">Member of:</h4>
                    <div className="space-y-2">
                      {memberTeams.map((team) => (
                        <Link key={team.team_id} to={`/teams/${team.team_id}`}>
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{team.team_name}</span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Led by {team.owner_name}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Work History */}
            {resource.work_history && resource.work_history.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Work Experience</h3>
                <div className="space-y-3">
                  {resource.work_history.map((job: any, index: number) => (
                    <div key={index} className="border-l-2 border-indigo-200 dark:border-indigo-800 pl-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{job.title}</h4>
                      <p className="text-indigo-600 dark:text-indigo-400">{job.company}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{job.dates}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resource.projects && resource.projects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Projects</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {resource.projects.map((project: any, index: number) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{project.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{project.description}</p>
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Links */}
            {(profile?.linkedin_url || profile?.github_url || (resource.portfolio_urls && resource.portfolio_urls.length > 0)) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Links</h3>
                <div className="flex flex-wrap gap-3">
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors">
                      LinkedIn
                    </a>
                  )}
                  {profile?.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      GitHub
                    </a>
                  )}
                  {resource.portfolio_urls && resource.portfolio_urls.map((url: string, index: number) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-100 rounded-lg text-sm font-medium hover:bg-indigo-200 dark:hover:bg-indigo-700 transition-colors">
                      Portfolio
                    </a>
                  ))}
                </div>
              </div>
            )}

            {isOwner && pendingInvites.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Pending Team Invitations</h3>
                {pendingInvites.map(invite => (
                  <div key={invite.id} className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mb-2">
                    <span>{invite.team.name}</span>
                    <Button onClick={() => handleAcceptInvite(invite.id)}>Accept Invitation</Button>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-400 dark:text-gray-500 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              Resource ID: {resource.id}
            </div>
          </div>
        ) : null}
      </div>

      {/* Team Invitation Modal */}
      {inviteModalOpen && (
        <TeamInviteModal
          isOpen={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false);
          }}
          userTeams={userOwnedTeams}
        />
      )}
    </div>
  );
};

export default ResourceDetail; 