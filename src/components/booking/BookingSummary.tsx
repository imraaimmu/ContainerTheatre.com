'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Package, Sparkles, CreditCard, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Package as PackageType, AddOn, timeSlots } from '@/data/packages';
import { formatPrice, cn } from '@/lib/utils';
import {
  createOrder,
  initializeRazorpay,
  verifyPayment,
  RazorpayResponse,
} from '@/lib/razorpay';
import { useAuth } from '@/lib/auth/context';
import PhoneVerification from './PhoneVerification';

interface BookingSummaryProps {
  selectedPackage: PackageType;
  selectedDate: Date;
  selectedSlot: string;
  selectedAddOns: AddOn[];
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    guests: number;
    specialRequests: string;
  };
  isWeekend: boolean;
  totalPrice: number;
  onPaymentSuccess: (bookingId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function BookingSummary({
  selectedPackage,
  selectedDate,
  selectedSlot,
  selectedAddOns,
  customerDetails,
  isWeekend,
  totalPrice,
  onPaymentSuccess,
  onPaymentError,
}: BookingSummaryProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Check if phone verification is needed
  const needsPhoneVerification = !user && !phoneVerified;

  const slot = timeSlots.find((s) => s.id === selectedSlot);
  const packagePrice = isWeekend ? selectedPackage.weekendPrice : selectedPackage.weekdayPrice;
  const addOnsPrice = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const advanceAmount = Math.ceil(totalPrice * 0.5);

  // Handle phone verification success
  const handlePhoneVerified = async (userId: string) => {
    setPhoneVerified(true);
    setCustomerId(userId);

    // Create/link customer account in background
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customerDetails.phone,
          name: customerDetails.name,
          email: customerDetails.email,
          firebaseUid: userId,
        }),
      });

      const data = await response.json();
      if (data.success && data.customerId) {
        setCustomerId(data.customerId);
      }
    } catch (err) {
      console.error('Error creating customer:', err);
      // Continue anyway - customer can be linked later
    }
  };

  // Handle demo mode skip
  const handleDemoSkip = () => {
    setPhoneVerified(true);
    setCustomerId(`demo_${Date.now()}`);
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create order on server
      const orderResponse = await createOrder({
        amount: advanceAmount,
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        customerEmail: customerDetails.email,
        packageName: selectedPackage.name,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedSlot,
        guests: customerDetails.guests,
        addOns: selectedAddOns.map((a) => a.name),
      });

      if (!orderResponse.success || !orderResponse.order) {
        throw new Error(orderResponse.error || 'Failed to create order');
      }

      const { order } = orderResponse;

      // Step 2: Initialize Razorpay checkout
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo';

      await initializeRazorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Container Theatre v1.0',
        description: `${selectedPackage.name} - ${format(selectedDate, 'MMM d, yyyy')}`,
        order_id: order.id,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email || '',
          contact: customerDetails.phone,
        },
        notes: {
          package: selectedPackage.name,
          date: format(selectedDate, 'yyyy-MM-dd'),
          slot: selectedSlot,
          guests: String(customerDetails.guests),
        },
        theme: {
          color: '#00FF41',
        },
        handler: async (response: RazorpayResponse) => {
          // Step 3: Verify payment on server
          try {
            const verifyResponse = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingDetails: {
                customerId: customerId || user?.uid || undefined,
                customerName: customerDetails.name,
                customerPhone: customerDetails.phone,
                customerEmail: customerDetails.email,
                packageId: selectedPackage.id,
                packageName: selectedPackage.name,
                bookingDate: format(selectedDate, 'yyyy-MM-dd'),
                timeSlot: selectedSlot,
                guests: customerDetails.guests,
                specialRequests: customerDetails.specialRequests,
                totalAmount: totalPrice,
                advancePaid: advanceAmount,
                isWeekend: isWeekend,
                addOns: selectedAddOns.map((a) => ({
                  id: a.id,
                  name: a.name,
                  price: a.price,
                })),
                addOnsPrice: addOnsPrice,
              },
            });

            if (verifyResponse.success && verifyResponse.bookingId) {
              onPaymentSuccess(verifyResponse.bookingId);
            } else {
              throw new Error(verifyResponse.error || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Verification error:', verifyError);
            onPaymentError('Payment completed but verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setError('Payment cancelled. Please try again.');
          },
        },
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Booking details card */}
      <div className="bg-terminal-dark border border-terminal-gray rounded-xl overflow-hidden">
        <div className="bg-terminal-green/10 border-b border-terminal-gray p-4">
          <h3 className="text-terminal-green font-mono font-bold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Booking Summary
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Package */}
          <div className="flex items-start gap-4">
            <span className="text-3xl">{selectedPackage.icon}</span>
            <div>
              <p className="text-white font-mono font-bold text-lg">{selectedPackage.name}</p>
              <p className="text-terminal-muted text-sm font-mono">{selectedPackage.description}</p>
              <div className="flex items-center gap-4 mt-2 text-terminal-muted text-sm font-mono">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedPackage.capacity}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedPackage.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-terminal-gray/30 rounded-lg p-4">
              <p className="text-terminal-muted text-xs font-mono mb-1">Date</p>
              <p className="text-white font-mono font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-terminal-green" />
                {format(selectedDate, 'EEE, MMM d, yyyy')}
              </p>
              {isWeekend && (
                <span className="text-terminal-blue text-xs font-mono">Weekend rate</span>
              )}
            </div>
            <div className="bg-terminal-gray/30 rounded-lg p-4">
              <p className="text-terminal-muted text-xs font-mono mb-1">Time Slot</p>
              <p className="text-white font-mono font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-terminal-green" />
                {slot?.label}
              </p>
              <span className="text-terminal-muted text-xs font-mono">{slot?.time}</span>
            </div>
          </div>

          {/* Customer details */}
          <div className="bg-terminal-gray/30 rounded-lg p-4">
            <p className="text-terminal-muted text-xs font-mono mb-2">Customer Details</p>
            <div className="space-y-1 text-sm font-mono">
              <p className="text-white">{customerDetails.name}</p>
              <p className="text-terminal-muted">{customerDetails.phone}</p>
              {customerDetails.email && (
                <p className="text-terminal-muted">{customerDetails.email}</p>
              )}
              <p className="text-terminal-green">{customerDetails.guests} guest(s)</p>
            </div>
            {customerDetails.specialRequests && (
              <div className="mt-3 pt-3 border-t border-terminal-gray">
                <p className="text-terminal-muted text-xs font-mono mb-1">Special Requests:</p>
                <p className="text-white text-sm font-mono">{customerDetails.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Add-ons */}
          {selectedAddOns.length > 0 && (
            <div className="bg-terminal-gray/30 rounded-lg p-4">
              <p className="text-terminal-muted text-xs font-mono mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Installed Plugins
              </p>
              <div className="space-y-2">
                {selectedAddOns.map((addOn) => (
                  <div key={addOn.id} className="flex items-center justify-between text-sm font-mono">
                    <span className="text-white">{addOn.name}</span>
                    <span className="text-terminal-green">+{formatPrice(addOn.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="bg-terminal-dark border border-terminal-gray rounded-xl p-6">
        <h4 className="text-terminal-green font-mono font-bold mb-4">{'>'} Price Breakdown</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm font-mono">
            <span className="text-terminal-muted">
              {selectedPackage.name} ({isWeekend ? 'weekend' : 'weekday'})
            </span>
            <span className="text-white">{formatPrice(packagePrice)}</span>
          </div>

          {selectedAddOns.length > 0 && (
            <div className="flex items-center justify-between text-sm font-mono">
              <span className="text-terminal-muted">Add-ons ({selectedAddOns.length})</span>
              <span className="text-white">{formatPrice(addOnsPrice)}</span>
            </div>
          )}

          <div className="border-t border-terminal-gray pt-3 mt-3">
            <div className="flex items-center justify-between font-mono">
              <span className="text-white font-bold">Total Amount</span>
              <span className="text-terminal-green text-2xl font-bold">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <div className="bg-terminal-yellow/10 border border-terminal-yellow/30 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between font-mono">
              <div>
                <p className="text-terminal-yellow font-medium">Advance Payment (50%)</p>
                <p className="text-terminal-muted text-xs">Pay now to confirm booking</p>
              </div>
              <span className="text-terminal-yellow text-xl font-bold">{formatPrice(advanceAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-terminal-red/10 border border-terminal-red/30 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-terminal-red flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-terminal-red font-mono font-medium">Payment Error</p>
            <p className="text-terminal-red/80 font-mono text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Phone Verification Step (for non-logged-in users) */}
      {needsPhoneVerification ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-terminal-yellow font-mono text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Verify your phone to continue</span>
          </div>
          <PhoneVerification
            phoneNumber={customerDetails.phone}
            onVerified={handlePhoneVerified}
            onSkip={handleDemoSkip}
          />
        </div>
      ) : (
        <>
          {/* Phone verified badge (for non-logged-in users who verified) */}
          {phoneVerified && !user && (
            <div className="flex items-center justify-center gap-2 text-terminal-green text-sm font-mono bg-terminal-green/10 rounded-lg p-3">
              <CheckCircle className="w-4 h-4" />
              <span>Phone verified: +91 {customerDetails.phone}</span>
            </div>
          )}

          {/* Logged in badge */}
          {user && (
            <div className="flex items-center justify-center gap-2 text-terminal-blue text-sm font-mono bg-terminal-blue/10 rounded-lg p-3">
              <CheckCircle className="w-4 h-4" />
              <span>Logged in: {user.phoneNumber}</span>
            </div>
          )}

          {/* Secure payment badge */}
          <div className="flex items-center justify-center gap-2 text-terminal-muted text-xs font-mono">
            <Shield className="w-4 h-4" />
            <span>Secured by Razorpay | 256-bit SSL encryption</span>
          </div>

          {/* Pay button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-terminal-green text-terminal-black py-4 rounded-xl font-mono font-bold text-lg flex items-center justify-center gap-3 hover:bg-terminal-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-terminal-black border-t-transparent rounded-full animate-spin" />
                Initializing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay {formatPrice(advanceAmount)} & Confirm
              </>
            )}
          </motion.button>

          {/* Payment methods */}
          <div className="text-center">
            <p className="text-terminal-muted text-xs font-mono mb-2">Accepted payment methods</p>
            <div className="flex items-center justify-center gap-4 text-terminal-muted text-xs font-mono">
              <span>UPI</span>
              <span>•</span>
              <span>Cards</span>
              <span>•</span>
              <span>Net Banking</span>
              <span>•</span>
              <span>Wallets</span>
            </div>
          </div>

          {/* Note */}
          <p className="text-terminal-muted text-xs font-mono text-center">
            Balance amount of {formatPrice(totalPrice - advanceAmount)} to be paid at the venue
          </p>
        </>
      )}
    </motion.div>
  );
}
