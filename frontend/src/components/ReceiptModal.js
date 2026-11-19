'use client';

import React from 'react';
import { X, Printer, Truck, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ReceiptModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const createdDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
        {/* Actions bar (hidden on print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
              Official Waybill & Receipt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="mt-6 space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-none">
                  On-the-Go Courier
                </h2>
                <p className="text-xs text-slate-400 mt-1">Express Logistics Network</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">Date Issued</span>
              <div className="text-xs font-semibold text-slate-700">{createdDate}</div>
            </div>
          </div>

          {/* Tracking Barcode simulation */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Tracking Number
            </div>
            <div className="font-mono text-2xl font-black text-brand-700 tracking-wider">
              {order.tracking_number}
            </div>
            {/* Visual Barcode Bars */}
            <div className="flex justify-center items-end h-9 gap-1 opacity-75">
              {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6, 4, 3, 3, 8, 3, 2, 7, 9, 5].map(
                (h, i) => (
                  <div
                    key={i}
                    className={`bg-slate-900 rounded-xs ${h % 2 === 0 ? 'w-1' : 'w-0.5'}`}
                    style={{ height: `${(h + 2) * 3}px` }}
                  />
                )
              )}
            </div>
          </div>

          {/* Sender & Recipient addresses */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sender (Origin)
              </span>
              <div className="font-bold text-slate-900">{order.pickup_name}</div>
              <div className="text-slate-600">{order.pickup_phone}</div>
              <div className="text-slate-600 mt-1">{order.pickup_address}</div>
              <div className="text-slate-600">
                {order.pickup_city}, {order.pickup_postal_code}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Recipient (Destination)
              </span>
              <div className="font-bold text-slate-900">{order.delivery_name}</div>
              <div className="text-slate-600">{order.delivery_phone}</div>
              <div className="text-slate-600 mt-1">{order.delivery_address}</div>
              <div className="text-slate-600">
                {order.delivery_city}, {order.delivery_postal_code}
              </div>
            </div>
          </div>

          {/* Parcel Specification */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Weight</th>
                  <th className="p-2.5">Priority</th>
                  <th className="p-2.5 text-right">Declared Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2.5 font-medium">{order.parcel_type}</td>
                  <td className="p-2.5">{order.weight_kg} kg</td>
                  <td className="p-2.5 capitalize">{order.priority}</td>
                  <td className="p-2.5 text-right font-mono">
                    ${parseFloat(order.declared_value || 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Itemized Financial Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Base Freight Handling Fee:</span>
              <span className="font-mono">${parseFloat(order.base_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Weight Surcharge ({order.weight_kg} kg):</span>
              <span className="font-mono">${parseFloat(order.weight_fee).toFixed(2)}</span>
            </div>
            {parseFloat(order.priority_fee) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span className="capitalize">{order.priority} Express Fee:</span>
                <span className="font-mono">${parseFloat(order.priority_fee).toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
              <span>Total Paid:</span>
              <span className="font-mono text-brand-700">
                ${parseFloat(order.total_price).toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Verification stamp */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Payment Confirmed & Verified</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cryptographically Secured Waybill</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
