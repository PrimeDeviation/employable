import React, { useState } from 'react';
import { useBids } from '../hooks/useBids';

interface BidResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  bid: {
    id: number;
    bidder_id: string;
    proposal: string;
    proposed_budget?: number;
    proposed_timeline?: string;
    why_choose_us?: string;
    status: string;
  };
  action: 'accept' | 'decline';
  onBidUpdated: () => void;
}

export function BidResponseModal({ isOpen, onClose, bid, action, onBidUpdated }: BidResponseModalProps) {
  const { updateBidStatus, addBidResponse, isLoading, error } = useBids();
  const [comment, setComment] = useState('');

  const getModalTitle = () => {
    switch (action) {
      case 'accept': return 'Accept Bid';
      case 'decline': return 'Decline Bid';
      default: return 'Bid Response';
    }
  };

  const getModalDescription = () => {
    switch (action) {
      case 'accept': return 'Accept this bid and proceed to contract creation.';
      case 'decline': return 'Decline this bid. The bidder will be able to submit a new bid.';
      default: return '';
    }
  };

  const isCommentRequired = false; // Comments are always optional
  const buttonColor = action === 'accept' ? 'green' : 'red';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCommentRequired && !comment.trim()) {
      return;
    }

    try {
      let newStatus: 'accepted' | 'rejected';
      
      switch (action) {
        case 'accept':
          newStatus = 'accepted';
          break;
        case 'decline':
          newStatus = 'rejected';
          break;
        default:
          return;
      }

      await updateBidStatus(bid.id, newStatus);
      
      if (comment.trim()) {
        await addBidResponse({
          bid_id: bid.id,
          new_status: newStatus,
          response_comment: comment
        });
      }
      
      // TODO: If accepted, create contract
      
      onBidUpdated();
      onClose();
      setComment('');
    } catch (err) {
      console.error('Failed to update bid:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {getModalTitle()}
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

          {/* Bid Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Bid #{bid.id}
            </h3>
            <div className="space-y-2 text-sm">
              {bid.proposed_budget && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Budget:</span> ${bid.proposed_budget.toLocaleString()}
                </p>
              )}
              {bid.proposed_timeline && (
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Timeline:</span> {bid.proposed_timeline}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">Proposal:</span> {bid.proposal.substring(0, 100)}...
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getModalDescription()}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Comment/Response */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comment
              </label>
              <textarea
                required={isCommentRequired}
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder={
                  action === 'accept' 
                    ? "Optional message to the bidder..."
                    : "Optional reason for declining..."
                }
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
                disabled={isLoading || (isCommentRequired && !comment.trim())}
                className={`px-6 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                  buttonColor === 'green' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isLoading ? 'Processing...' : getModalTitle()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 