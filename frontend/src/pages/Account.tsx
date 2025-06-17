import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Account: React.FC = () => {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [resource, setResource] = useState<any>(null);

  useEffect(() => {
    const getProfile = async () => {
      if (!authLoading && user) {
        setLoading(true);
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`username, website, avatar_url, company_name, bio, hourly_rate, availability`)
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
              <span className="font-semibold">Username:</span> {profile.username || 'Not set'}
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
        <p>Could not load profile. Please try editing your profile to create one.</p>
      )}
    </div>
  );
};

export default Account; 