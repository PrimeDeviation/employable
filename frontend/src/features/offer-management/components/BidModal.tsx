import React, { useState } from 'react';
import { useBids } from '../hooks/useBids';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    id: number;
    title: string;
    offer_type: string;
    budget_min?: number;
    budget_max?: number;
    budget_type?: string;
  };
  onBidSubmitted: () => void;
  isCounterBid?: boolean;
}

export function BidModal({ isOpen, onClose, offer, onBidSubmitted, isCounterBid = false }: BidModalProps) {
  const { createBid, isLoading, error } = useBids();
  const [formData, setFormData] = useState({
    proposal: '',
    proposed_budget: '',
    proposed_timeline: '',
    why_choose_us: '',
    approach: '',
    questions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createBid({
        offer_id: offer.id,
        proposal: formData.proposal,
        proposed_budget: formData.proposed_budget ? parseFloat(formData.proposed_budget) : undefined,
        proposed_timeline: formData.proposed_timeline || undefined,
        why_choose_us: formData.why_choose_us || undefined,
        is_counter_bid: isCounterBid,
      });

      // Reset form and close modal
      setFormData({
        proposal: '',
        proposed_budget: '',
        proposed_timeline: '',
        why_choose_us: '',
        approach: '',
        questions: ''
      });
      
      onBidSubmitted();
      onClose();
    } catch (err) {
      console.error('Failed to submit bid:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isCounterBid ? 'Submit Counter Bid' : 'Submit Bid'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Offer Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isCounterBid ? 'Counter bidding on:' : 'Bidding on:'} {offer.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Type: {offer.offer_type === 'client_offer' ? 'Client Project' : 'Team Service'}
            </p>
            {(offer.budget_min || offer.budget_max) && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Budget: {offer.budget_min && offer.budget_max 
                  ? `$${offer.budget_min.toLocaleString()} - $${offer.budget_max.toLocaleString()}`
                  : offer.budget_min 
                    ? `From $${offer.budget_min.toLocaleString()}`
                    : `Up to $${offer.budget_max?.toLocaleString()}`
                } ({offer.budget_type || 'negotiable'})
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Proposal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proposal *
              </label>
              <textarea
                required
                rows={4}
                value={formData.proposal}
                onChange={(e) => handleInputChange('proposal', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Describe your proposal, how you would approach this project, and what you can deliver..."
              />
            </div>

            {/* Budget and Timeline Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proposed Budget ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.proposed_budget}
                  onChange={(e) => handleInputChange('proposed_budget', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Your proposed budget"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proposed Timeline
                </label>
                <input
                  type="text"
                  value={formData.proposed_timeline}
                  onChange={(e) => handleInputChange('proposed_timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder="e.g., 2-3 weeks, 1 month, etc."
                />
              </div>
            </div>

            {/* Why Choose Us */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Why Choose Us?
              </label>
              <textarea
                rows={3}
                value={formData.why_choose_us}
                onChange={(e) => handleInputChange('why_choose_us', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="What makes you/your team the best choice for this project?"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.proposal.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting...' : 'Submit Bid'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 