'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, ShieldCheck, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      // Role-based redirect
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'courier') router.push('/courier');
      else router.push('/customer');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setIsLoading(true);

    try {
      const user = await login(demoEmail, demoPass);
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'courier') router.push('/courier');
      else router.push('/customer');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-slate-200/80 shadow-xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500">
            Sign in to access your courier dashboard and shipment tracking.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Buttons */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Instant Demo Sign In (1-Click)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@onthego.com', 'Admin@123')}
              className="py-2 px-1 text-center bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('courier.alex@onthego.com', 'Courier@123')}
              className="py-2 px-1 text-center bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold border border-orange-200 transition-colors"
            >
              Courier
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('customer.john@example.com', 'Customer@123')}
              className="py-2 px-1 text-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-colors"
            >
              Customer
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] text-slate-400 uppercase font-bold tracking-wider relative">
            Or Standard Credentials
          </span>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent text-sm focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-brand-600 hover:underline">
            Register as Customer or Courier
          </Link>
        </p>
      </div>
    </div>
  );
}
