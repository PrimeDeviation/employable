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
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

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

  // Get unique roles, locations, and skills for filter dropdowns
  const roles = Array.from(new Set(resources.map(r => r.role))).sort();
  const locations = Array.from(new Set(resources.map(r => r.location))).sort();
  const skills = Array.from(new Set(resources.flatMap(r => r.skills))).sort();

  // Filter resources
  const filtered = resources.filter(res => {
    const matchesSearch =
      res.name.toLowerCase().includes(search.toLowerCase()) ||
      res.role.toLowerCase().includes(search.toLowerCase()) ||
      res.location.toLowerCase().includes(search.toLowerCase()) ||
      res.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = !roleFilter || res.role === roleFilter;
    const matchesLocation = !locationFilter || res.location === locationFilter;
    const matchesSkill = !skillFilter || res.skills.includes(skillFilter);
    return matchesSearch && matchesRole && matchesLocation && matchesSkill;
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Browse Resources</h1>
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap gap-4 items-center justify-center">
        <input
          type="text"
          placeholder="Search by name, role, location, or skill..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-[220px]"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Roles</option>
          {roles.map(role => <option key={role} value={role}>{role}</option>)}
        </select>
        <select
          value={locationFilter}
          onChange={e => setLocationFilter(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Locations</option>
          {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        <select
          value={skillFilter}
          onChange={e => setSkillFilter(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Skills</option>
          {skills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
        </select>
        {(roleFilter || locationFilter || skillFilter || search) && (
          <button
            onClick={() => { setRoleFilter(''); setLocationFilter(''); setSkillFilter(''); setSearch(''); }}
            className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Clear
          </button>
        )}
      </div>
      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
          {filtered.map((res) => (
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