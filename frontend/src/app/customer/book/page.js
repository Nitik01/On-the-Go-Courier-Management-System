'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  MapPin,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Printer,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import ReceiptModal from '../../../components/ReceiptModal';

const PARCEL_TYPES = [
  { id: 'Document', label: 'Document & Papers', base: 10, icon: '📄' },
  { id: 'Box/Parcel', label: 'Standard Box / Parcel', base: 12, icon: '📦' },
  { id: 'Fragile/Glass', label: 'Fragile & Glassware', base: 15, icon: '🍷' },
  { id: 'Electronics', label: 'Electronics & Devices', base: 15, icon: '💻' },
  { id: 'Perishable', label: 'Perishable & Gourmet Food', base: 15, icon: '🍎' },
  { id: 'Heavy Cargo', label: 'Heavy Cargo / Freight', base: 25, icon: '🏋️' },
];

const PRIORITIES = [
  { id: 'standard', label: 'Standard Ground', fee: 0, days: '3 - 4 Days', desc: 'Economical and reliable' },
  { id: 'express', label: 'Express Priority', fee: 8, days: '1 - 2 Days', desc: 'Fast scheduled delivery' },
  { id: 'overnight', label: 'Overnight Rush', fee: 15, days: 'Next Morning', desc: 'Immediate dispatch' },
];

export default function BookParcelPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Sender (Pickup)
    pickup_name: user?.full_name || '',
    pickup_phone: user?.phone || '',
    pickup_address: user?.address || '',
    pickup_city: user?.city || 'New York',
    pickup_postal_code: user?.postal_code || '10001',

    // Recipient (Delivery)
    delivery_name: '',
    delivery_phone: '',
    delivery_address: '',
    delivery_city: 'Brooklyn',
    delivery_postal_code: '11201',
    delivery_instructions: '',

    // Parcel
    parcel_type: 'Box/Parcel',
    weight_kg: 2.5,
    dimensions: '30x20x15 cm',
    description: '',
    declared_value: 100,
    priority: 'standard',

    // Payment simulation
    card_number: '•••• •••• •••• 4242',
    card_expiry: '12/28',
    card_cvv: '921',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Dynamic Live Price Calculation
  const selectedType = PARCEL_TYPES.find((t) => t.id === formData.parcel_type) || PARCEL_TYPES[1];
  const selectedPriority = PRIORITIES.find((p) => p.id === formData.priority) || PRIORITIES[0];
  const weight = Math.max(0.1, parseFloat(formData.weight_kg) || 1.0);

  const baseFee = selectedType.base;
  const weightFee = Math.round(weight * 2.0 * 100) / 100;
  const priorityFee = selectedPriority.fee;
  const totalPrice = Math.round((baseFee + weightFee + priorityFee) * 100) / 100;

  const handleSubmitOrder = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.orders.create({
        ...formData,
        weight_kg: weight,
      });

      if (res.success && res.data) {
        setCreatedOrder(res.data.order);
        setStep(5); // Success step
      }
    } catch (err) {
      setError(err.message || 'Failed to book parcel delivery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Step Indicator Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Parcel Booking Service
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Dispatch a Shipment
            </h1>
          </div>
          {step <= 4 && (
            <div className="text-xs font-semibold text-slate-500">
              Step <span className="text-brand-600 font-bold">{step}</span> of 4
            </div>
          )}
        </div>

        {step <= 4 && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, title: 'Pickup' },
              { num: 2, title: 'Destination' },
              { num: 3, title: 'Parcel Details' },
              { num: 4, title: 'Payment & Confirm' },
            ].map((s) => (
              <div key={s.num} className="space-y-1.5">
                <div
                  className={`h-2 rounded-full transition-all ${
                    step >= s.num ? 'bg-brand-600' : 'bg-slate-100'
                  }`}
                />
                <span
                  className={`text-[11px] font-bold block truncate ${
                    step === s.num ? 'text-brand-600' : 'text-slate-400'
                  }`}
                >
                  {s.num}. {s.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl">
          {error}
        </div>
      )}

      {/* Main Layout: Form (Left) & Dynamic Pricing Breakdown (Right) */}
      {step <= 4 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Step Form Box */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            {/* STEP 1: Pickup / Origin */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2 text-brand-600 font-bold text-sm">
                  <MapPin className="w-5 h-5" />
                  <h3>Sender & Pickup Location</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sender Contact Name *
                    </label>
                    <input
                      type="text"
                      name="pickup_name"
                      required
                      value={formData.pickup_name}
                      onChange={handleChange}
                      placeholder="e.g. John Smith"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sender Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="pickup_phone"
                      required
                      value={formData.pickup_phone}
                      onChange={handleChange}
                      placeholder="+1 555-019-2831"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pickup Street Address *
                  </label>
                  <input
                    type="text"
                    name="pickup_address"
                    required
                    value={formData.pickup_address}
                    onChange={handleChange}
                    placeholder="742 Evergreen Terrace"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="pickup_city"
                      required
                      value={formData.pickup_city}
                      onChange={handleChange}
                      placeholder="New York"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="pickup_postal_code"
                      required
                      value={formData.pickup_postal_code}
                      onChange={handleChange}
                      placeholder="10001"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Delivery / Destination */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <MapPin className="w-5 h-5" />
                  <h3>Recipient & Delivery Destination</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      name="delivery_name"
                      required
                      value={formData.delivery_name}
                      onChange={handleChange}
                      placeholder="e.g. Alice Cooper"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="delivery_phone"
                      required
                      value={formData.delivery_phone}
                      onChange={handleChange}
                      placeholder="+1 555-321-7788"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Street Address *
                  </label>
                  <input
                    type="text"
                    name="delivery_address"
                    required
                    value={formData.delivery_address}
                    onChange={handleChange}
                    placeholder="500 Atlantic Ave, Apt 4B"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="delivery_city"
                      required
                      value={formData.delivery_city}
                      onChange={handleChange}
                      placeholder="Brooklyn"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="delivery_postal_code"
                      required
                      value={formData.delivery_postal_code}
                      onChange={handleChange}
                      placeholder="11217"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    name="delivery_instructions"
                    value={formData.delivery_instructions}
                    onChange={handleChange}
                    placeholder="e.g. Ring reception buzzer 102; leave with front desk if absent."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Parcel Details */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                  <Package className="w-5 h-5" />
                  <h3>Parcel Specifications & Priority</h3>
                </div>

                {/* Parcel category selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select Parcel Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PARCEL_TYPES.map((type) => (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setFormData({ ...formData, parcel_type: type.id })}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          formData.parcel_type === type.id
                            ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{type.icon}</span>
                        <div className="font-bold text-xs text-slate-900">{type.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Base rate: ${type.base}.00
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight & Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Weight in Kilograms *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="200"
                      name="weight_kg"
                      required
                      value={formData.weight_kg}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <span className="text-[10px] text-slate-400">Rate: +$2.00 / kg</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dimensions (LxWxH)
                    </label>
                    <input
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleChange}
                      placeholder="e.g. 30x20x15 cm"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Declared Value ($)
                    </label>
                    <input
                      type="number"
                      name="declared_value"
                      value={formData.declared_value}
                      onChange={handleChange}
                      placeholder="100.00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Delivery Speed & Priority
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PRIORITIES.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setFormData({ ...formData, priority: p.id })}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          formData.priority === p.id
                            ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{p.label}</span>
                          <span className="text-[11px] font-mono font-bold text-brand-600">
                            {p.fee === 0 ? 'FREE' : `+$${p.fee}.00`}
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-600 mt-1">
                          {p.days}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Payment Simulation */}
            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CreditCard className="w-5 h-5" />
                  <h3>Payment Simulation & Final Order Confirmation</h3>
                </div>

                {/* Summary snapshot */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 font-semibold block">Origin:</span>
                      <span className="font-bold text-slate-800">
                        {formData.pickup_name} ({formData.pickup_city})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Destination:</span>
                      <span className="font-bold text-slate-800">
                        {formData.delivery_name} ({formData.delivery_city})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-400 font-semibold block">Category:</span>
                      <span className="font-bold text-slate-800">{formData.parcel_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Weight:</span>
                      <span className="font-bold text-slate-800">{weight} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold block">Priority:</span>
                      <span className="font-bold text-slate-800 capitalize">
                        {formData.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mock Card Form */}
                <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-4">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Simulated Test Payment Gateway</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.card_number}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        disabled
                        value={formData.card_expiry}
                        className="w-full px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        disabled
                        value={formData.card_cvv}
                        className="w-full px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) {
                      if (!formData.pickup_name || !formData.pickup_phone || !formData.pickup_address) {
                        setError('Please complete all required pickup details.');
                        return;
                      }
                    }
                    if (step === 2) {
                      if (!formData.delivery_name || !formData.delivery_phone || !formData.delivery_address) {
                        setError('Please complete all recipient details.');
                        return;
                      }
                    }
                    setError('');
                    setStep(step + 1);
                  }}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm shadow-brand-500/20 flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitOrder}
                  className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Pay ${totalPrice.toFixed(2)}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Live Pricing Breakdown Sidebar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <DollarSign className="w-4 h-4 text-brand-600" />
              <span>Live Price Calculation</span>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-2">
                <span className="text-slate-600">Base Freight Rate:</span>
                <span className="font-mono font-bold text-slate-800">
                  ${baseFee.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <div>
                  <span className="text-slate-600 block">Weight Surcharge:</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {weight} kg &times; $2.00
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-800">
                  ${weightFee.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <div>
                  <span className="text-slate-600 block capitalize">
                    {selectedPriority.label}:
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {selectedPriority.days}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-800">
                  ${priorityFee.toFixed(2)}
                </span>
              </div>

              <div className="pt-4 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-slate-900">Total Price:</span>
                <span className="font-mono text-2xl font-black text-brand-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-brand-50/60 rounded-xl text-[11px] text-brand-900 space-y-1 border border-brand-100">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Transparent Pricing
              </div>
              <p className="text-slate-600">
                All rates include standard cargo insurance coverage up to declared parcel value.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 5: Booking Success Confirmation */
        <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">
              Parcel Booked Successfully!
            </h2>
            <p className="text-xs text-slate-500">
              Your shipment is registered and awaiting dispatch assignment to a local courier.
            </p>
          </div>

          {/* Tracking Number Pill */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Tracking Number
            </span>
            <div className="font-mono text-2xl font-black text-brand-700 tracking-wider">
              {createdOrder?.tracking_number}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setReceiptOpen(true)}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Waybill Receipt</span>
            </button>

            <Link
              href={`/track?id=${createdOrder?.tracking_number}`}
              className="py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Track in Real-Time</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/customer/orders"
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              &larr; Return to Customer Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Waybill Modal */}
      <ReceiptModal
        order={createdOrder}
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />
    </div>
  );
}
