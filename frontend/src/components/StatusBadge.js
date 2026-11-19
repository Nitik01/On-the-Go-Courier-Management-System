import React from 'react';
import {
  Clock,
  UserCheck,
  Package,
  Truck,
  Send,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Dispatch',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  assigned: {
    label: 'Courier Assigned',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    icon: UserCheck,
  },
  picked_up: {
    label: 'Picked Up',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    icon: Package,
  },
  in_transit: {
    label: 'In Transit',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    icon: Truck,
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    icon: Send,
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    icon: XCircle,
  },
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    icon: Clock,
  };

  const Icon = config.icon;
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1.5'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm gap-2 font-semibold'
      : 'px-2.5 py-1 text-xs gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} transition-all`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
}
