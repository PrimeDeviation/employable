import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOffers } from '../hooks/useOffers';

export function OfferBrowsePage() {
  const [filterType, setFilterType] = useState<'all' | 'client_offer' | 'team_offer'>('all');
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const { offers, isLoading, error, refetch } = useOffers();

  const handleFilterChange = (type: 'all' | 'client_offer' | 'team_offer') => {
    setFilterType(type);
    refetch({ offer_type: type, limit: 50 });
  };

  // Get unique values for filter dropdowns
  const locations = Array.from(new Set(offers.map(o => o.location_preference).filter(Boolean))).sort();
  const statuses = Array.from(new Set(offers.map(o => o.status))).sort();

  // Filter and sort offers
  const filteredOffers = offers
    .filter(offer => {
      const matchesType = filterType === 'all' || offer.offer_type === filterType;
      const matchesSearch = 
        offer.title.toLowerCase().includes(search.toLowerCase()) ||
        offer.description.toLowerCase().includes(search.toLowerCase());
      const matchesLocation = !locationFilter || offer.location_preference === locationFilter;
      const matchesStatus = !statusFilter || offer.status === statusFilter;
      return matchesType && matchesSearch && matchesLocation && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'budget-low':
          return (a.budget_min || 0) - (b.budget_min || 0);
        case 'budget-high':
          return (b.budget_max || 0) - (a.budget_max || 0);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const formatBudget = (offer: any) => {
    if (offer.budget_min && offer.budget_max) {
      return `$${offer.budget_min.toLocaleString()} - $${offer.budget_max.toLocaleString()}`;
    } else if (offer.budget_min) {
      return `From $${offer.budget_min.toLocaleString()}`;
    } else if (offer.budget_max) {
      return `Up to $${offer.budget_max.toLocaleString()}`;
    }
    return 'Budget not specified';
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading offers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error loading offers: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Browse Offers</h1>
              <p className="text-gray-600 dark:text-gray-400">
                MCP validation dashboard - View offers created via UI and MCP
              </p>
            </div>
            <Link
              to="/offers/create"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Create Offer
            </Link>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <input
                type="text"
                placeholder="Search offers by title or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[280px]"
              />
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Locations</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="created_at">Newest First</option>
                  <option value="title">Title</option>
                  <option value="budget-low">Budget (Low to High)</option>
                  <option value="budget-high">Budget (High to Low)</option>
                </select>
              </div>

              {(locationFilter || statusFilter || search) && (
                <button
                  onClick={() => { 
                    setLocationFilter(''); 
                    setStatusFilter(''); 
                    setSearch(''); 
                  }}
                  className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
              }`}
            >
              All Offers ({offers.length})
            </button>
            <button
              onClick={() => handleFilterChange('client_offer')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'client_offer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Client Offers ({offers.filter(o => o.offer_type === 'client_offer').length})
            </button>
            <button
              onClick={() => handleFilterChange('team_offer')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'team_offer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Team Offers ({offers.filter(o => o.offer_type === 'team_offer').length})
            </button>
          </div>
        </div>

        {/* Results */}
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No offers found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {search || locationFilter || statusFilter 
                ? 'Try adjusting your search criteria or filters.'
                : 'Be the first to create an offer in the marketplace!'
              }
            </p>
            {!search && !locationFilter && !statusFilter && (
              <Link
                to="/offers/create"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Create First Offer
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{offer.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          offer.offer_type === 'client_offer'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}
                      >
                        {offer.offer_type === 'client_offer' ? 'Client Looking for Team' : 'Team Offering Services'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      Posted {new Date(offer.created_at).toLocaleDateString()} • ID: {offer.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatBudget(offer)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {offer.budget_type || 'negotiable'}
                    </p>
                  </div>
                </div>

                {/* Truncated Description */}
                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {offer.description.length > 150 
                      ? `${offer.description.substring(0, 150)}...` 
                      : offer.description
                    }
                  </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    {offer.location_preference && (
                      <span>📍 {offer.location_preference}</span>
                    )}
                    <span>Status: {offer.status}</span>
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      to={`/offers/${offer.id}`}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      View Details
                    </Link>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Submit Bid
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 