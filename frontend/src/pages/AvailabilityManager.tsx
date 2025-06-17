import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';

interface Profile {
  id: string;
  hourly_rate?: number;
  availability?: string;
  username?: string;
  full_name?: string;
}

const AvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rates, setRates] = useState({
    standard: 0,
    premium: 0,
    ai_assisted: 0,
    team_rate: 0,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
        setRates({
          standard: data.hourly_rate || 0,
          premium: (data.hourly_rate || 0) * 1.5,
          ai_assisted: (data.hourly_rate || 0) * 2,
          team_rate: (data.hourly_rate || 0) * 0.8,
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleAvailabilityChange = async (newAvailability: string) => {
    if (!user || !profile) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ availability: newAvailability })
      .eq('id', user.id);

    if (error) {
      alert('Error updating availability!');
      console.error(error);
    } else {
      setProfile({ ...profile, availability: newAvailability });
    }
    setSaving(false);
  };

  const handleRateUpdate = async () => {
    if (!user || !profile) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ hourly_rate: rates.standard })
      .eq('id', user.id);

    if (error) {
      alert('Error updating rates!');
      console.error(error);
    } else {
      setProfile({ ...profile, hourly_rate: rates.standard });
      alert('Rates updated successfully!');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!profile) {
    return <div className="flex justify-center items-center min-h-screen">Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        AI Agent Team Availability & Rate Management
      </h1>

      {/* Current Status Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Current Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {profile.username || profile.full_name || 'Pilot'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Human Pilot</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              profile.availability === 'available' 
                ? 'text-green-600 dark:text-green-400'
                : profile.availability === 'on-request'
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {profile.availability || 'Unknown'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Team Availability</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${profile.hourly_rate || 0}/hr
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Base Rate</div>
          </div>
        </div>
      </div>

      {/* Availability Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Team Availability Status
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Set your AI agent team's availability status for new projects and engagements.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleAvailabilityChange('available')}
            disabled={saving}
            className={`p-4 rounded-lg border-2 transition-colors ${
              profile.availability === 'available'
                ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
            }`}
          >
            <div className="font-medium">Available</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Ready for new projects immediately
            </div>
          </button>
          <button
            onClick={() => handleAvailabilityChange('on-request')}
            disabled={saving}
            className={`p-4 rounded-lg border-2 transition-colors ${
              profile.availability === 'on-request'
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-yellow-400'
            }`}
          >
            <div className="font-medium">On Request</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Available for the right projects
            </div>
          </button>
          <button
            onClick={() => handleAvailabilityChange('unavailable')}
            disabled={saving}
            className={`p-4 rounded-lg border-2 transition-colors ${
              profile.availability === 'unavailable'
                ? 'border-red-500 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
                : 'border-gray-300 dark:border-gray-600 hover:border-red-400'
            }`}
          >
            <div className="font-medium">Unavailable</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Not taking new projects
            </div>
          </button>
        </div>
      </div>

      {/* Rate Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          AI Agent Team Pricing Strategy
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Configure your team's pricing for different types of engagements and AI capabilities.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Standard Human Work ($)
            </label>
            <input
              type="number"
              value={rates.standard}
              onChange={(e) => setRates({ ...rates, standard: parseFloat(e.target.value) || 0 })}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Traditional consulting work</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI-Assisted Work ($)
            </label>
            <input
              type="number"
              value={rates.ai_assisted}
              onChange={(e) => setRates({ ...rates, ai_assisted: parseFloat(e.target.value) || 0 })}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Work enhanced by AI agents</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Premium Projects ($)
            </label>
            <input
              type="number"
              value={rates.premium}
              onChange={(e) => setRates({ ...rates, premium: parseFloat(e.target.value) || 0 })}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">High-priority, complex projects</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Team Rate ($)
            </label>
            <input
              type="number"
              value={rates.team_rate}
              onChange={(e) => setRates({ ...rates, team_rate: parseFloat(e.target.value) || 0 })}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per-person rate for team projects</p>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleRateUpdate} disabled={saving} className="w-full md:w-auto">
            {saving ? 'Updating...' : 'Update Rates'}
          </Button>
        </div>
      </div>

      {/* AI Agent Status (Future Feature) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          AI Agent Status
        </h2>
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            🚀 <strong>Coming Soon:</strong> Manage individual AI agent availability, computational resources, 
            and deployment status. This will integrate with MCP to provide real-time agent monitoring and control.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager; 