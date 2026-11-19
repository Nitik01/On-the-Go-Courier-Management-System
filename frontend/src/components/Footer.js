import React from 'react';
import Link from 'next/link';
import { Truck, ShieldCheck, Database, Layers, GitBranch, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">On-the-Go Courier</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-stack logistics management platform digitising courier operations with real-time parcel booking, automated dispatch, GPS route tracking, and administrative control.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API & Database Services Healthy
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  Public Parcel Tracking
                </Link>
              </li>
              <li>
                <Link href="/customer/book" className="hover:text-white transition-colors">
                  Book Parcel Delivery
                </Link>
              </li>
              <li>
                <Link href="/customer/orders" className="hover:text-white transition-colors">
                  Customer Order History
                </Link>
              </li>
              <li>
                <Link href="/courier" className="hover:text-white transition-colors">
                  Courier Delivery Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Operations Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Tech */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4">Technologies</h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300">Next.js & React</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300">Node.js Express</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300">PostgreSQL (3NF)</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300">REST APIs</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300">JWT & RBAC</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300">Tailwind CSS</span>
            </div>
          </div>

          {/* Col 4: Demo Credentials */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" /> Demo Accounts
            </h4>
            <p className="text-[11px] text-slate-400 mb-2">Instant evaluation credentials:</p>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="text-slate-300">
                <span className="text-purple-400 font-bold">Admin:</span> admin@onthego.com / Admin@123
              </div>
              <div className="text-slate-300">
                <span className="text-orange-400 font-bold">Courier:</span> courier.alex@onthego.com / Courier@123
              </div>
              <div className="text-slate-300">
                <span className="text-blue-400 font-bold">Customer:</span> customer.john@example.com / Customer@123
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} On-the-Go Courier Management System. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-brand-400" /> Relational SQL Schema & Joins
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> 3NF Normalised
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
