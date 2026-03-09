'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Users, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/context';
import { Customer } from '@/lib/db/types';

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  guests: number;
  specialRequests: string;
}

interface CustomerFormProps {
  details: CustomerDetails;
  onChange: (details: Partial<CustomerDetails>) => void;
  maxGuests: number;
}

export default function CustomerForm({ details, onChange, maxGuests }: CustomerFormProps) {
  const { user } = useAuth();
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);

  // Pre-fill details for logged-in users
  useEffect(() => {
    if (user && user.phoneNumber) {
      const phone = user.phoneNumber.replace('+91', '');

      // Set phone number immediately
      if (!details.phone) {
        onChange({ phone });
      }

      // Fetch customer profile for name/email pre-fill
      fetchCustomerProfile(phone);
    }
  }, [user]);

  const fetchCustomerProfile = async (phone: string) => {
    setLoadingCustomer(true);
    try {
      const response = await fetch(`/api/customers?phone=${phone}`);
      const data = await response.json();

      if (data.success && data.exists && data.customer) {
        setCustomerProfile(data.customer);

        // Pre-fill name and email if not already set
        const updates: Partial<CustomerDetails> = {};
        if (!details.name && data.customer.name) {
          updates.name = data.customer.name;
        }
        if (!details.email && data.customer.email) {
          updates.email = data.customer.email;
        }
        if (Object.keys(updates).length > 0) {
          onChange(updates);
        }
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const isLoggedIn = Boolean(user);
  const displayPhone = user?.phoneNumber?.replace('+91', '') || details.phone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-terminal-dark border border-terminal-gray rounded-xl p-6"
    >
      {/* Logged in indicator */}
      {isLoggedIn && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-terminal-green/10 rounded-lg border border-terminal-green/30">
          <CheckCircle className="w-4 h-4 text-terminal-green" />
          <span className="text-terminal-green font-mono text-sm">
            Logged in as +91 {displayPhone}
          </span>
          {customerProfile && customerProfile.totalBookings > 0 && (
            <span className="ml-auto text-terminal-muted text-xs font-mono">
              {customerProfile.totalBookings} previous booking{customerProfile.totalBookings !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      <h3 className="text-terminal-green font-mono font-bold mb-2">
        {'>'} {isLoggedIn ? 'Confirm your details' : 'Enter your details'}
      </h3>
      <p className="text-terminal-muted text-sm font-mono mb-6">
        {isLoggedIn
          ? 'Your details are pre-filled. Update if needed.'
          : "We'll use this to confirm your booking"}
      </p>

      <div className="space-y-5">
        {/* Name */}
        <div className="relative">
          <label className="block text-terminal-green text-sm font-mono mb-2">
            {'>'} name<span className="text-terminal-red">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted" />
            <input
              type="text"
              value={details.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Enter your name"
              className="w-full input-terminal pl-11 rounded-lg"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div className="relative">
          <label className="block text-terminal-green text-sm font-mono mb-2">
            {'>'} phone<span className="text-terminal-red">*</span>
            {isLoggedIn && (
              <span className="ml-2 text-terminal-blue text-xs">(verified)</span>
            )}
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted" />
            <input
              type="tel"
              value={isLoggedIn ? displayPhone : details.phone}
              onChange={(e) => !isLoggedIn && onChange({ phone: e.target.value })}
              placeholder="+91 XXXXX XXXXX"
              className={cn(
                "w-full input-terminal pl-11 rounded-lg",
                isLoggedIn && "bg-terminal-gray/30 cursor-not-allowed"
              )}
              readOnly={isLoggedIn}
              required
            />
            {isLoggedIn && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-terminal-green" />
            )}
          </div>
          {isLoggedIn && (
            <p className="text-terminal-blue text-xs font-mono mt-1">
              Phone number verified via OTP
            </p>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <label className="block text-terminal-green text-sm font-mono mb-2">
            {'>'} email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted" />
            <input
              type="email"
              value={details.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="your@email.com"
              className="w-full input-terminal pl-11 rounded-lg"
            />
          </div>
        </div>

        {/* Number of guests */}
        <div className="relative">
          <label className="block text-terminal-green text-sm font-mono mb-2">
            {'>'} number of guests<span className="text-terminal-red">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted" />
            <input
              type="number"
              min={1}
              max={maxGuests}
              value={details.guests}
              onChange={(e) => onChange({ guests: parseInt(e.target.value) || 1 })}
              className="w-full input-terminal pl-11 rounded-lg"
              required
            />
          </div>
          <p className="text-terminal-muted text-xs font-mono mt-1">
            Max capacity: {maxGuests} guests
          </p>
        </div>

        {/* Special requests */}
        <div className="relative">
          <label className="block text-terminal-green text-sm font-mono mb-2">
            {'>'} special requests
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-terminal-muted" />
            <textarea
              value={details.specialRequests}
              onChange={(e) => onChange({ specialRequests: e.target.value })}
              placeholder="Any special requests? (decorations, surprises, etc.)"
              rows={3}
              className="w-full input-terminal pl-11 rounded-lg resize-none"
            />
          </div>
        </div>
      </div>

      {/* Terms notice */}
      <div className="mt-6 p-4 bg-terminal-gray/30 rounded-lg">
        <p className="text-terminal-muted text-xs font-mono">
          <span className="text-terminal-yellow">{'// note:'}</span> By proceeding, you agree to our
          booking terms. 50% advance payment required to confirm. Cancellation policy applies.
        </p>
      </div>
    </motion.div>
  );
}
