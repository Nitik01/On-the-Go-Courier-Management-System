'use client';

import React, { useState } from 'react';
import { X, Star, Send, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function FeedbackModal({ orderId, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.orders.submitFeedback(orderId, { rating, comments });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Rate Delivery Service</h3>
        <p className="text-xs text-slate-500 mb-6">
          Your feedback helps us maintain exceptional courier service quality.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star selector */}
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-hidden"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {rating === 5 && 'Outstanding Experience'}
              {rating === 4 && 'Very Good'}
              {rating === 3 && 'Average'}
              {rating === 2 && 'Needs Improvement'}
              {rating === 1 && 'Unsatisfactory'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Comments or Delivery Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Was the courier courteous? Did the parcel arrive on time and intact?"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm shadow-brand-500/20 flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
