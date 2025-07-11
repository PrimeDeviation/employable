import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { BidModal } from '../components/BidModal';
import { BidResponseModal } from '../components/BidResponseModal';

interface Offer {
  id: number;
  title: string;
  description: string;
  offer_type: 'client_offer' | 'team_offer';
  budget_min?: number;
  budget_max?: number;
  budget_type?: string;
  status: string;
  visibility: string;
  created_at: string;
  created_by: string;
  location_preference?: string;
}

interface Bid {
  id: number;
  offer_id: number;
  bidder_id: string;
  proposal: string;
  proposed_budget?: number;
  proposed_timeline?: string;
  why_choose_us?: string;
  status: string;
  created_at: string;
}

export function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bidResponseModal, setBidResponseModal] = useState<{
    isOpen: boolean;
    bid: Bid | null;
    action: 'accept' | 'decline';
  }>({
    isOpen: false,
    bid: null,
    action: 'accept'
  });

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchOfferAndBids = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch offer details
        const { data: offerData, error: offerError } = await supabase
          .from('offers')
          .select('*')
          .eq('id', id)
          .eq('status', 'active')
          .eq('visibility', 'public')
          .single();

        if (offerError) throw offerError;

        setOffer(offerData);

        // Fetch bids for this offer directly
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select('*')
          .eq('offer_id', parseInt(id))
          .order('created_at', { ascending: false });

        if (bidsError) {
          console.error('Failed to fetch bids:', bidsError);
          setBids([]);
        } else {
          setBids(bidsData || []);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch offer';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfferAndBids();
  }, [id]);

  const formatBudget = (offer: Offer) => {
    if (offer.budget_min && offer.budget_max) {
      return `$${offer.budget_min.toLocaleString()} - $${offer.budget_max.toLocaleString()}`;
    } else if (offer.budget_min) {
      return `From $${offer.budget_min.toLocaleString()}`;
    } else if (offer.budget_max) {
      return `Up to $${offer.budget_max.toLocaleString()}`;
    }
    return 'Budget not specified';
  };

  const refreshBids = async () => {
    if (!id) return;
    
    try {
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('offer_id', parseInt(id))
        .order('created_at', { ascending: false });

      if (bidsError) {
        console.error('Failed to fetch bids:', bidsError);
      } else {
        setBids(bidsData || []);
      }
    } catch (err) {
      console.error('Error refreshing bids:', err);
    }
  };

  const handleAcceptBid = (bid: Bid) => {
    setBidResponseModal({
      isOpen: true,
      bid,
      action: 'accept'
    });
  };

  const handleDeclineBid = (bid: Bid) => {
    setBidResponseModal({
      isOpen: true,
      bid,
      action: 'decline'
    });
  };

  const closeBidResponseModal = () => {
    setBidResponseModal({
      isOpen: false,
      bid: null,
      action: 'accept'
    });
  };

  const isOfferCreator = () => {
    return currentUser && offer && currentUser.id === offer.created_by;
  };

  // Filter bids to only show ones the user is involved in
  const visibleBids = bids.filter(bid => {
    if (!currentUser) return false;
    // Show bid if user is the offer creator or the bidder
    return currentUser.id === offer?.created_by || currentUser.id === bid.bidder_id;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading offer details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">Error: {error || 'Offer not found'}</p>
            <Link to="/offers" className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
              ← Back to offers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-10 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/offers" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to offers
          </Link>
        </div>

        {/* Offer Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{offer.title}</h1>
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
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Posted {new Date(offer.created_at).toLocaleDateString()} • ID: {offer.id}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatBudget(offer)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {offer.budget_type || 'negotiable'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Description</h3>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              {offer.description}
            </pre>
          </div>
        </div>

        {/* Offer Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Status</h4>
            <p className="text-gray-600 dark:text-gray-400">{offer.status}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Visibility</h4>
            <p className="text-gray-600 dark:text-gray-400">{offer.visibility}</p>
          </div>
          {offer.location_preference && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Location</h4>
              <p className="text-gray-600 dark:text-gray-400">{offer.location_preference}</p>
            </div>
          )}
        </div>
      </div>

        {/* Bids Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isOfferCreator() ? `Bids (${visibleBids.length})` : 'Your Bids'}
            </h2>
          </div>

        {visibleBids.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">💼</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No bids yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isOfferCreator() ? 'No bids have been submitted yet.' : 'Be the first to submit a bid on this offer!'}
            </p>
            {!isOfferCreator() && (
              <button 
                onClick={() => setIsBidModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit First Bid
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {visibleBids.map((bid) => (
              <div key={bid.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 dark:bg-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Bid #{bid.id}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Submitted {new Date(bid.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {bid.proposed_budget && (
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        ${bid.proposed_budget.toLocaleString()}
                      </p>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bid.status === 'accepted' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : bid.status === 'rejected'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {bid.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Proposal</h5>
                    <p className="text-gray-700 dark:text-gray-300">{bid.proposal}</p>
                  </div>

                  {bid.proposed_timeline && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Proposed Timeline</h5>
                      <p className="text-gray-700 dark:text-gray-300">{bid.proposed_timeline}</p>
                    </div>
                  )}

                  {bid.why_choose_us && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Why Choose Us</h5>
                      <p className="text-gray-700 dark:text-gray-300">{bid.why_choose_us}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500">
                    View Profile
                  </button>
                  {isOfferCreator() && currentUser?.id !== bid.bidder_id && (
                    <>
                      <button 
                        onClick={() => handleDeclineBid(bid)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleAcceptBid(bid)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Accept
                      </button>
                    </>
                  )}
                  {currentUser?.id === bid.bidder_id && !isOfferCreator() && (
                    <button 
                      onClick={() => setIsBidModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Submit New Bid
                    </button>
                  )}
                </div>
              </div>
            ))}

          </div>
        )}
        </div>
      </div>

      {/* Bid Modal */}
      {offer && (
        <BidModal
          isOpen={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
          offer={offer}
          onBidSubmitted={refreshBids}
        />
      )}

      {/* Bid Response Modal */}
      {bidResponseModal.bid && (
        <BidResponseModal
          isOpen={bidResponseModal.isOpen}
          onClose={closeBidResponseModal}
          bid={bidResponseModal.bid}
          action={bidResponseModal.action}
          onBidUpdated={refreshBids}
        />
      )}
    </div>
  );
} 