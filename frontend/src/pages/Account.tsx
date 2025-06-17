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

  useEffect(() => {
    const getProfile = async () => {
      if (!authLoading && user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select(`username, website, avatar_url, company_name, bio`)
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.warn(error);
        } else if (data) {
          setProfile(data);
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
        </div>
      ) : (
        <p>Could not load profile. Please try editing your profile to create one.</p>
      )}
    </div>
  );
};

export default Account; 