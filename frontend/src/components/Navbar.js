'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Package,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Search,
  PlusCircle,
  LayoutDashboard,
  Users,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-courier-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  On-the-Go
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Courier System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/track"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/track')
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="w-4 h-4" />
                Track Parcel
              </Link>

              {isAuthenticated && role === 'customer' && (
                <>
                  <Link
                    href="/customer"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/customer') && !isActive('/customer/book') && !isActive('/customer/orders')
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/customer/book"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/customer/book')
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-brand-600" />
                    Book Delivery
                  </Link>
                  <Link
                    href="/customer/orders"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/customer/orders')
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Order History
                  </Link>
                </>
              )}

              {isAuthenticated && role === 'courier' && (
                <Link
                  href="/courier"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/courier')
                      ? 'bg-orange-50 text-orange-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-4 h-4 text-orange-600" />
                  Courier Delivery Portal
                </Link>
              )}

              {isAuthenticated && role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin') && !isActive('/admin/orders') && !isActive('/admin/couriers') && !isActive('/admin/users') && !isActive('/admin/reports')
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Overview
                  </Link>
                  <Link
                    href="/admin/orders"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/orders')
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Orders Dispatch
                  </Link>
                  <Link
                    href="/admin/couriers"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/couriers')
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Couriers Fleet
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/users')
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Action / User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-800 leading-tight">
                    {user?.full_name}
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : role === 'courier'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm shadow-brand-500/20 transition-all hover:shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Track Parcel
          </Link>
          {isAuthenticated ? (
            <>
              {role === 'customer' && (
                <>
                  <Link
                    href="/customer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Customer Dashboard
                  </Link>
                  <Link
                    href="/customer/book"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Book Delivery
                  </Link>
                  <Link
                    href="/customer/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Order History
                  </Link>
                </>
              )}
              {role === 'courier' && (
                <Link
                  href="/courier"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-orange-700 hover:bg-orange-50"
                >
                  Courier Portal
                </Link>
              )}
              {role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Admin Overview
                  </Link>
                  <Link
                    href="/admin/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Orders Dispatch
                  </Link>
                  <Link
                    href="/admin/couriers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Couriers Fleet
                  </Link>
                </>
              )}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{user?.full_name}</div>
                  <div className="text-xs text-slate-500 capitalize">{role}</div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
