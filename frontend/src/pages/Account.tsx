import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Account: React.FC = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { theme, setTheme } = useDarkMode();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [resource, setResource] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      if (!authLoading && user) {
        setLoading(true);
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`username, website, avatar_url, company_name, bio, hourly_rate, availability, full_name`)
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.warn(profileError);
        } else if (profileData) {
          setProfile(profileData);
        }

        // Get resource data
        const { data: resourceData, error: resourceError } = await supabase
          .from('resources')
          .select(`id, name, role, skills, location`)
          .eq('profile_id', user.id)
          .single();
        
        if (resourceError) {
          console.warn('Resource error:', resourceError);
        } else if (resourceData) {
          setResource(resourceData);
        }
        
        setLoading(false);
      } else if (!authLoading && !user) {
        setLoading(false);
      }
    };
    getProfile();
  }, [user, authLoading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Account</h1>
        <div className="space-x-2">
          <Link to="/profile/edit">
            <Button variant="outline">Edit Profile</Button>
          </Link>
          <Button onClick={handleSignOut} variant="destructive">
            Sign Out
          </Button>
        </div>
      </div>
      
      {loading ? (
        <p>Loading profile...</p>
      ) : profile ? (
        <>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
            <div>
              <span className="font-semibold">Email:</span> {session?.user.email}
            </div>
            <div>
              <span className="font-semibold">Full Name:</span> {profile.full_name || 'Not set'}
            </div>
            <div>
              <span className="font-semibold">Company:</span> {profile.company_name || 'Not set'}
            </div>
            <div>
              <span className="font-semibold">Website:</span> 
              {profile.website ? (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-2">
                  {profile.website}
                </a>
              ) : ' Not set'}
            </div>
            <div>
              <span className="font-semibold">Bio:</span>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{profile.bio || 'Not set'}</p>
            </div>
            
            {/* Professional Information */}
            {(profile.hourly_rate || profile.availability) && (
              <>
                <hr className="my-4" />
                <h3 className="text-lg font-semibold mb-2">Professional Details</h3>
                {profile.hourly_rate && (
                  <div>
                    <span className="font-semibold">Hourly Rate:</span> ${profile.hourly_rate}/hr
                  </div>
                )}
                {profile.availability && (
                  <div>
                    <span className="font-semibold">Availability:</span> 
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
              </>
            )}
          </div>
          
          {/* Resource Information */}
          {resource && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Resource Profile</h3>
                <Link to={`/resource/${resource.id}`}>
                  <Button variant="outline" size="sm">View Public Profile</Button>
                </Link>
              </div>
              
              <div>
                <span className="font-semibold">Role:</span> {resource.role}
              </div>
              <div>
                <span className="font-semibold">Location:</span> {resource.location}
              </div>
              {resource.skills && resource.skills.length > 0 && (
                <div>
                  <span className="font-semibold">Skills:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {resource.skills.map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Resource ID: {resource.id} • <Link to={`/resource/${resource.id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">View full public profile</Link>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800 shadow rounded-lg">
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Your profile could not be loaded.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you have just signed up, your profile should be created automatically. Please try refreshing the page in a moment. If the issue persists, please contact support.
          </p>
        </div>
      )}

      {/* Preferences Section - always visible */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Preferences</h3>
          
          <div>
            <span className="font-semibold mb-2 block">Theme:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                  theme === 'light'
                    ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 border border-indigo-300 dark:border-indigo-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3.25a.75.75 0 01.75.75v1a.75.75 0 01-1.5 0v-1A.75.75 0 0110 3.25zm0 10a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5zm6.75-.75a.75.75 0 000 1.5h1a.75.75 0 000-1.5h-1zm-13.5 0a.75.75 0 000 1.5h1a.75.75 0 000-1.5h-1zm10.72-6.47a.75.75 0 011.06 1.06l-.71.71a.75.75 0 11-1.06-1.06l.71-.71zm-8.49 8.49a.75.75 0 011.06 0l.71.71a.75.75 0 11-1.06 1.06l-.71-.71a.75.75 0 010-1.06zm12.02 1.06a.75.75 0 01-1.06-1.06l.71-.71a.75.75 0 111.06 1.06l-.71.71zm-8.49-8.49a.75.75 0 01-1.06 1.06l-.71-.71a.75.75 0 111.06-1.06l.71.71z" />
                </svg>
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                  theme === 'dark'
                    ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 border border-indigo-300 dark:border-indigo-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                  theme === 'system'
                    ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 border border-indigo-300 dark:border-indigo-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                System
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {theme === 'system' 
                ? 'Automatically matches your device\'s appearance settings'
                : `Always use ${theme} mode`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account; 