'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Search,
  Filter,
  Truck,
  UserCheck,
  Printer,
  ArrowRight,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import StatusBadge from '../../../components/StatusBadge';
import ReceiptModal from '../../../components/ReceiptModal';

export default function AdminOrdersPage() {
  const { user, isAuthenticated, isLoading: authLoading, role } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCourier, setFilterCourier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetCourierId, setTargetCourierId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Receipt modal state
  const [receiptOrder, setReceiptOrder] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push('/login');
      else if (role !== 'admin') router.push('/');
    }
  }, [authLoading, isAuthenticated, role, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordersRes, couriersRes] = await Promise.all([
        api.admin.getAllOrders({
          status: filterStatus !== 'all' ? filterStatus : undefined,
          priority: filterPriority !== 'all' ? filterPriority : undefined,
          courier_id: filterCourier !== 'all' ? filterCourier : undefined,
          search: searchQuery || undefined,
        }),
        api.admin.getAllCouriers(),
      ]);

      if (ordersRes.success) setOrders(ordersRes.data.orders);
      if (couriersRes.success) setCouriers(couriersRes.data.couriers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      loadData();
    }
  }, [isAuthenticated, role, filterStatus, filterPriority, filterCourier]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setTargetCourierId(order.courier_id ? String(order.courier_id) : '');
    setAssignModalOpen(true);
  };

  const handleAssignCourier = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !targetCourierId) return;

    try {
      setIsAssigning(true);
      await api.admin.assignCourier(selectedOrder.id, targetCourierId);
      setAssignModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to assign courier');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-600">
            Operations Dispatch
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Orders & Courier Assignment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time shipments, assign deliveries to couriers, and manage dispatch lifecycles.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total: <strong className="text-slate-900">{orders.length}</strong> Shipments
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Status filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Dispatch</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="standard">Standard Ground</option>
              <option value="express">Express</option>
              <option value="overnight">Overnight Rush</option>
            </select>
          </div>

          {/* Courier filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Filter Assigned Courier
            </label>
            <select
              value={filterCourier}
              onChange={(e) => setFilterCourier(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
            >
              <option value="all">All Couriers</option>
              {couriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.vehicle_type})
                </option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Search Shipments
            </label>
            <form onSubmit={handleSearchSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tracking #, recipient, city..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 font-bold">
                <tr>
                  <th className="py-3 px-6">Tracking Number</th>
                  <th className="py-3 px-6">Sender &rarr; Recipient</th>
                  <th className="py-3 px-6">Parcel Type</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Assigned Courier</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6 text-right">Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                      <Link
                        href={`/track?id=${order.tracking_number}`}
                        className="text-brand-600 hover:underline"
                      >
                        {order.tracking_number}
                      </Link>
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="text-xs font-semibold text-slate-800">
                        {order.pickup_city} &rarr; {order.delivery_city}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        To: {order.delivery_name}
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-xs text-slate-700">
                      <div>{order.parcel_type}</div>
                      <div className="text-[11px] text-slate-400 capitalize">
                        {order.priority} • {order.weight_kg} kg
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <StatusBadge status={order.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-6">
                      {order.courier_name ? (
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-orange-500" />
                          <span>{order.courier_name}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                      ${parseFloat(order.total_price).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-6 text-right space-x-2 whitespace-nowrap">
                      {/* Print waybill */}
                      <button
                        onClick={() => {
                          setReceiptOrder(order);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Print Waybill"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Assign Courier button */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => openAssignModal(order)}
                          className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{order.courier_id ? 'Reassign' : 'Assign'}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Courier Assignment Modal */}
      {assignModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-purple-600">
                  Dispatcher Assignment
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">Assign Courier</h3>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div>
                <span className="text-slate-400">Shipment:</span>{' '}
                <strong className="font-mono text-slate-800">
                  {selectedOrder.tracking_number}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">Route:</span>{' '}
                <span className="text-slate-800">
                  {selectedOrder.pickup_city} &rarr; {selectedOrder.delivery_city}
                </span>
              </div>
            </div>

            <form onSubmit={handleAssignCourier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Courier from Fleet
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {couriers.map((courier) => (
                    <label
                      key={courier.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        targetCourierId === String(courier.id)
                          ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="courier_select"
                          value={courier.id}
                          checked={targetCourierId === String(courier.id)}
                          onChange={() => setTargetCourierId(String(courier.id))}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{courier.full_name}</div>
                          <div className="text-[11px] text-slate-400">
                            {courier.vehicle_type} • Plate: {courier.vehicle_plate}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            courier.is_available
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {courier.is_available ? 'Available' : 'Busy / Offline'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {courier.active_load} Active Runs
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || !targetCourierId}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-sm shadow-purple-500/20 flex items-center justify-center gap-1.5"
                >
                  {isAssigning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waybill Modal */}
      <ReceiptModal
        order={receiptOrder}
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}
