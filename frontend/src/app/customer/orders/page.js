'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Search,
  Filter,
  ArrowRight,
  Printer,
  Star,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import StatusBadge from '../../../components/StatusBadge';
import ReceiptModal from '../../../components/ReceiptModal';
import FeedbackModal from '../../../components/FeedbackModal';

export default function OrderHistoryPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [feedbackOrderId, setFeedbackOrderId] = useState(null);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.orders.getMyOrders({
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined,
      });
      if (res.success && res.data) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      setError(err.message || 'Failed to load order history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this shipment?')) return;
    try {
      setCancelLoadingId(orderId);
      await api.orders.cancel(orderId, 'Cancelled by customer');
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancelLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600">
            Customer Module
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Order History & Shipments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete records of all shipments booked under your account.
          </p>
        </div>

        <Link
          href="/customer/book"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-sm transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Book Shipment</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Pending' },
              { id: 'assigned', label: 'Assigned' },
              { id: 'in_transit', label: 'In Transit' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === f.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracking, recipient..."
                className="w-full bg-transparent focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No shipments found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No orders match the current filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 font-bold">
                <tr>
                  <th className="py-3.5 px-6">Tracking Number</th>
                  <th className="py-3.5 px-6">Recipient & Destination</th>
                  <th className="py-3.5 px-6">Parcel Info</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Total Price</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      <Link
                        href={`/track?id=${order.tracking_number}`}
                        className="text-brand-600 hover:underline"
                      >
                        {order.tracking_number}
                      </Link>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{order.delivery_name}</div>
                      <div className="text-xs text-slate-400">{order.delivery_city}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-xs font-semibold text-slate-800">
                        {order.parcel_type}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {order.priority} • {order.weight_kg} kg
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={order.status} size="sm" />
                    </td>

                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      ${parseFloat(order.total_price).toFixed(2)}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      {/* Print Waybill */}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setReceiptOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Print Waybill"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Review Courier (if delivered & not yet rated) */}
                      {order.status === 'delivered' && !order.feedback_rating && (
                        <button
                          onClick={() => setFeedbackOrderId(order.id)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Rate Courier"
                        >
                          <Star className="w-3 h-3 fill-amber-400" />
                          Rate
                        </button>
                      )}

                      {/* Cancel Order (if pending or assigned) */}
                      {['pending', 'assigned'].includes(order.status) && (
                        <button
                          disabled={cancelLoadingId === order.id}
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Cancel Shipment"
                        >
                          <XCircle className="w-3 h-3" />
                          Cancel
                        </button>
                      )}

                      {/* Live Track */}
                      <Link
                        href={`/track?id=${order.tracking_number}`}
                        className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        Track
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReceiptModal
        order={selectedOrder}
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />

      <FeedbackModal
        orderId={feedbackOrderId}
        isOpen={!!feedbackOrderId}
        onClose={() => setFeedbackOrderId(null)}
        onSuccess={loadOrders}
      />
    </div>
  );
}
