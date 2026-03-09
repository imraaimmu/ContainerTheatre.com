'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Phone,
  IndianRupee,
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/lib/auth/context';
import { Booking, BookingStatus } from '@/lib/db/types';
import { cn, formatPrice } from '@/lib/utils';
import PhoneLogin from '@/components/auth/PhoneLogin';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings when user is authenticated
  useEffect(() => {
    if (user && user.phoneNumber) {
      fetchBookings();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchBookings = async () => {
    if (!user?.phoneNumber) return;

    setLoading(true);
    setError(null);

    try {
      const phone = user.phoneNumber.replace('+91', '');
      const response = await fetch(`/api/customers/${phone}/bookings`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setError(data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'text-terminal-green bg-terminal-green/10 border-terminal-green/30';
      case 'completed':
        return 'text-terminal-blue bg-terminal-blue/10 border-terminal-blue/30';
      case 'cancelled':
        return 'text-terminal-red bg-terminal-red/10 border-terminal-red/30';
      case 'pending':
        return 'text-terminal-yellow bg-terminal-yellow/10 border-terminal-yellow/30';
      case 'no-show':
        return 'text-terminal-muted bg-terminal-gray/30 border-terminal-gray';
      default:
        return 'text-terminal-muted bg-terminal-gray/30 border-terminal-gray';
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'no-show':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
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
        <Loader2 className="w-8 h-8 text-terminal-green animate-spin" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return (
      <PhoneLogin
        title="View Your Bookings"
        subtitle="Login with your phone number to see your booking history"
        onSuccess={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-terminal-black text-white">
      {/* Header */}
      <header className="bg-terminal-dark border-b border-terminal-gray sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-terminal-gray/50 text-terminal-muted hover:text-terminal-green transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-white font-mono font-bold">My Bookings</h1>
              <p className="text-terminal-green text-xs font-mono flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {user.phoneNumber}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="bg-terminal-red/10 border border-terminal-red/30 rounded-xl p-4 mb-6">
            <p className="text-terminal-red font-mono">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-terminal-green animate-spin mb-4" />
            <p className="text-terminal-muted font-mono">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-terminal-gray/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-terminal-muted" />
            </div>
            <h2 className="text-xl font-mono font-bold text-white mb-2">
              No bookings yet
            </h2>
            <p className="text-terminal-muted font-mono mb-6">
              You haven't made any bookings with this phone number.
            </p>
            <Link
              href="/#booking"
              className="inline-flex items-center gap-2 bg-terminal-green text-terminal-black px-6 py-3 rounded-lg font-mono font-medium hover:bg-terminal-green/90 transition-colors"
            >
              <Package className="w-5 h-5" />
              Book Your First Experience
            </Link>
          </motion.div>
        ) : (
          /* Bookings list */
          <div className="space-y-4">
            <p className="text-terminal-muted font-mono text-sm mb-4">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
            </p>

            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-terminal-dark border border-terminal-gray rounded-xl overflow-hidden"
              >
                {/* Booking header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-gray bg-terminal-gray/20">
                  <div className="flex items-center gap-3">
                    <span className="text-terminal-green font-mono text-sm">
                      {booking.id}
                    </span>
                    <span
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono border',
                        getStatusColor(booking.status)
                      )}
                    >
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </div>
                  <span className="text-terminal-muted text-xs font-mono">
                    Booked on {format(parseISO(booking.createdAt as string), 'MMM d, yyyy')}
                  </span>
                </div>

                {/* Booking content */}
                <div className="p-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-mono font-bold text-lg mb-1">
                        {booking.packageName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-terminal-muted text-sm font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(booking.date), 'EEE, MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.slot.charAt(0).toUpperCase() + booking.slot.slice(1)} ({slotLabels[booking.slot]})
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {booking.guests} guests
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment info */}
                  <div className="bg-terminal-gray/30 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm font-mono">
                      <span className="text-terminal-muted">Total Amount</span>
                      <span className="text-white">{formatPrice(booking.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-mono mt-1">
                      <span className="text-terminal-green">Advance Paid</span>
                      <span className="text-terminal-green">{formatPrice(booking.advancePaid)}</span>
                    </div>
                    {booking.balanceDue > 0 && booking.status === 'confirmed' && (
                      <div className="flex items-center justify-between text-sm font-mono mt-1">
                        <span className="text-terminal-yellow">Balance Due</span>
                        <span className="text-terminal-yellow">{formatPrice(booking.balanceDue)}</span>
                      </div>
                    )}
                  </div>

                  {/* Add-ons */}
                  {booking.addOns && booking.addOns.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-terminal-gray">
                      <p className="text-terminal-muted text-xs font-mono mb-2">Add-ons:</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.addOns.map((addon) => (
                          <span
                            key={addon.id}
                            className="px-2 py-1 bg-terminal-green/10 text-terminal-green text-xs font-mono rounded"
                          >
                            {addon.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special requests */}
                  {booking.specialRequests && (
                    <div className="mt-3 pt-3 border-t border-terminal-gray">
                      <p className="text-terminal-muted text-xs font-mono mb-1">Special Requests:</p>
                      <p className="text-white text-sm font-mono">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Book again CTA */}
            <div className="text-center pt-6">
              <Link
                href="/#booking"
                className="inline-flex items-center gap-2 bg-terminal-green text-terminal-black px-6 py-3 rounded-lg font-mono font-medium hover:bg-terminal-green/90 transition-colors"
              >
                <Package className="w-5 h-5" />
                Book Another Experience
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
