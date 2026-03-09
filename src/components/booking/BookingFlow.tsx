'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Package, Calendar, Sparkles, User, CreditCard, AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { packages, addOns } from '@/data/packages';
import { useBookingStore } from '@/lib/store';
import { cn, formatPrice } from '@/lib/utils';
import PackageCard from './PackageCard';
import DateTimePicker from './DateTimePicker';
import AddOnSelector from './AddOnSelector';
import CustomerForm from './CustomerForm';
import BookingSummary from './BookingSummary';

const steps = [
  { id: 0, label: 'Package', icon: Package },
  { id: 1, label: 'Date & Time', icon: Calendar },
  { id: 2, label: 'Add-ons', icon: Sparkles },
  { id: 3, label: 'Details', icon: User },
  { id: 4, label: 'Confirm', icon: CreditCard },
];

export default function BookingFlow() {
  const [isComplete, setIsComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    step,
    setStep,
    selectedPackage,
    setSelectedPackage,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    selectedAddOns,
    toggleAddOn,
    customerDetails,
    setCustomerDetails,
    isWeekend,
    getTotalPrice,
    reset,
  } = useBookingStore();

  const canProceed = () => {
    switch (step) {
      case 0:
        return selectedPackage !== null;
      case 1:
        return selectedDate !== null && selectedSlot !== null;
      case 2:
        return true; // Add-ons are optional
      case 3:
        return customerDetails.name && customerDetails.phone && customerDetails.guests > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handlePaymentSuccess = (id: string) => {
    setBookingId(id);
    setIsComplete(true);
    setPaymentError(null);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const handleNewBooking = () => {
    reset();
    setIsComplete(false);
    setBookingId(null);
    setPaymentError(null);
  };

  const copyBookingId = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get max guests from selected package
  const getMaxGuests = () => {
    if (!selectedPackage) return 25;
    const capacityStr = selectedPackage.capacity;
    const match = capacityStr.match(/\d+/);
    return match ? parseInt(match[0]) : 25;
  };

  // Success screen
  if (isComplete && bookingId) {
    const advancePaid = Math.ceil(getTotalPrice() * 0.5);
    const balanceAmount = getTotalPrice() - advancePaid;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        {/* Success icon */}
        <div className="w-24 h-24 bg-terminal-green/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <Check className="w-12 h-12 text-terminal-green" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute -top-1 -right-1 w-8 h-8 bg-terminal-green rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-5 h-5 text-terminal-black" />
          </motion.div>
        </div>

        <h2 className="text-3xl font-mono font-bold text-white mb-4">
          Booking Deployed Successfully!
        </h2>

        {/* Booking ID */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-dark border border-terminal-gray rounded-lg mb-2">
          <span className="text-terminal-muted font-mono text-sm">booking_id:</span>
          <span className="text-terminal-green font-mono font-bold">{bookingId}</span>
          <button
            onClick={copyBookingId}
            className="p-1 hover:bg-terminal-gray/50 rounded transition-colors"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-terminal-green" />
            ) : (
              <Copy className="w-4 h-4 text-terminal-muted" />
            )}
          </button>
        </div>

        <p className="text-terminal-green font-mono mb-8">
          Confirmation sent to {customerDetails.phone}
        </p>

        {/* Booking details */}
        <div className="bg-terminal-dark border border-terminal-gray rounded-xl p-6 text-left mb-8">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-terminal-gray">
            <span className="text-2xl">{selectedPackage?.icon}</span>
            <div>
              <p className="text-white font-mono font-bold">{selectedPackage?.name}</p>
              <p className="text-terminal-muted font-mono text-sm">{selectedPackage?.duration}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-terminal-muted font-mono text-xs mb-1">Date</p>
              <p className="text-white font-mono">
                {selectedDate && format(selectedDate, 'EEE, MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-terminal-muted font-mono text-xs mb-1">Time Slot</p>
              <p className="text-white font-mono capitalize">{selectedSlot}</p>
            </div>
            <div>
              <p className="text-terminal-muted font-mono text-xs mb-1">Guests</p>
              <p className="text-white font-mono">{customerDetails.guests}</p>
            </div>
            <div>
              <p className="text-terminal-muted font-mono text-xs mb-1">Total Amount</p>
              <p className="text-white font-mono">{formatPrice(getTotalPrice())}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-terminal-gray space-y-2">
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-terminal-green">Advance Paid</span>
              <span className="text-terminal-green font-bold">{formatPrice(advancePaid)}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-sm">
              <span className="text-terminal-yellow">Balance Due (at venue)</span>
              <span className="text-terminal-yellow font-bold">{formatPrice(balanceAmount)}</span>
            </div>
          </div>
        </div>

        {/* JSON output */}
        <div className="bg-terminal-dark border border-terminal-gray rounded-xl p-4 text-left mb-8">
          <p className="text-terminal-muted font-mono text-xs mb-2">{'// booking receipt'}</p>
          <pre className="text-terminal-green font-mono text-xs overflow-x-auto">
{`{
  "status": "confirmed",
  "booking_id": "${bookingId}",
  "package": "${selectedPackage?.name}",
  "date": "${selectedDate && format(selectedDate, 'yyyy-MM-dd')}",
  "slot": "${selectedSlot}",
  "guests": ${customerDetails.guests},
  "total": ${getTotalPrice()},
  "advance_paid": ${advancePaid},
  "balance_due": ${balanceAmount}
}`}
          </pre>
        </div>

        {/* What's next */}
        <div className="bg-terminal-blue/10 border border-terminal-blue/30 rounded-xl p-4 mb-8 text-left">
          <p className="text-terminal-blue font-mono font-bold mb-2">{'>'} What&apos;s next?</p>
          <ul className="text-terminal-muted font-mono text-sm space-y-1">
            <li>• You&apos;ll receive a WhatsApp confirmation shortly</li>
            <li>• Reminder will be sent 24 hours before your slot</li>
            <li>• Arrive 10 minutes early for setup</li>
            <li>• Bring balance amount: {formatPrice(balanceAmount)}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleNewBooking}
            className="px-8 py-3 bg-terminal-green text-terminal-black rounded-lg font-mono font-medium hover:bg-terminal-green/90 transition-colors"
          >
            {'>'} Deploy Another Experience
          </button>
          <p className="text-terminal-muted font-mono text-xs">
            Questions? Contact us on WhatsApp
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Payment error banner */}
      {paymentError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-terminal-red/10 border border-terminal-red/30 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-terminal-red flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-terminal-red font-mono font-medium">Payment Issue</p>
            <p className="text-terminal-red/80 font-mono text-sm">{paymentError}</p>
          </div>
          <button
            onClick={() => setPaymentError(null)}
            className="text-terminal-red/60 hover:text-terminal-red transition-colors"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Progress steps */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] px-4">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => isCompleted && setStep(s.id)}
                  disabled={!isCompleted}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    isActive && 'bg-terminal-green text-terminal-black',
                    isCompleted && 'bg-terminal-green/20 text-terminal-green cursor-pointer hover:bg-terminal-green/30',
                    !isActive && !isCompleted && 'text-terminal-muted'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center',
                    isActive && 'bg-terminal-black/20',
                    isCompleted && 'bg-terminal-green/30',
                    !isActive && !isCompleted && 'bg-terminal-gray/50'
                  )}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-mono text-sm hidden sm:inline">{s.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'w-12 h-0.5 mx-2',
                    step > index ? 'bg-terminal-green' : 'bg-terminal-gray'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 0: Package Selection */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-mono font-bold text-white mb-2">
                {'>'} Select your package
              </h2>
              <p className="text-terminal-muted font-mono mb-6">
                Choose the perfect experience for your occasion
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    isSelected={selectedPackage?.id === pkg.id}
                    onSelect={() => setSelectedPackage(pkg)}
                    isWeekend={isWeekend()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-mono font-bold text-white mb-2">
                {'>'} Pick date & time
              </h2>
              <p className="text-terminal-muted font-mono mb-6">
                When would you like to visit?
              </p>
              <DateTimePicker
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onDateSelect={setSelectedDate}
                onSlotSelect={setSelectedSlot}
              />
            </div>
          )}

          {/* Step 2: Add-ons */}
          {step === 2 && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-mono font-bold text-white mb-2">
                {'>'} Enhance your experience
              </h2>
              <p className="text-terminal-muted font-mono mb-6">
                Optional add-ons to make it special
              </p>
              <AddOnSelector
                addOns={addOns}
                selectedAddOns={selectedAddOns}
                onToggle={toggleAddOn}
              />
            </div>
          )}

          {/* Step 3: Customer Details */}
          {step === 3 && (
            <div className="max-w-xl mx-auto">
              <h2 className="text-2xl font-mono font-bold text-white mb-2">
                {'>'} Your details
              </h2>
              <p className="text-terminal-muted font-mono mb-6">
                Tell us who&apos;s coming
              </p>
              <CustomerForm
                details={customerDetails}
                onChange={setCustomerDetails}
                maxGuests={getMaxGuests()}
              />
            </div>
          )}

          {/* Step 4: Confirmation & Payment */}
          {step === 4 && selectedPackage && selectedDate && selectedSlot && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-mono font-bold text-white mb-2">
                {'>'} Review & pay
              </h2>
              <p className="text-terminal-muted font-mono mb-6">
                Complete payment to confirm your booking
              </p>
              <BookingSummary
                selectedPackage={selectedPackage}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                selectedAddOns={selectedAddOns}
                customerDetails={customerDetails}
                isWeekend={isWeekend()}
                totalPrice={getTotalPrice()}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="flex items-center justify-between mt-8 pt-8 border-t border-terminal-gray">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg font-mono transition-colors',
              step === 0
                ? 'text-terminal-muted cursor-not-allowed'
                : 'text-terminal-green hover:bg-terminal-gray/50'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-lg font-mono font-medium transition-colors',
              canProceed()
                ? 'bg-terminal-green text-terminal-black hover:bg-terminal-green/90'
                : 'bg-terminal-gray text-terminal-muted cursor-not-allowed'
            )}
          >
            {step === 3 ? 'Review Booking' : 'Continue'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
