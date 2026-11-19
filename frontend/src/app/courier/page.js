'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Power,
  Navigation,
  Send,
  Loader2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';

export default function CourierPortalPage() {
  const { user, isAuthenticated, isLoading: authLoading, role } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'available' | 'completed'
  const [profileData, setProfileData] = useState(null);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Checkpoint update modal state
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [checkpointLocation, setCheckpointLocation] = useState('');
  const [checkpointNotes, setCheckpointNotes] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push('/login');
      else if (role !== 'courier' && role !== 'admin') router.push('/');
    }
  }, [authLoading, isAuthenticated, role, router]);

  const loadCourierData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, activeRes, availableRes, completedRes] = await Promise.all([
        api.courier.getProfile(),
        api.courier.getDeliveries('active'),
        api.courier.getAvailable(),
        api.courier.getDeliveries('delivered'),
      ]);

      if (profileRes.success) setProfileData(profileRes.data);
      if (activeRes.success) setActiveDeliveries(activeRes.data.deliveries || []);
      if (availableRes.success) setAvailableDeliveries(availableRes.data.deliveries || []);
      if (completedRes.success) setCompletedDeliveries(completedRes.data.deliveries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (role === 'courier' || role === 'admin')) {
      loadCourierData();
    }
  }, [isAuthenticated, role]);

  const handleToggleAvailability = async () => {
    try {
      const current = profileData?.courier?.is_available;
      const res = await api.courier.toggleAvailability(!current);
      if (res.success) {
        setProfileData((prev) => ({
          ...prev,
          courier: {
            ...prev.courier,
            is_available: res.data.is_available,
          },
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle availability.');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      await api.courier.accept(orderId);
      await loadCourierData();
    } catch (err) {
      alert(err.message || 'Failed to accept order');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openStatusModal = (delivery, nextStatus) => {
    setSelectedDelivery(delivery);
    setTargetStatus(nextStatus);

    let defaultLoc = `${delivery.pickup_city} Distribution Checkpoint`;
    let defaultNote = '';

    if (nextStatus === 'picked_up') {
      defaultLoc = `${delivery.pickup_address}, ${delivery.pickup_city}`;
      defaultNote = 'Parcel collected directly from sender in good condition.';
    } else if (nextStatus === 'in_transit') {
      defaultLoc = 'Central Highway Transit Hub';
      defaultNote = 'Sorted and en route to destination sector.';
    } else if (nextStatus === 'out_for_delivery') {
      defaultLoc = `${delivery.delivery_city} Local Delivery Run`;
      defaultNote = 'Courier is out on the final delivery leg to the recipient address.';
    } else if (nextStatus === 'delivered') {
      defaultLoc = `${delivery.delivery_address}, ${delivery.delivery_city}`;
      defaultNote = 'Parcel securely delivered and handed to recipient.';
    }

    setCheckpointLocation(defaultLoc);
    setCheckpointNotes(defaultNote);
    setModalOpen(true);
  };

  const handleConfirmStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedDelivery || !targetStatus) return;

    try {
      setActionLoadingId(selectedDelivery.id);
      await api.courier.updateStatus(selectedDelivery.id, {
        status: targetStatus,
        location: checkpointLocation,
        notes: checkpointNotes,
      });
      setModalOpen(false);
      await loadCourierData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const isOnline = Boolean(profileData?.courier?.is_available);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Courier Header with Fleet Switch */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 font-bold text-xl">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-orange-600">
                Delivery Module
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOnline
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isOnline ? 'Online / Accepting Jobs' : 'Offline'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">
              Courier {user?.full_name}
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
              <span>
                Vehicle: <strong>{profileData?.courier?.vehicle_type}</strong> (
                {profileData?.courier?.vehicle_plate})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {profileData?.stats?.rating || '4.90'} Rating
              </span>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <button
          onClick={handleToggleAvailability}
          className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
            isOnline
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
          }`}
        >
          <Power className={`w-4 h-4 ${isOnline ? 'text-emerald-600' : 'text-slate-500'}`} />
          <span>{isOnline ? 'Status: Available (Click to Go Offline)' : 'Status: Offline (Click to Go Online)'}</span>
        </button>
      </div>

      {/* Courier Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Deliveries
          </div>
          <div className="text-3xl font-black text-orange-600">
            {profileData?.stats?.activeDeliveries ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">Currently assigned runs</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available in Zone
          </div>
          <div className="text-3xl font-black text-brand-600">
            {availableDeliveries.length}
          </div>
          <div className="text-[11px] text-slate-400">Unassigned pickups</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Completed Deliveries
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {profileData?.stats?.completedDeliveries ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">Lifetime parcels delivered</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Delivered Value
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            ${(profileData?.stats?.totalRevenueDelivered ?? 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Total freight handled</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3.5 transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'active'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>My Active Deliveries</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700">
            {activeDeliveries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3.5 transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'available'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Available for Pickup</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-brand-100 text-brand-700">
            {availableDeliveries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3.5 transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'completed'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Delivered History</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
            {completedDeliveries.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {isLoading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading courier deliveries...
        </div>
      ) : activeTab === 'active' ? (
        /* 1. Active Deliveries */
        activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-slate-800">No active deliveries assigned</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any pending delivery runs. Check the &ldquo;Available for Pickup&rdquo; tab to claim new jobs!
            </p>
            <button
              onClick={() => setActiveTab('available')}
              className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl"
            >
              View Available Pickups
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-slate-900">
                      {delivery.tracking_number}
                    </span>
                    <StatusBadge status={delivery.status} size="sm" />
                  </div>

                  {/* Sender & Recipient addresses */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Pickup (Sender)
                      </span>
                      <div className="font-bold text-slate-800">{delivery.pickup_name}</div>
                      <div className="text-slate-500">{delivery.pickup_phone}</div>
                      <div className="text-slate-600 mt-1">{delivery.pickup_address}</div>
                      <div className="text-slate-600">{delivery.pickup_city}</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Deliver To (Recipient)
                      </span>
                      <div className="font-bold text-slate-800">{delivery.delivery_name}</div>
                      <div className="text-slate-500">{delivery.delivery_phone}</div>
                      <div className="text-slate-600 mt-1">{delivery.delivery_address}</div>
                      <div className="text-slate-600">{delivery.delivery_city}</div>
                    </div>
                  </div>

                  {/* Parcel Details */}
                  <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                    <span>
                      {delivery.parcel_type} • {delivery.weight_kg} kg
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      Fee: ${parseFloat(delivery.total_price).toFixed(2)}
                    </span>
                  </div>

                  {delivery.delivery_instructions && (
                    <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                      <strong>Notes:</strong> {delivery.delivery_instructions}
                    </div>
                  )}
                </div>

                {/* Status Advancement Action Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    href={`/track?id=${delivery.tracking_number}`}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    View Timeline &rarr;
                  </Link>

                  {delivery.status === 'assigned' && (
                    <button
                      onClick={() => openStatusModal(delivery, 'picked_up')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Package className="w-4 h-4" />
                      <span>Confirm Pickup</span>
                    </button>
                  )}

                  {delivery.status === 'picked_up' && (
                    <button
                      onClick={() => openStatusModal(delivery, 'in_transit')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Depart to Transit Hub</span>
                    </button>
                  )}

                  {delivery.status === 'in_transit' && (
                    <button
                      onClick={() => openStatusModal(delivery, 'out_for_delivery')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Out for Delivery</span>
                    </button>
                  )}

                  {delivery.status === 'out_for_delivery' && (
                    <button
                      onClick={() => openStatusModal(delivery, 'delivered')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Delivered</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'available' ? (
        /* 2. Available for Pickup */
        availableDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-base font-bold text-slate-800">All caught up!</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no pending orders waiting for courier pickup in the logistics pool.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-slate-900">
                    {delivery.tracking_number}
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Pending Dispatch
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Route:</span>
                    <span className="font-bold text-slate-800">
                      {delivery.pickup_city} &rarr; {delivery.delivery_city}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parcel:</span>
                    <span className="text-slate-800 font-semibold">
                      {delivery.parcel_type} ({delivery.weight_kg} kg)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service:</span>
                    <span className="font-bold capitalize text-brand-600">
                      {delivery.priority}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Freight Total:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      ${parseFloat(delivery.total_price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  disabled={actionLoadingId === delivery.id}
                  onClick={() => handleAcceptOrder(delivery.id)}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  {actionLoadingId === delivery.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Accept Delivery Run</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* 3. Completed Deliveries History */
        completedDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-800">No completed deliveries yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 font-bold">
                  <tr>
                    <th className="py-3 px-6">Tracking Number</th>
                    <th className="py-3 px-6">Destination</th>
                    <th className="py-3 px-6">Recipient</th>
                    <th className="py-3 px-6">Parcel Type</th>
                    <th className="py-3 px-6">Delivered Date</th>
                    <th className="py-3 px-6 text-right">Freight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                        <Link
                          href={`/track?id=${delivery.tracking_number}`}
                          className="text-brand-600 hover:underline"
                        >
                          {delivery.tracking_number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        {delivery.delivery_city}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{delivery.delivery_name}</td>
                      <td className="py-3.5 px-6 text-xs text-slate-600">
                        {delivery.parcel_type} ({delivery.weight_kg} kg)
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-500">
                        {delivery.delivered_at
                          ? new Date(delivery.delivered_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Recently'}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900">
                        ${parseFloat(delivery.total_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Checkpoint Status Update Modal */}
      {modalOpen && selectedDelivery && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 space-y-5">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-orange-600">
                Courier Status Progression
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Advance Status to: &lsquo;{targetStatus.replace(/_/g, ' ')}&rsquo;
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Tracking: {selectedDelivery.tracking_number}
              </p>
            </div>

            <form onSubmit={handleConfirmStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Checkpoint Location *
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <input
                    type="text"
                    required
                    value={checkpointLocation}
                    onChange={(e) => setCheckpointLocation(e.target.value)}
                    className="w-full bg-transparent focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Checkpoint Audit Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={checkpointNotes}
                  onChange={(e) => setCheckpointNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === selectedDelivery.id}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-sm shadow-orange-500/20 flex items-center justify-center gap-1.5"
                >
                  {actionLoadingId === selectedDelivery.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
