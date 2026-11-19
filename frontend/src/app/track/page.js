'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Truck,
  Package,
  Calendar,
  MapPin,
  User,
  Phone,
  Printer,
  Star,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import TrackingTimeline from '../../components/TrackingTimeline';
import MapSimulator from '../../components/MapSimulator';
import ReceiptModal from '../../components/ReceiptModal';
import FeedbackModal from '../../components/FeedbackModal';
import { useAuth } from '../../context/AuthContext';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [trackingNumber, setTrackingNumber] = useState(initialId);
  const [searchInput, setSearchInput] = useState(initialId);
  const [orderData, setOrderData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const { user } = useAuth();

  const fetchTracking = async (code) => {
    if (!code || !code.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await api.orders.track(code.trim());
      if (res.success && res.data) {
        setOrderData(res.data.order);
        setTimeline(res.data.timeline || []);
        setFeedback(res.data.feedback || null);
      }
    } catch (err) {
      setOrderData(null);
      setTimeline([]);
      setFeedback(null);
      setError(
        err.message || `No shipment found matching tracking code '${code}'.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setTrackingNumber(initialId);
      setSearchInput(initialId);
      fetchTracking(initialId);
    }
  }, [initialId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setTrackingNumber(searchInput.trim());
    fetchTracking(searchInput.trim());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Real-Time Parcel Tracking
          </h1>
          <p className="text-sm text-slate-500">
            Enter your unique On-the-Go tracking code to monitor real-time checkpoint telemetry.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2"
        >
          <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. OTG-202611-94812"
              className="w-full bg-transparent text-sm font-mono uppercase placeholder-slate-400 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-sm shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track</span>
              </>
            )}
          </button>
        </form>

        {/* Quick demo links */}
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400">
          <span>Sample parcels:</span>
          {['OTG-202611-94812', 'OTG-202611-82014', 'OTG-202611-73921', 'OTG-202611-61028'].map(
            (code) => (
              <button
                key={code}
                onClick={() => {
                  setSearchInput(code);
                  setTrackingNumber(code);
                  fetchTracking(code);
                }}
                className="hover:text-brand-600 underline font-mono transition-colors"
              >
                {code}
              </button>
            )
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Tracking Results View */}
      {orderData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Status & Overview Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs uppercase font-mono font-bold text-slate-400">
                  Tracking Code:
                </span>
                <span className="text-xl sm:text-2xl font-mono font-black text-slate-900">
                  {orderData.tracking_number}
                </span>
                <StatusBadge status={orderData.status} size="lg" />
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-4 flex-wrap">
                <span>
                  <strong>Category:</strong> {orderData.parcel_type} ({orderData.weight_kg} kg)
                </span>
                <span>•</span>
                <span>
                  <strong>Priority:</strong> <span className="capitalize">{orderData.priority}</span>
                </span>
                <span>•</span>
                <span>
                  <strong>Booked:</strong>{' '}
                  {new Date(orderData.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {orderData.status === 'delivered' && user?.role === 'customer' && !feedback && (
                <button
                  onClick={() => setFeedbackOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Star className="w-4 h-4 fill-white" />
                  Rate Delivery
                </button>
              )}

              <button
                onClick={() => setReceiptOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                View & Print Waybill
              </button>
            </div>
          </div>

          {/* Interactive Route Simulation Map */}
          <MapSimulator
            pickupCity={orderData.pickup_city}
            deliveryCity={orderData.delivery_city}
            status={orderData.status}
            courierName={orderData.courier_name}
            vehicle={orderData.vehicle_type}
          />

          {/* Sender & Recipient Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origin Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
                <MapPin className="w-4 h-4" /> Pickup Origin
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{orderData.pickup_name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" /> {orderData.pickup_phone}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {orderData.pickup_address}, {orderData.pickup_city} {orderData.pickup_postal_code}
              </p>
            </div>

            {/* Destination Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <MapPin className="w-4 h-4" /> Delivery Destination
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{orderData.delivery_name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" /> {orderData.delivery_phone}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {orderData.delivery_address}, {orderData.delivery_city}{' '}
                {orderData.delivery_postal_code}
              </p>
              {orderData.delivery_instructions && (
                <div className="p-2.5 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200/60">
                  <strong>Instructions:</strong> {orderData.delivery_instructions}
                </div>
              )}
            </div>
          </div>

          {/* Courier Card if assigned */}
          {orderData.courier_name && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Dispatched Courier
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {orderData.courier_name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {orderData.vehicle_type} • Plate: <strong>{orderData.vehicle_plate}</strong>
                  </div>
                </div>
              </div>

              {orderData.courier_rating && (
                <div className="flex items-center gap-1.5 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-700 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{parseFloat(orderData.courier_rating).toFixed(1)} Courier Rating</span>
                </div>
              )}
            </div>
          )}

          {/* Feedback Display if already submitted */}
          {feedback && (
            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Customer Review
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(feedback.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              {feedback.comments && (
                <p className="text-xs text-emerald-800 italic">&ldquo;{feedback.comments}&rdquo;</p>
              )}
            </div>
          )}

          {/* Step progression & Real-time Checkpoints Log */}
          <TrackingTimeline currentStatus={orderData.status} events={timeline} />
        </div>
      )}

      {/* Modals */}
      <ReceiptModal
        order={orderData}
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />

      {orderData && (
        <FeedbackModal
          orderId={orderData.id}
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          onSuccess={() => fetchTracking(orderData.tracking_number)}
        />
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading tracker...
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
