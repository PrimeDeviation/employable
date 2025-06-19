import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

interface Resource {
  id: number;
  name: string;
  role: string;
  skills: string[];
  location: string;
  profile_id: string;
  profile?: {
    hourly_rate?: number;
    availability?: string;
    full_name?: string;
    email?: string;
    username?: string;
  };
}

const ResourceBrowse: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          profile:profiles (
            full_name,
            username,
            hourly_rate,
            availability
          )
        `);
      if (error) {
        setError('Failed to load resources.');
      } else {
        setResources(data || []);
      }
      setLoading(false);
    };
    fetchResources();
  }, []);

  // Get unique values for filter dropdowns
  const roles = Array.from(new Set(resources.map(r => r.role))).sort();
  const locations = Array.from(new Set(resources.map(r => r.location))).sort();
  const skills = Array.from(new Set(resources.flatMap(r => r.skills))).sort();
  const availabilityOptions = Array.from(new Set(resources.map(r => r.profile?.availability).filter(Boolean))).sort();

  // Filter and sort resources
  const filtered = resources
    .filter(res => {
      const matchesSearch =
        res.name.toLowerCase().includes(search.toLowerCase()) ||
        res.role.toLowerCase().includes(search.toLowerCase()) ||
        res.location.toLowerCase().includes(search.toLowerCase()) ||
        res.skills.some(skill => skill.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = !roleFilter || res.role === roleFilter;
      const matchesLocation = !locationFilter || res.location === locationFilter;
      const matchesSkill = !skillFilter || res.skills.includes(skillFilter);
      const matchesAvailability = !availabilityFilter || res.profile?.availability === availabilityFilter;
      return matchesSearch && matchesRole && matchesLocation && matchesSkill && matchesAvailability;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rate-low':
          return (a.profile?.hourly_rate || 0) - (b.profile?.hourly_rate || 0);
        case 'rate-high':
          return (b.profile?.hourly_rate || 0) - (a.profile?.hourly_rate || 0);
        case 'availability':
          const availabilityOrder = { 'available': 0, 'on-request': 1, 'unavailable': 2 };
          return (availabilityOrder[a.profile?.availability as keyof typeof availabilityOrder] || 3) - 
                 (availabilityOrder[b.profile?.availability as keyof typeof availabilityOrder] || 3);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">Browse Resources</h1>
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
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
          <select
            value={availabilityFilter}
            onChange={e => setAvailabilityFilter(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Availability</option>
            {availabilityOptions.map(availability => <option key={availability} value={availability}>{availability}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="name">Name</option>
            <option value="rate-low">Rate (Low to High)</option>
            <option value="rate-high">Rate (High to Low)</option>
            <option value="availability">Availability</option>
          </select>
          {(roleFilter || locationFilter || skillFilter || availabilityFilter || search) && (
            <button
              onClick={() => { 
                setRoleFilter(''); 
                setLocationFilter(''); 
                setSkillFilter(''); 
                setAvailabilityFilter(''); 
                setSearch(''); 
              }}
              className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
          {filtered.map((res) => (
            <Link to={`/resource/${res.id}`} key={res.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col transition-colors hover:ring-2 hover:ring-indigo-400 focus:outline-none">
              <div className="mb-2">
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate pr-2 flex-1">{res.profile?.full_name || res.name}</h2>
                  {res.profile?.availability && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      res.profile.availability === 'available' 
                        ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100'
                        : res.profile.availability === 'on-request'
                        ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100'
                        : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'
                    }`}>
                      {res.profile.availability}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-2">{res.role}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {res.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 rounded text-xs font-medium">
                    {skill}
                  </span>
                ))}
                {res.skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-medium">
                    +{res.skills.length - 3} more
                  </span>
                )}
              </div>
              <div className="mt-auto space-y-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">{res.location}</div>
                {res.profile?.hourly_rate && (
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${res.profile.hourly_rate}/hr
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceBrowse; 