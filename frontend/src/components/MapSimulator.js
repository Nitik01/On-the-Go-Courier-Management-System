'use client';

import React from 'react';
import { MapPin, Navigation, Truck, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function MapSimulator({
  pickupCity = 'Origin Hub',
  deliveryCity = 'Destination',
  status = 'in_transit',
  courierName = null,
  vehicle = null,
}) {
  // Determine vehicle position percentage based on status
  let progress = 10;
  if (status === 'assigned') progress = 20;
  if (status === 'picked_up') progress = 35;
  if (status === 'in_transit') progress = 65;
  if (status === 'out_for_delivery') progress = 88;
  if (status === 'delivered') progress = 100;
  if (status === 'cancelled') progress = 0;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-brand-400">
              Live Route Telemetry
            </span>
          </div>
          <h4 className="text-lg font-bold text-white mt-0.5">
            {pickupCity} &rarr; {deliveryCity}
          </h4>
        </div>

        {courierName && (
          <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Assigned Courier</div>
              <div className="text-sm font-semibold text-white">
                {courierName} {vehicle ? `(${vehicle})` : ''}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual GPS Path */}
      <div className="relative py-12 px-4 z-10">
        {/* SVG Path Route */}
        <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
          {/* Active progress */}
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-orange-500 to-emerald-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Origin Pin */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center ring-4 ring-slate-900 shadow-lg">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="mt-2 text-xs font-semibold text-slate-300 whitespace-nowrap">
            {pickupCity}
          </span>
          <span className="text-[10px] text-slate-500">Origin</span>
        </div>

        {/* Courier Moving Marker */}
        {status !== 'cancelled' && progress > 0 && progress < 100 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 flex flex-col items-center"
            style={{ left: `calc(1rem + (100% - 2rem) * ${progress / 100})` }}
          >
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center ring-4 ring-orange-500/30 shadow-lg animate-pulse">
              <Navigation className="w-5 h-5 rotate-45" />
            </div>
            <span className="mt-2 text-[11px] font-bold text-orange-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-orange-500/40 whitespace-nowrap">
              In Transit
            </span>
          </div>
        )}

        {/* Destination Pin */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-slate-900 shadow-lg ${
              status === 'delivered'
                ? 'bg-emerald-500 text-white ring-emerald-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {status === 'delivered' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </div>
          <span className="mt-2 text-xs font-semibold text-slate-300 whitespace-nowrap">
            {deliveryCity}
          </span>
          <span className="text-[10px] text-slate-500">Destination</span>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="mt-8 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-400 relative z-10">
        <div>
          <span className="text-slate-500 block">Dispatch Status</span>
          <span className="font-semibold text-slate-200 capitalize">
            {status.replace(/_/g, ' ')}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">GPS Coordinates Status</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> High-Accuracy Lock
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-slate-500 block">Transit Corridor</span>
          <span className="font-semibold text-slate-200">Express Ground Network</span>
        </div>
      </div>
    </div>
  );
}
