'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  Users,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  BarChart3,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, role } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push('/login');
      else if (role !== 'admin') router.push('/');
    }
  }, [authLoading, isAuthenticated, role, router]);

  const loadAdminDashboard = async () => {
    try {
      setIsLoading(true);
      const [statsRes, analyticsRes, ordersRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getAnalytics(),
        api.admin.getAllOrders({ limit: 5 }),
      ]);

      if (statsRes.success) setStats(statsRes.data.metrics);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (ordersRes.success) setRecentOrders(ordersRes.data.orders.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      loadAdminDashboard();
    }
  }, [isAuthenticated, role]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-purple-600">
              Operations Control
            </span>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
              Root Administrator
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Logistics Management Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global operational overview of courier fleet, orders dispatch, revenue, and customer metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Manage Orders</span>
          </Link>
          <Link
            href="/admin/couriers"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            <span>Fleet Roster</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading operational statistics...
        </div>
      ) : (
        <>
          {/* Key Performance Indicators (KPIs) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Orders
              </span>
              <div className="text-2xl font-black text-slate-900">{stats?.totalOrders ?? 0}</div>
              <div className="text-[10px] text-slate-400">All-time bookings</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                Pending Dispatch
              </span>
              <div className="text-2xl font-black text-amber-600">
                {stats?.pendingOrders ?? 0}
              </div>
              <div className="text-[10px] text-slate-400">Needs assignment</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                In Transit
              </span>
              <div className="text-2xl font-black text-orange-600">
                {stats?.activeOrders ?? 0}
              </div>
              <div className="text-[10px] text-slate-400">Active courier runs</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                Delivered
              </span>
              <div className="text-2xl font-black text-emerald-600">
                {stats?.deliveredOrders ?? 0}
              </div>
              <div className="text-[10px] text-slate-400">Fulfilled parcels</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-500">
                Active Fleet
              </span>
              <div className="text-2xl font-black text-purple-600">
                {stats?.availableCouriers ?? 0}{' '}
                <span className="text-xs font-normal text-slate-400">
                  / {stats?.totalCouriers ?? 0}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Online couriers</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-500">
                Total Revenue
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                ${(stats?.totalRevenue ?? 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">Gross parcel billings</div>
            </div>
          </div>

          {/* Analytics Charts & Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Breakdown Bar Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Shipment Lifecycle Distribution
                  </h3>
                  <p className="text-xs text-slate-400">Breakdown of parcels by current workflow state</p>
                </div>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>

              <div className="space-y-4">
                {analytics?.byStatus?.map((item) => {
                  const percentage =
                    stats?.totalOrders > 0
                      ? Math.round((parseInt(item.count, 10) / stats.totalOrders) * 100)
                      : 0;

                  return (
                    <div key={item.status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} size="sm" />
                          <span className="text-slate-400">({item.count} parcels)</span>
                        </div>
                        <span className="font-mono font-bold text-slate-800">
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Priority Tiers</h3>
                <p className="text-xs text-slate-400">Customer booking speed selections</p>
              </div>

              <div className="space-y-4">
                {analytics?.byPriority?.map((p) => (
                  <div
                    key={p.priority}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 capitalize">
                        {p.priority}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {p.priority === 'overnight'
                          ? 'Next Day Priority'
                          : p.priority === 'express'
                          ? '1-2 Days Speed'
                          : 'Standard Ground'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-purple-700 font-mono">
                        {p.count}
                      </div>
                      <span className="text-[10px] text-slate-400">Orders</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/admin/users"
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center justify-between"
                >
                  <span>Manage {stats?.totalCustomers ?? 0} Customers & Couriers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/admin/reports"
                  className="text-xs font-bold text-slate-600 hover:underline flex items-center justify-between"
                >
                  <span>Generate Executive Summary Report</span>
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Orders with Quick Assign CTA */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Shipments Dispatch</h3>
                <p className="text-xs text-slate-400">Real-time order feed</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 font-bold">
                  <tr>
                    <th className="py-3 px-6">Tracking Number</th>
                    <th className="py-3 px-6">Customer</th>
                    <th className="py-3 px-6">Destination</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Assigned Courier</th>
                    <th className="py-3 px-6 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                        <Link
                          href={`/track?id=${o.tracking_number}`}
                          className="text-brand-600 hover:underline"
                        >
                          {o.tracking_number}
                        </Link>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-slate-800">{o.customer_name}</div>
                        <div className="text-[11px] text-slate-400">{o.customer_email}</div>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-600">
                        {o.delivery_city}
                      </td>
                      <td className="py-3.5 px-6">
                        <StatusBadge status={o.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-6 text-xs">
                        {o.courier_name ? (
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-orange-500" />
                            {o.courier_name}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-sm">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900">
                        ${parseFloat(o.total_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
