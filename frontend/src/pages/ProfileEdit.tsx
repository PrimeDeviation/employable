import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext'; // Assuming you have an AuthContext to get the user
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProfileEdit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [resource, setResource] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [ownedTeams, setOwnedTeams] = useState<any[]>([]);
  const [memberTeams, setMemberTeams] = useState<any[]>([]);

  useEffect(() => {
    const getProfileAndResource = async () => {
      if (!user) return;
      setLoading(true);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, bio, github_url, linkedin_url') // Ensure new fields are selected
        .eq('id', user.id)
        .single();
      
      if (profileError) console.error('Error fetching profile', profileError);
      else if (profileData) setProfile(profileData);

      // Fetch resource data
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .select('*, skills, work_history, projects, portfolio_urls') // Ensure new fields are selected
        .eq('profile_id', user.id)
        .single();

      if (resourceError) console.error('Error fetching resource', resourceError);
      else if (resourceData) setResource(resourceData);

      // Fetch team information
      if (user) {
        console.log('ProfileEdit: Fetching teams for user ID:', user.id);
        
        // Get teams where user is owner/manager
        const { data: ownedTeamsData, error: ownedTeamsError } = await supabase
          .from('teams')
          .select('id, name, owner_id')
          .eq('owner_id', user.id);
        
        console.log('ProfileEdit: Owned teams data:', ownedTeamsData, 'Error:', ownedTeamsError);
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
          .eq('user_id', user.id)
          .neq('teams.owner_id', user.id);
        
        console.log('ProfileEdit: Member teams data:', memberTeamsData, 'Error:', memberTeamsError);
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

      setLoading(false);
    };
    getProfileAndResource();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    // Update profile
    const profileUpdates = {
      id: user.id,
      ...profile,
      updated_at: new Date(),
    };
    const { error: profileError } = await supabase.from('profiles').upsert(profileUpdates);
    if (profileError) {
      alert('Error updating profile data!');
      console.error(profileError);
    }

    // Update resource - always perform upsert to handle new users
    const resourceUpdates = {
      profile_id: user.id, // Required for RLS policy
      name: profile.username || profile.full_name || user.email, // Keep name in sync with profile
      role: resource.role || 'Consultant',
      location: resource.location || 'Remote',
      skills: resource.skills || [],
      ...resource
    };
    const { error: resourceError } = await supabase.from('resources').upsert(resourceUpdates);
    if (resourceError) {
      alert('Error updating resource data!');
      console.error(resourceError);
    }

    if (!profileError && !resourceError) {
      alert('Profile updated successfully!');
      navigate('/account');
    }
    setSaving(false);
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResource((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const skillsArray = value.split(',').map(skill => skill.trim());
    setResource((prev: any) => ({ ...prev, skills: skillsArray }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        setResumeText(text as string);
      };
      reader.readAsText(file);
    }
  };

  const handleParseResume = async () => {
    // @ts-ignore
    if (!window.mcp || !window.mcp.ai.ask) {
      alert('MCP client not detected. Please connect a compatible AI client like Cursor or Claude to use this feature.');
      return;
    }
    if (!resumeText) {
      alert('Please upload a resume file first.');
      return;
    }
    setIsParsing(true);

    const prompt = `
      You are an expert resume parser. Analyze the following resume text and extract the user's information into a valid JSON object.
      The JSON object should have the following keys: "role", "skills", "bio", "work_history", "projects", "linkedin_url", "github_url", "portfolio_urls".
      - "role" should be the user's most recent or primary job title.
      - "skills" should be an array of strings, listing the key technical skills and technologies.
      - "bio" should be a 2-3 sentence professional summary based on the resume's content.
      - "work_history" should be an array of objects, where each object represents a job and has "company", "title", and "dates" (e.g., "Jan 2020 - Present") keys.
      - "projects" should be an array of objects, where each object has "name", "description", and "url".
      - "linkedin_url" should be the user's LinkedIn profile URL as a string, if present.
      - "github_url" should be the user's GitHub profile URL as a string, if present.
      - "portfolio_urls" should be an array of strings for other relevant URLs like a personal website.

      Do not include any other text or explanation in your response, only the JSON object.
    `;

    try {
      // @ts-ignore
      const response = await window.mcp.ai.ask(prompt, { text: resumeText });
      
      // It's crucial to validate and sanitize the response from the LLM
      const parsedData = JSON.parse(response);

      if (parsedData.role && typeof parsedData.role === 'string') {
        setResource((prev: any) => ({ ...prev, role: parsedData.role }));
      }
      if (parsedData.skills && Array.isArray(parsedData.skills)) {
        setResource((prev: any) => ({ ...prev, skills: parsedData.skills }));
      }
      if (parsedData.bio && typeof parsedData.bio === 'string') {
        setProfile((prev: any) => ({ ...prev, bio: parsedData.bio }));
      }
      if (parsedData.work_history && Array.isArray(parsedData.work_history)) {
        setResource((prev: any) => ({ ...prev, work_history: parsedData.work_history }));
      }
      if (parsedData.projects && Array.isArray(parsedData.projects)) {
        setResource((prev: any) => ({ ...prev, projects: parsedData.projects }));
      }
      if (parsedData.linkedin_url && typeof parsedData.linkedin_url === 'string') {
        setProfile((prev: any) => ({ ...prev, linkedin_url: parsedData.linkedin_url }));
      }
      if (parsedData.github_url && typeof parsedData.github_url === 'string') {
        setProfile((prev: any) => ({ ...prev, github_url: parsedData.github_url }));
      }
      if (parsedData.portfolio_urls && Array.isArray(parsedData.portfolio_urls)) {
        setResource((prev: any) => ({ ...prev, portfolio_urls: parsedData.portfolio_urls }));
      }

      alert('Resume parsed successfully! Please review the updated fields.');

    } catch (error) {
      console.error('Error parsing resume with MCP client:', error);
      alert('An error occurred while parsing the resume. The AI may have returned an invalid format. Please check the console.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleAiAddProject = async () => {
    // @ts-ignore
    if (!window.mcp || !window.mcp.ai.ask) {
      alert('MCP client not detected. Please connect a compatible AI client like Cursor or Claude to use this feature.');
      return;
    }

    const prompt = `
      You are an expert project analyst. The user wants to add a new project to their profile. 
      Please interact with the user to get information about one of their projects (e.g., from a GitHub URL or a local directory they specify).
      
      Once you have the context, analyze the project and return a single, valid JSON object with the following keys: "name", "description", and "url".
      - "name": The project's title.
      - "description": A concise 1-2 sentence summary of the project.
      - "url": A relevant URL for the project (e.g., GitHub repository, live demo).

      Do not include any other text or explanation in your response, only the JSON object.
    `;

    try {
      // @ts-ignore
      const response = await window.mcp.ai.ask(prompt);
      const newProject = JSON.parse(response);

      // Basic validation
      if (newProject.name && newProject.description && newProject.url) {
        setResource((prev: any) => ({
          ...prev,
          projects: [...(prev.projects || []), newProject],
        }));
        alert('Project added! Please review and save your profile.');
      } else {
        alert('The AI returned an invalid project format. Please try again.');
      }
    } catch (error) {
      console.error('Error adding project with MCP client:', error);
      alert('An error occurred while adding the project. The AI may have returned an invalid format. Please check the console.');
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }
  
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Auto-fill from Resume</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Upload a .txt file of your resume to automatically populate your profile.</p>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <Button onClick={handleParseResume} disabled={isParsing || !resumeText}>
            {isParsing ? 'Parsing...' : 'Parse Resume'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <h2 className="text-xl font-bold mb-4">Your Private Details</h2>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={profile.username || ''}
            onChange={handleProfileChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={profile.company_name || ''}
            onChange={handleProfileChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
          <input
            type="url"
            id="website"
            name="website"
            value={profile.website || ''}
            onChange={handleProfileChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label htmlFor="hourly_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hourly Rate ($)</label>
          <input
            type="number"
            id="hourly_rate"
            name="hourly_rate"
            value={profile.hourly_rate || ''}
            onChange={handleProfileChange}
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Availability</label>
          <select
            id="availability"
            name="availability"
            value={profile.availability || 'available'}
            onChange={handleProfileChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          >
            <option value="available">Available</option>
            <option value="on-request">On Request</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
          <input
            type="url"
            id="linkedin_url"
            name="linkedin_url"
            value={profile.linkedin_url || ''}
            onChange={handleProfileChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
          <input
            type="url"
            id="github_url"
            name="github_url"
            value={profile.github_url || ''}
            onChange={handleProfileChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={profile.bio || ''}
            onChange={handleProfileChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>
        <hr className="my-8 border-gray-300 dark:border-gray-600" />
        <h2 className="text-xl font-bold mb-4">Your Public Resource Details</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">This is the information that will be visible to others in the resource browser.</p>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Role</label>
          <input
            type="text"
            id="role"
            name="role"
            value={resource.role || ''}
            onChange={handleResourceChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={resource.location || ''}
            onChange={handleResourceChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skills (comma-separated)</label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={resource.skills ? resource.skills.join(', ') : ''}
            onChange={handleSkillsChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>

        {/* Team Information Display */}
        {(ownedTeams.length > 0 || memberTeams.length > 0) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Your Teams</label>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
              
              {/* Teams as Manager */}
              {ownedTeams.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Manager of:</h4>
                  <div className="space-y-2">
                    {ownedTeams.map((team: any) => (
                      <div key={team.team_id} className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{team.team_name}</span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams as Member */}
              {memberTeams.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Member of:</h4>
                  <div className="space-y-2">
                    {memberTeams.map((team: any) => (
                      <div key={team.team_id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{team.team_name}</span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Led by {team.owner_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Team information is automatically displayed in your public resource profile. Manage teams from the <a href="/teams" className="text-indigo-600 dark:text-indigo-400 hover:underline">Teams page</a>.
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Work History</label>
          {resource.work_history && resource.work_history.map((job: any, index: number) => (
            <div key={index} className="mt-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
              <p className="font-semibold">{job.title} at {job.company}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{job.dates}</p>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Projects</label>
          <div className="space-y-2">
            {resource.projects && resource.projects.map((project: any, index: number) => (
              <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                <p className="font-semibold">{project.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 my-1">{project.description}</p>
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  View Project
                </a>
              </div>
            ))}
          </div>
          <Button type="button" onClick={handleAiAddProject} className="mt-2" variant="outline">
            Add Project with AI
          </Button>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit; 