'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Search,
  Loader2,
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function AdminCouriersPage() {
  const { isAuthenticated, isLoading: authLoading, role } = useAuth();
  const router = useRouter();

  const [couriers, setCouriers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push('/login');
      else if (role !== 'admin') router.push('/');
    }
  }, [authLoading, isAuthenticated, role, router]);

  const loadCouriers = async () => {
    try {
      setIsLoading(true);
      const res = await api.admin.getAllCouriers();
      if (res.success) {
        setCouriers(res.data.couriers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      loadCouriers();
    }
  }, [isAuthenticated, role]);

  const filtered = couriers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicle_type?.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicle_plate?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-600">
            Fleet Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Couriers Roster & Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Overview of driver personnel, vehicles, ratings, and active delivery load.
          </p>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search driver, vehicle..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      {/* Couriers Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading fleet roster...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{c.full_name}</h3>
                    <div className="text-xs text-slate-400 font-mono">
                      License: {c.license_number}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    c.is_available
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {c.is_available ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Vehicle & Zone details */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="font-semibold">{c.vehicle_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Plate Number:</span>
                  <span className="font-mono font-bold">{c.vehicle_plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Operational Hub:</span>
                  <span>{c.current_city}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Rating</div>
                  <div className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{parseFloat(c.rating || 5).toFixed(1)}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Completed</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {c.total_deliveries}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Active Load</div>
                  <div className="text-sm font-bold text-orange-600 mt-0.5">
                    {c.active_load} runs
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{c.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1 truncate max-w-[150px]">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
