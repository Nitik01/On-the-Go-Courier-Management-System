'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  PlusCircle,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  Search,
  Printer,
  Star,
  DollarSign,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import ReceiptModal from '../../components/ReceiptModal';
import FeedbackModal from '../../components/FeedbackModal';

export default function CustomerDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [feedbackOrderId, setFeedbackOrderId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.orders.getMyOrders();
      if (res.success && res.data) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  // Compute summary metrics
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) =>
    ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(o.status)
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const totalSpent = orders.reduce(
    (acc, o) => acc + (parseFloat(o.total_price) || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Hello, {user?.full_name || 'Customer'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your shipments, review courier histories, and dispatch new deliveries.
          </p>
        </div>

        <Link
          href="/customer/book"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand-500/20 transition-all hover:shadow-lg"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Book New Parcel</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Bookings</span>
            <Package className="w-5 h-5 text-brand-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalOrders}</div>
          <div className="text-[11px] text-slate-500">All-time parcel orders</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">In Transit</span>
            <Truck className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-black text-orange-600">{activeOrders}</div>
          <div className="text-[11px] text-slate-500">Active en route</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{deliveredOrders}</div>
          <div className="text-[11px] text-slate-500">Successfully received</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            ${totalSpent.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500">Total freight payments</div>
        </div>
      </div>

      {/* Recent Shipments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900">Your Shipments</h2>
          </div>
          <Link
            href="/customer/orders"
            className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
          >
            <span>View All Shipments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No shipments found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven&apos;t booked any deliveries yet. Create your first parcel booking in seconds!
            </p>
            <Link
              href="/customer/book"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl"
            >
              <PlusCircle className="w-4 h-4" /> Book Parcel Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 font-bold">
                <tr>
                  <th className="py-3 px-6">Tracking Code</th>
                  <th className="py-3 px-6">Destination</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Total Price</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
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
                      <span className="text-xs font-medium text-slate-700">
                        {order.parcel_type}
                      </span>
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
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setReceiptOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/track?id=${order.tracking_number}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-lg transition-colors"
                      >
                        <span>Track</span>
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
