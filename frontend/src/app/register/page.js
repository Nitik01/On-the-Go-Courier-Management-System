'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, Package, Mail, Lock, User, Phone, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [role, setRole] = useState('customer'); // 'customer' or 'courier'
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    vehicle_type: 'Motorcycle',
    vehicle_plate: '',
    license_number: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await register({
        ...formData,
        role,
      });

      if (user.role === 'courier') router.push('/courier');
      else router.push('/customer');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl max-w-xl w-full p-8 border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500">
            Join On-the-Go to book shipments or deliver parcels in your area.
          </p>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'customer'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            Customer (Send Parcels)
          </button>
          <button
            type="button"
            onClick={() => setRole('courier')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'courier'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            Courier (Deliver Parcels)
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password * (min 6 characters)
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555-010-0000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="10001"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Street Name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Courier specific fields */}
          {role === 'courier' && (
            <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-orange-800">
                Courier Fleet Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Van">Delivery Van</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="Truck">Cargo Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Vehicle Plate #
                  </label>
                  <input
                    type="text"
                    name="vehicle_plate"
                    required={role === 'courier'}
                    value={formData.vehicle_plate}
                    onChange={handleChange}
                    placeholder="e.g. NY-9821"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    required={role === 'courier'}
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="e.g. DL-4029"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
              role === 'courier'
                ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20'
                : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-brand-600 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
