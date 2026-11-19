'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Truck,
  Package,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function AdminUsersPage() {
  const { user, isAuthenticated, isLoading: authLoading, role } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) router.push('/login');
      else if (role !== 'admin') router.push('/');
    }
  }, [authLoading, isAuthenticated, role, router]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.admin.getAllUsers({
        role: filterRole !== 'all' ? filterRole : undefined,
        search: search || undefined,
      });
      if (res.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      loadUsers();
    }
  }, [isAuthenticated, role, filterRole]);

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoadingId(userId);
      await api.admin.toggleUserStatus(userId);
      await loadUsers();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-purple-600">
            Account Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            User Management & Security
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of customers, couriers, and administrators with role-based access control.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total: <strong className="text-slate-900">{users.length}</strong> Accounts
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          {['all', 'customer', 'courier', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterRole === r
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadUsers();
          }}
          className="flex gap-2 w-full md:w-80"
        >
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus-within:ring-2 focus-within:ring-purple-500/20">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name, email..."
              className="w-full bg-transparent focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading users directory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 font-bold">
                <tr>
                  <th className="py-3 px-6">User Name</th>
                  <th className="py-3 px-6">Email Address</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Phone / City</th>
                  <th className="py-3 px-6">Activity</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isActive = Boolean(u.is_active);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 font-bold text-slate-900">{u.full_name}</td>
                      <td className="py-3.5 px-6 text-slate-600 text-xs font-mono">{u.email}</td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : u.role === 'courier'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-500">
                        {u.phone || 'N/A'} {u.city ? `(${u.city})` : ''}
                      </td>
                      <td className="py-3.5 px-6 text-xs font-semibold text-slate-700">
                        {u.orders_count || 0} Orders
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            isActive ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Deactivated
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        {u.id !== user?.id && (
                          <button
                            disabled={actionLoadingId === u.id}
                            onClick={() => handleToggleStatus(u.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                              isActive
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
