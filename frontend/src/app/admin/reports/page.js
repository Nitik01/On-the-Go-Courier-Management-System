'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  Download,
  Printer,
  TrendingUp,
  Star,
  CheckCircle2,
  DollarSign,
  Package,
  Truck,
  Loader2,
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function AdminReportsPage() {
  const { isAuthenticated, isLoading: authLoading, role } = useAuth();
  const router = useRouter();

  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push('/login');
      else if (role !== 'admin') router.push('/');
    }
  }, [authLoading, isAuthenticated, role, router]);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      const res = await api.admin.getReports();
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      loadReport();
    }
  }, [isAuthenticated, role]);

  const handleExportCSV = () => {
    if (!reportData?.topCouriers) return;

    let csv = 'Courier Name,Vehicle,Rating,Total Deliveries,Delivered Revenue\n';
    reportData.topCouriers.forEach((c) => {
      csv += `"${c.full_name}","${c.vehicle_type}",${c.rating},${c.total_deliveries},${c.delivered_revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Courier_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-600">
            Analytics & Auditing
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Operational Summary & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated operational reports, revenue metrics, and courier performance leaderboards.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Compiling summary reports...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Status Breakdown Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Shipment Volumes & Financial Billing by Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {reportData?.byStatus?.map((item) => (
                <div
                  key={item.status}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 capitalize">
                    {item.status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-xl font-black text-slate-900 font-mono">
                    {item.count} Parcels
                  </div>
                  <div className="text-xs text-purple-700 font-bold font-mono">
                    ${parseFloat(item.total_amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier Performance Leaderboard */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Top Courier Performance Leaderboard
                </h3>
                <p className="text-xs text-slate-400">
                  Ranking drivers by completed deliveries, customer ratings, and freight value
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 font-bold">
                  <tr>
                    <th className="py-3 px-6">Rank</th>
                    <th className="py-3 px-6">Courier Driver</th>
                    <th className="py-3 px-6">Vehicle Type</th>
                    <th className="py-3 px-6">Customer Rating</th>
                    <th className="py-3 px-6">Completed Deliveries</th>
                    <th className="py-3 px-6 text-right">Delivered Freight Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData?.topCouriers?.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 font-mono font-bold text-purple-700">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-slate-900">{c.full_name}</td>
                      <td className="py-3.5 px-6 text-xs text-slate-600">{c.vehicle_type}</td>
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {parseFloat(c.rating).toFixed(2)} / 5.0
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        {c.total_deliveries} shipments
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900">
                        ${parseFloat(c.delivered_revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
