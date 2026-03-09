'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, KeyRound, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';

interface PhoneLoginProps {
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export default function PhoneLogin({
  onSuccess,
  title = 'Admin Login',
  subtitle = 'Enter your phone number to continue',
}: PhoneLoginProps) {
  const { sendOTP, verifyOTP, loading, error, otpSent, resetAuth } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;
    await sendOTP(phoneNumber);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    const success = await verifyOTP(otp);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const handleBack = () => {
    resetAuth();
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-terminal-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Terminal Window */}
        <div className="bg-terminal-dark border border-terminal-gray rounded-xl overflow-hidden shadow-2xl">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-terminal-gray/30 border-b border-terminal-gray">
            <div className="w-3 h-3 rounded-full bg-terminal-red" />
            <div className="w-3 h-3 rounded-full bg-terminal-yellow" />
            <div className="w-3 h-3 rounded-full bg-terminal-green" />
            <span className="ml-2 text-terminal-muted text-sm font-mono">auth.sh</span>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-terminal-green/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-terminal-green" />
              </div>
              <h1 className="text-2xl font-mono font-bold text-white mb-2">{title}</h1>
              <p className="text-terminal-muted font-mono text-sm">{subtitle}</p>
            </div>

            <AnimatePresence mode="wait">
              {!otpSent ? (
                /* Phone Number Input */
                <motion.form
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSendOTP}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-terminal-green font-mono text-sm mb-2">
                      {'>'} phone_number
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-terminal-muted font-mono">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className={cn(
                          'w-full bg-terminal-black border rounded-lg pl-14 pr-4 py-3',
                          'text-white font-mono placeholder:text-terminal-muted',
                          'focus:outline-none focus:ring-2 focus:ring-terminal-green',
                          'border-terminal-gray'
                        )}
                        autoFocus
                      />
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-terminal-muted" />
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-terminal-red text-sm font-mono"
                    >
                      # Error: {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || phoneNumber.length < 10}
                    className={cn(
                      'w-full py-3 rounded-lg font-mono font-bold transition-all duration-200',
                      'flex items-center justify-center gap-2',
                      phoneNumber.length >= 10
                        ? 'bg-terminal-green text-terminal-black hover:bg-terminal-green/90'
                        : 'bg-terminal-gray text-terminal-muted cursor-not-allowed'
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-5 h-5" />
                        Send OTP
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                /* OTP Verification */
                <motion.form
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-terminal-muted hover:text-terminal-green transition-colors font-mono text-sm mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Change number
                  </button>

                  <div className="bg-terminal-gray/20 rounded-lg p-3 mb-4">
                    <p className="text-terminal-muted font-mono text-sm">
                      OTP sent to <span className="text-terminal-green">+91 {phoneNumber}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-terminal-green font-mono text-sm mb-2">
                      {'>'} enter_otp
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className={cn(
                        'w-full bg-terminal-black border rounded-lg px-4 py-3',
                        'text-white font-mono text-center text-2xl tracking-[0.5em] placeholder:tracking-[0.5em]',
                        'focus:outline-none focus:ring-2 focus:ring-terminal-green',
                        'border-terminal-gray'
                      )}
                      autoFocus
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-terminal-red text-sm font-mono"
                    >
                      # Error: {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className={cn(
                      'w-full py-3 rounded-lg font-mono font-bold transition-all duration-200',
                      'flex items-center justify-center gap-2',
                      otp.length === 6
                        ? 'bg-terminal-green text-terminal-black hover:bg-terminal-green/90'
                        : 'bg-terminal-gray text-terminal-muted cursor-not-allowed'
                    )}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Verify & Login
                      </>
                    )}
                  </button>

                  <p className="text-center text-terminal-muted font-mono text-xs mt-4">
                    Didn't receive OTP?{' '}
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-terminal-green hover:underline"
                    >
                      Resend
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Terminal Footer */}
          <div className="px-4 py-2 bg-terminal-gray/20 border-t border-terminal-gray">
            <p className="text-terminal-muted text-xs font-mono text-center">
              🔒 Secured with Firebase Authentication
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
