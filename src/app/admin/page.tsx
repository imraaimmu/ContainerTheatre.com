'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Users,
  IndianRupee,
  TrendingUp,
  Clock,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Phone,
  Mail,
  Eye,
  MoreVertical,
  Terminal,
  ArrowLeft,
  LogOut,
  Loader2,
  Megaphone,
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Booking, BookingStatus, BookingStats } from '@/lib/db/types';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import PhoneLogin from '@/components/auth/PhoneLogin';

// Admin whitelist - Add your phone numbers here (without country code)
const ADMIN_PHONES = process.env.NEXT_PUBLIC_ADMIN_PHONES?.split(',') || [];

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Selected booking for details
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.set('dateFrom', today);
        params.set('dateTo', today);
      } else if (dateFilter === 'week') {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        params.set('dateFrom', weekAgo.toISOString().split('T')[0]);
        params.set('dateTo', today.toISOString().split('T')[0]);
      } else if (dateFilter === 'month') {
        const today = new Date();
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        params.set('dateFrom', monthAgo.toISOString().split('T')[0]);
        params.set('dateTo', today.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/bookings?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        setError(data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/bookings/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Update booking status
  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        fetchBookings();
        fetchStats();
        setSelectedBooking(null);
      } else {
        alert(`Failed to update status: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  useEffect(() => {
    if (user && isAuthorized) {
      fetchBookings();
      fetchStats();
    }
  }, [statusFilter, dateFilter, user, isAuthorized]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        fetchBookings();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  // Check authorization
  useEffect(() => {
    if (user) {
      const phoneNumber = user.phoneNumber?.replace('+91', '') || '';
      // If no admin phones configured, allow all authenticated users (dev mode)
      if (ADMIN_PHONES.length === 0 || ADMIN_PHONES.includes(phoneNumber)) {
        setIsAuthorized(true);
        fetchBookings();
        fetchStats();
      } else {
        setIsAuthorized(false);
      }
    }
  }, [user]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'text-terminal-green bg-terminal-green/10';
      case 'completed':
        return 'text-terminal-blue bg-terminal-blue/10';
      case 'cancelled':
        return 'text-terminal-red bg-terminal-red/10';
      case 'pending':
        return 'text-terminal-yellow bg-terminal-yellow/10';
      case 'no-show':
        return 'text-terminal-muted bg-terminal-gray/50';
      default:
        return 'text-terminal-muted bg-terminal-gray/50';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'no-show':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const slotLabels: Record<string, string> = {
    morning: '10:00 AM',
    afternoon: '1:30 PM',
    evening: '5:00 PM',
    night: '8:30 PM',
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-terminal-green animate-spin mx-auto mb-4" />
          <p className="text-terminal-muted font-mono">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return (
      <PhoneLogin
        title="Admin Login"
        subtitle="Enter your registered admin phone number"
      />
    );
  }

  // Show unauthorized message if phone not in whitelist
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-terminal-red/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-terminal-red" />
          </div>
          <h1 className="text-2xl font-mono font-bold text-white mb-2">Access Denied</h1>
          <p className="text-terminal-muted font-mono text-sm mb-6">
            Your phone number ({user.phoneNumber}) is not authorized to access the admin panel.
          </p>
          <button
            onClick={signOut}
            className="px-6 py-3 bg-terminal-gray rounded-lg font-mono text-white hover:bg-terminal-gray/80 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-black text-white">
      {/* Header */}
      <header className="bg-terminal-dark border-b border-terminal-gray sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-lg hover:bg-terminal-gray/50 text-terminal-muted hover:text-terminal-green transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-terminal-green/10 border border-terminal-green flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-terminal-green" />
                </div>
                <div>
                  <h1 className="text-white font-mono font-bold">Admin Dashboard</h1>
                  <p className="text-terminal-green text-xs font-mono">Container Theatre v1.0</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/banners"
                className="flex items-center gap-2 px-4 py-2 bg-terminal-purple/10 border border-terminal-purple/30 rounded-lg text-terminal-purple hover:bg-terminal-purple/20 transition-colors font-mono text-sm"
              >
                <Megaphone className="w-4 h-4" />
                Banners
              </Link>
              <button
                onClick={() => {
                  fetchBookings();
                  fetchStats();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-terminal-gray/50 rounded-lg text-terminal-green hover:bg-terminal-gray transition-colors font-mono text-sm"
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                Refresh
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-terminal-red/10 border border-terminal-red/30 rounded-lg text-terminal-red hover:bg-terminal-red/20 transition-colors font-mono text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-terminal-dark border border-terminal-gray rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-terminal-green/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-terminal-green" />
                </div>
                <span className="text-terminal-muted text-sm font-mono">Total Bookings</span>
              </div>
              <p className="text-2xl font-mono font-bold text-white">{stats.totalBookings}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-terminal-dark border border-terminal-gray rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-terminal-blue/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-terminal-blue" />
                </div>
                <span className="text-terminal-muted text-sm font-mono">Confirmed</span>
              </div>
              <p className="text-2xl font-mono font-bold text-white">{stats.confirmedBookings}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-terminal-dark border border-terminal-gray rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-terminal-yellow/10 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-terminal-yellow" />
                </div>
                <span className="text-terminal-muted text-sm font-mono">Advance Collected</span>
              </div>
              <p className="text-2xl font-mono font-bold text-terminal-green">
                {formatPrice(stats.advanceCollected)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-terminal-dark border border-terminal-gray rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-terminal-purple/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-terminal-purple" />
                </div>
                <span className="text-terminal-muted text-sm font-mono">Pending Balance</span>
              </div>
              <p className="text-2xl font-mono font-bold text-terminal-yellow">
                {formatPrice(stats.pendingBalance)}
              </p>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-terminal-dark border border-terminal-gray rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-muted" />
              <input
                type="text"
                placeholder="Search by name, phone, or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full input-terminal pl-10 rounded-lg"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
              className="input-terminal rounded-lg px-4 py-2 min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              className="input-terminal rounded-lg px-4 py-2 min-w-[150px]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-terminal-red/10 border border-terminal-red/30 rounded-xl p-4 mb-6">
            <p className="text-terminal-red font-mono">{error}</p>
          </div>
        )}

        {/* Bookings Table */}
        <div className="bg-terminal-dark border border-terminal-gray rounded-xl overflow-hidden">
          <div className="p-4 border-b border-terminal-gray">
            <h2 className="text-terminal-green font-mono font-bold">
              {'>'} Bookings ({bookings.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-terminal-green animate-spin mx-auto mb-4" />
              <p className="text-terminal-muted font-mono">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-terminal-muted mx-auto mb-4" />
              <p className="text-terminal-muted font-mono">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-terminal-gray text-terminal-muted text-sm font-mono">
                    <th className="text-left p-4">Booking ID</th>
                    <th className="text-left p-4">Customer</th>
                    <th className="text-left p-4">Package</th>
                    <th className="text-left p-4">Date & Time</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-terminal-gray/50 hover:bg-terminal-gray/20 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-terminal-green font-mono text-sm">{booking.id}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white font-mono">{booking.customerName}</p>
                          <p className="text-terminal-muted text-sm font-mono">{booking.customerPhone}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-mono text-sm">{booking.packageName}</p>
                        <p className="text-terminal-muted text-xs font-mono">{booking.guests} guests</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-mono text-sm">
                          {format(parseISO(booking.date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-terminal-muted text-xs font-mono capitalize">
                          {booking.slot} ({slotLabels[booking.slot]})
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-terminal-green font-mono text-sm">
                          {formatPrice(booking.advancePaid)} paid
                        </p>
                        <p className="text-terminal-yellow text-xs font-mono">
                          {formatPrice(booking.balanceDue)} due
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono',
                            getStatusColor(booking.status)
                          )}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 rounded-lg hover:bg-terminal-gray/50 text-terminal-green transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-terminal-dark border border-terminal-gray rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-terminal-gray">
                <div className="flex items-center justify-between">
                  <h3 className="text-terminal-green font-mono font-bold">
                    Booking Details
                  </h3>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="text-terminal-muted hover:text-white"
                  >
                    ×
                  </button>
                </div>
                <p className="text-terminal-green font-mono text-sm mt-1">{selectedBooking.id}</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Customer */}
                <div>
                  <p className="text-terminal-muted text-xs font-mono mb-1">Customer</p>
                  <p className="text-white font-mono">{selectedBooking.customerName}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <a
                      href={`tel:${selectedBooking.customerPhone}`}
                      className="flex items-center gap-1 text-terminal-green text-sm font-mono hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      {selectedBooking.customerPhone}
                    </a>
                    {selectedBooking.customerEmail && (
                      <a
                        href={`mailto:${selectedBooking.customerEmail}`}
                        className="flex items-center gap-1 text-terminal-blue text-sm font-mono hover:underline"
                      >
                        <Mail className="w-3 h-3" />
                        {selectedBooking.customerEmail}
                      </a>
                    )}
                  </div>
                </div>

                {/* Booking Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-terminal-muted text-xs font-mono mb-1">Package</p>
                    <p className="text-white font-mono">{selectedBooking.packageName}</p>
                  </div>
                  <div>
                    <p className="text-terminal-muted text-xs font-mono mb-1">Guests</p>
                    <p className="text-white font-mono">{selectedBooking.guests}</p>
                  </div>
                  <div>
                    <p className="text-terminal-muted text-xs font-mono mb-1">Date</p>
                    <p className="text-white font-mono">
                      {format(parseISO(selectedBooking.date), 'EEE, MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-terminal-muted text-xs font-mono mb-1">Time Slot</p>
                    <p className="text-white font-mono capitalize">
                      {selectedBooking.slot} ({slotLabels[selectedBooking.slot]})
                    </p>
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-terminal-gray/30 rounded-lg p-4">
                  <p className="text-terminal-muted text-xs font-mono mb-2">Payment</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-terminal-muted">Total</span>
                      <span className="text-white">{formatPrice(selectedBooking.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-terminal-green">Advance Paid</span>
                      <span className="text-terminal-green">{formatPrice(selectedBooking.advancePaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-mono">
                      <span className="text-terminal-yellow">Balance Due</span>
                      <span className="text-terminal-yellow">{formatPrice(selectedBooking.balanceDue)}</span>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div>
                    <p className="text-terminal-muted text-xs font-mono mb-1">Special Requests</p>
                    <p className="text-white font-mono text-sm">{selectedBooking.specialRequests}</p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <p className="text-terminal-muted text-xs font-mono mb-2">Status</p>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono',
                      getStatusColor(selectedBooking.status)
                    )}
                  >
                    {getStatusIcon(selectedBooking.status)}
                    {selectedBooking.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-terminal-gray">
                  <p className="text-terminal-muted text-xs font-mono mb-3">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateStatus(selectedBooking.id, 'completed')}
                          className="px-3 py-2 bg-terminal-blue/20 text-terminal-blue rounded-lg font-mono text-sm hover:bg-terminal-blue/30 transition-colors"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => updateStatus(selectedBooking.id, 'no-show')}
                          className="px-3 py-2 bg-terminal-gray/50 text-terminal-muted rounded-lg font-mono text-sm hover:bg-terminal-gray transition-colors"
                        >
                          No Show
                        </button>
                        <button
                          onClick={() => updateStatus(selectedBooking.id, 'cancelled')}
                          className="px-3 py-2 bg-terminal-red/20 text-terminal-red rounded-lg font-mono text-sm hover:bg-terminal-red/30 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {selectedBooking.status === 'cancelled' && (
                      <button
                        onClick={() => updateStatus(selectedBooking.id, 'confirmed')}
                        className="px-3 py-2 bg-terminal-green/20 text-terminal-green rounded-lg font-mono text-sm hover:bg-terminal-green/30 transition-colors"
                      >
                        Restore Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
