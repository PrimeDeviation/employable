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

  useEffect(() => {
    const getProfileAndResource = async () => {
      if (!user) return;
      setLoading(true);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) console.error('Error fetching profile', profileError);
      else if (profileData) setProfile(profileData);

      // Fetch resource data
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      if (resourceError) console.error('Error fetching resource', resourceError);
      else if (resourceData) setResource(resourceData);

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

    // Update resource
    if (resource.id) {
      const resourceUpdates = {
        id: resource.id,
        name: profile.username, // Keep name in sync with profile username
        ...resource
      };
      const { error: resourceError } = await supabase.from('resources').upsert(resourceUpdates);
      if (resourceError) {
        alert('Error updating resource data!');
        console.error(resourceError);
      }
    }

    if (!profileError && !resource.id) { // Should check for resource error too
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
      The JSON object should have the following keys: "role", "skills", and "bio".
      - "role" should be the user's most recent or primary job title.
      - "skills" should be an array of strings, listing the key technical skills and technologies.
      - "bio" should be a 2-3 sentence professional summary based on the resume's content.

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

      alert('Resume parsed successfully! Please review the updated fields.');

    } catch (error) {
      console.error('Error parsing resume with MCP client:', error);
      alert('An error occurred while parsing the resume. The AI may have returned an invalid format. Please check the console.');
    } finally {
      setIsParsing(false);
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
        <hr className="my-8" />
        <h2 className="text-xl font-bold mb-4">Your Public Resource Profile</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">This is the information that will be visible to others in the resource browser.</p>
        
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
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
            value={Array.isArray(resource.skills) ? resource.skills.join(', ') : ''}
            onChange={handleSkillsChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <Button type="button" variant="outline" onClick={() => navigate('/account')}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit; 