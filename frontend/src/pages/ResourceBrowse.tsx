import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

interface Resource {
  id: number;
  name: string;
  role: string;
  skills: string[];
  location: string;
}

const ResourceBrowse: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('resources').select('*');
      if (error) {
        setError('Failed to load resources.');
      } else {
        setResources(data || []);
      }
      setLoading(false);
    };
    fetchResources();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Browse Resources</h1>
      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
          {resources.map((res) => (
            <Link to={`/resource/${res.id}`} key={res.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-start transition-colors hover:ring-2 hover:ring-indigo-400 focus:outline-none">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{res.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-2">{res.role}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {res.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{res.location}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceBrowse; 