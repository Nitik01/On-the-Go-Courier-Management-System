import React from 'react';
import {
  Clock,
  UserCheck,
  Package,
  Truck,
  Send,
  CheckCircle2,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const STAGES = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'assigned', label: 'Assigned', icon: UserCheck },
  { key: 'picked_up', label: 'Picked Up', icon: Package },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Send },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const STAGE_ORDER = {
  pending: 0,
  assigned: 1,
  picked_up: 2,
  in_transit: 3,
  out_for_delivery: 4,
  delivered: 5,
  cancelled: -1,
};

export default function TrackingTimeline({ currentStatus, events = [] }) {
  const isCancelled = currentStatus === 'cancelled';
  const currentStageIndex = STAGE_ORDER[currentStatus] ?? 0;

  return (
    <div className="space-y-8">
      {/* 1. Horizontal Progression Steps */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          Delivery Status Progression
        </h3>

        {isCancelled ? (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Shipment Cancelled</div>
              <div className="text-xs text-rose-600">
                This shipment was cancelled and delivery operations have been terminated.
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Progress line */}
            <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 z-0">
              <div
                className="h-full bg-brand-600 transition-all duration-500"
                style={{
                  width: `${(Math.max(0, currentStageIndex) / (STAGES.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Stepper nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
              {STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div
                    key={stage.key}
                    className="flex flex-col items-center text-center space-y-2"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-100 scale-110 shadow-md shadow-brand-500/20'
                          : isPassed
                          ? 'bg-brand-600 text-white'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div
                        className={`text-xs font-semibold ${
                          isCurrent
                            ? 'text-brand-600'
                            : isPassed
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {stage.label}
                      </div>
                      {isCurrent && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-sm">
                          Current Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Checkpoint History Audit Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-slate-900">
            Real-time Activity & Checkpoint Log
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {events.length} {events.length === 1 ? 'Event' : 'Events'} Logged
          </span>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            No activity events recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {events.map((event, idx) => {
              const date = new Date(event.created_at);
              const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={event.id || idx} className="relative group">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                      idx === events.length - 1
                        ? 'bg-brand-600 ring-4 ring-brand-100'
                        : 'bg-slate-400'
                    }`}
                  />

                  <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors p-4 rounded-xl border border-slate-200/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={event.status} size="sm" />
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-500" />
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {event.notes}
                    </p>

                    {event.logged_by_name && (
                      <div className="mt-2 text-[11px] text-slate-400 font-medium">
                        Checkpoint recorded by: {event.logged_by_name}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
