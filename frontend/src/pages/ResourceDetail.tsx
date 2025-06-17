import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Resource {
  id: number;
  name: string;
  role: string;
  skills: string[];
  location: string;
}

interface Profile {
  hourly_rate?: number;
  availability?: string;
}

const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResourceAndProfile = async () => {
      setLoading(true);
      setError(null);

      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .select(`
          *,
          profile:profiles (
            hourly_rate,
            availability
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

      setLoading(false);
    };
    if (id) fetchResourceAndProfile();
  }, [id]);

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{resource.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{resource.role}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {resource.skills.map((skill) => (
                <span key={skill} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
            <div className="text-gray-500 dark:text-gray-400 mb-2">Location: {resource.location}</div>
            
            {profile?.hourly_rate && (
              <div className="text-gray-500 dark:text-gray-400 mb-2">
                Rate: ${profile.hourly_rate}/hr
              </div>
            )}
            {profile?.availability && (
              <div className="text-gray-500 dark:text-gray-400 mb-2">
                Availability: <span className="capitalize">{profile.availability}</span>
              </div>
            )}

            <div className="text-sm text-gray-400 dark:text-gray-500 mt-4">Resource ID: {resource.id}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ResourceDetail; 