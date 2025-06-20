import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

interface Contract {
  id: number;
  client_id: string;
  pilot_id: string;
  resource_id?: number;
  title: string;
  description: string;
  hourly_rate?: number;
  total_budget?: number;
  estimated_hours?: number;
  start_date?: string;
  end_date?: string;
  payment_terms?: string;
  deliverables?: string[];
  status: string;
  created_by: string;
  version: number;
  ai_capabilities_required?: string[];
  computational_requirements?: string;
  data_handling_terms?: string;
  created_at: string;
  updated_at: string;
  client_profile?: {
    username?: string;
    full_name?: string;
  };
  pilot_profile?: {
    username?: string;
    full_name?: string;
  };
  resource?: {
    name: string;
    role: string;
  };
}

const Contracts: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        client_profile:profiles!contracts_client_id_fkey (username, full_name),
        pilot_profile:profiles!contracts_pilot_id_fkey (username, full_name),
        resource:resources (name, role)
      `)
      .or(`client_id.eq.${user.id},pilot_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
    } else {
      setContracts(data || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      case 'sent_for_review':
        return 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200';
      case 'under_negotiation':
        return 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200';
      case 'signed':
        return 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200';
      case 'active':
        return 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200';
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const filteredContracts = selectedStatus === 'all' 
    ? contracts 
    : contracts.filter(contract => contract.status === selectedStatus);

  const getOtherParty = (contract: Contract) => {
    if (contract.client_id === user?.id) {
      return contract.pilot_profile?.full_name || contract.pilot_profile?.username || 'Unknown Pilot';
    } else {
      return contract.client_profile?.full_name || contract.client_profile?.username || 'Unknown Client';
    }
  };

  const getUserRole = (contract: Contract) => {
    return contract.client_id === user?.id ? 'Client' : 'Pilot';
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          AI Agent Team Contracts
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Contracts are created automatically when offers are successfully negotiated and finalized.
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedStatus === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All ({contracts.length})
          </button>
          {['draft', 'sent_for_review', 'under_negotiation', 'approved', 'signed', 'active', 'completed', 'cancelled'].map(status => {
            const count = contracts.filter(c => c.status === status).length;
            if (count === 0) return null;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {status.replace('_', ' ')} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            {selectedStatus === 'all' ? 'No contracts found.' : `No ${selectedStatus.replace('_', ' ')} contracts found.`}
          </div>
          {selectedStatus === 'all' && (
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Contracts are created when offers are successfully negotiated. Start by browsing offers or creating your own.
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/offers">
                  <Button variant="outline">Browse Offers</Button>
                </Link>
                <Link to="/offers/create">
                  <Button>Create Offer</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map(contract => (
            <div key={contract.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {contract.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                      {contract.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {contract.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span><strong>{getUserRole(contract)}:</strong> You</span>
                    <span><strong>{getUserRole(contract) === 'Client' ? 'Pilot' : 'Client'}:</strong> {getOtherParty(contract)}</span>
                    {contract.resource && (
                      <span><strong>Team:</strong> {contract.resource.name}</span>
                    )}
                  </div>
                </div>
                <Link to={`/contracts/${contract.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {contract.hourly_rate && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Rate</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      ${contract.hourly_rate}/hr
                    </div>
                  </div>
                )}
                {contract.total_budget && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Budget</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      ${contract.total_budget.toLocaleString()}
                    </div>
                  </div>
                )}
                {contract.estimated_hours && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Est. Hours</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {contract.estimated_hours}h
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Created</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {new Date(contract.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {contract.ai_capabilities_required && contract.ai_capabilities_required.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">AI Capabilities Required</div>
                  <div className="flex flex-wrap gap-1">
                    {contract.ai_capabilities_required.map((capability, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contracts; 