'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Truck,
  Package,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  TrendingUp,
  Users,
  Database,
  BarChart3,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const [trackingInput, setTrackingInput] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const [demoLoading, setDemoLoading] = useState('');

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    router.push(`/track?id=${encodeURIComponent(trackingInput.trim())}`);
  };

  const handleQuickDemoLogin = async (role, email, pass, redirectPath) => {
    try {
      setDemoLoading(role);
      await login(email, pass);
      router.push(redirectPath);
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading('');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-slate-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Glow circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-24 right-10 w-96 h-96 bg-courier-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/20 text-brand-300 text-xs font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            Next-Gen Courier Management & Dispatch Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Seamless Parcel Booking,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-sky-300 to-courier-400">
              Live Fleet Tracking
            </span>{' '}
            & Operations
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            A full-stack logistics platform linking customers, couriers, and administrators through an integrated REST API, dynamic Next.js dashboards, and a normalised PostgreSQL database.
          </p>

          {/* Instant Tracking Search Input Box */}
          <div className="max-w-2xl mx-auto pt-4">
            <form
              onSubmit={handleTrack}
              className="bg-white/10 backdrop-blur-md p-2 sm:p-2.5 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 flex items-center gap-3 px-3 py-2 text-slate-200">
                <Search className="w-5 h-5 text-brand-400 shrink-0" />
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter tracking code (e.g. OTG-202611-94812)..."
                  className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Track Shipment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Tracking Pills */}
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400">
              <span>Try sample parcels:</span>
              <button
                onClick={() => setTrackingInput('OTG-202611-94812')}
                className="hover:text-white underline font-mono text-brand-300 transition-colors"
              >
                OTG-202611-94812 (Delivered)
              </button>
              <span>•</span>
              <button
                onClick={() => setTrackingInput('OTG-202611-82014')}
                className="hover:text-white underline font-mono text-orange-300 transition-colors"
              >
                OTG-202611-82014 (Out for Delivery)
              </button>
              <span>•</span>
              <button
                onClick={() => setTrackingInput('OTG-202611-73921')}
                className="hover:text-white underline font-mono text-purple-300 transition-colors"
              >
                OTG-202611-73921 (In Transit)
              </button>
            </div>
          </div>

          {/* Quick Demo Persona Sign-In Buttons */}
          <div className="pt-6 border-t border-slate-800/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Explore Role Portals Instantly (1-Click Demo Login)
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() =>
                  handleQuickDemoLogin(
                    'admin',
                    'admin@onthego.com',
                    'Admin@123',
                    '/admin'
                  )
                }
                disabled={!!demoLoading}
                className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-semibold transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                {demoLoading === 'admin' ? 'Logging in...' : 'Sign In as Administrator'}
              </button>

              <button
                onClick={() =>
                  handleQuickDemoLogin(
                    'courier',
                    'courier.alex@onthego.com',
                    'Courier@123',
                    '/courier'
                  )
                }
                disabled={!!demoLoading}
                className="px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 text-orange-200 text-xs font-semibold transition-all flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-orange-400" />
                {demoLoading === 'courier' ? 'Logging in...' : 'Sign In as Courier'}
              </button>

              <button
                onClick={() =>
                  handleQuickDemoLogin(
                    'customer',
                    'customer.john@example.com',
                    'Customer@123',
                    '/customer'
                  )
                }
                disabled={!!demoLoading}
                className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-200 text-xs font-semibold transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-blue-400" />
                {demoLoading === 'customer' ? 'Logging in...' : 'Sign In as Customer'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Value Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pt-4 md:pt-0">
            <div className="text-3xl font-extrabold text-slate-900">99.8%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              On-Time Delivery Rate
            </div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-3xl font-extrabold text-brand-600">3NF</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Normalised Relational SQL
            </div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-3xl font-extrabold text-orange-600">&lt; 15s</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Dispatch Turnaround
            </div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-3xl font-extrabold text-emerald-600">100%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              End-to-End Audit Trail
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Core Pillars (Customer, Courier, Admin) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600">
            End-to-End Delivery Ecosystem
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900">
            Three Specialized Modules in One United Platform
          </h3>
          <p className="text-sm text-slate-600">
            Designed to digitise each stage of the courier supply chain with role-specific interfaces and real-time synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Customer Module */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Customer Module</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Streamlined parcel booking wizard with live fee calculators, interactive tracking timelines, order history, and printable waybills.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Self-service parcel booking with dimension & weight calculations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Real-time checkpoint tracking & simulated GPS corridor
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Order cancellation & courier feedback review system
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/customer/book"
                className="text-sm font-bold text-brand-600 group-hover:text-brand-700 flex items-center gap-1.5"
              >
                <span>Book a Delivery</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Delivery Module */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Delivery Module</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dedicated driver portal for couriers to claim unassigned packages, manage active runs, and advance delivery checkpoints from pending to delivered.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  One-tap order pickup acceptance from available pool
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Step-by-step lifecycle status updates & checkpoint notes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Fleet availability switch (Online / Offline status)
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/courier"
                className="text-sm font-bold text-orange-600 group-hover:text-orange-700 flex items-center gap-1.5"
              >
                <span>Courier Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: Administrator Dashboard */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Administrator Dashboard</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Central command center offering full operational oversight: manual and auto-dispatch, fleet load balancing, user security, and summary reporting.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Real-time KPI metrics & financial revenue analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  Courier workload assignment and fleet performance monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  User role management & executive CSV report exports
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                href="/admin"
                className="text-sm font-bold text-purple-600 group-hover:text-purple-700 flex items-center gap-1.5"
              >
                <span>Open Operations Command</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Technical Architecture Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-brand-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
              Full-Stack Architecture & Engineering
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Demonstrated Software Engineering Skills
            </h3>
            <p className="text-sm text-slate-300">
              Built following industry standards for component-based UI, REST API design, relational normalisation, and secure role-based access control.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-xs p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
                <Database className="w-4 h-4" /> Relational SQL (3NF)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Normalised PostgreSQL database schema with strict foreign keys, check constraints, composite views with multi-table joins, and indexing.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" /> Secure JWT & RBAC
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cryptographic bcrypt hashing, stateless JSON Web Tokens, and middleware enforcing customer, courier, and administrator boundaries.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <BarChart3 className="w-4 h-4" /> Express REST API
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clean resource-oriented REST endpoints with uniform responses, parameter validation, rate limiting, and structured error handling.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xs p-5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                <Layers className="w-4 h-4" /> Next.js & React UI
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Component-based frontend with state management, interactive tracking maps, booking fee calculators, and responsive Tailwind layouts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
