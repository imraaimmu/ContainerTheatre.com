'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, KeyRound, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneVerificationProps {
  phoneNumber: string;
  onVerified: (userId: string) => void;
  onSkip?: () => void;
}

export default function PhoneVerification({
  phoneNumber,
  onVerified,
  onSkip,
}: PhoneVerificationProps) {
  const [step, setStep] = useState<'send' | 'verify' | 'verified'>('send');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isDemo, setIsDemo] = useState(false);

  // Format phone for display
  const displayPhone = phoneNumber.startsWith('+91')
    ? phoneNumber
    : `+91 ${phoneNumber}`;

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setIsDemo(data.demo || false);
        setStep('verify');
        setCountdown(30);

        if (data.demo) {
          setError('Demo mode: Use OTP 123456');
        }
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!sessionId || otp.length !== 6) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, otp }),
      });

      const data = await response.json();

      if (data.success && data.verified) {
        setStep('verified');

        // Small delay to show success state
        setTimeout(() => {
          onVerified(`verified_${phoneNumber}_${Date.now()}`);
        }, 500);
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp('');
    setError(null);
    setSessionId(null);
    setStep('send');
  };

  return (
    <div className="bg-terminal-dark border border-terminal-gray rounded-xl p-6">
      {step === 'send' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-terminal-green/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-terminal-green" />
          </div>

          <h3 className="text-xl font-mono font-bold text-white mb-2">
            Verify Your Phone
          </h3>
          <p className="text-terminal-muted font-mono text-sm mb-6">
            We'll send an OTP to verify your number
          </p>

          <div className="bg-terminal-gray/30 rounded-lg p-4 mb-6">
            <p className="text-terminal-green font-mono text-lg">{displayPhone}</p>
          </div>

          {error && (
            <p className="text-terminal-red font-mono text-sm mb-4">{error}</p>
          )}

          <button
            onClick={handleSendOTP}
            disabled={loading}
            className={cn(
              'w-full py-3 rounded-lg font-mono font-bold transition-all duration-200',
              'flex items-center justify-center gap-2',
              'bg-terminal-green text-terminal-black hover:bg-terminal-green/90',
              loading && 'opacity-70 cursor-wait'
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
        </motion.div>
      )}

      {step === 'verify' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-terminal-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-terminal-blue" />
          </div>

          <h3 className="text-xl font-mono font-bold text-white mb-2">
            Enter OTP
          </h3>
          <p className="text-terminal-muted font-mono text-sm mb-6">
            6-digit code sent to {displayPhone}
          </p>

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className={cn(
              'w-full bg-terminal-black border rounded-lg px-4 py-4 mb-4',
              'text-white font-mono text-center text-2xl tracking-[0.5em] placeholder:tracking-[0.5em]',
              'focus:outline-none focus:ring-2 focus:ring-terminal-green',
              'border-terminal-gray'
            )}
            autoFocus
          />

          {error && (
            <p className={cn(
              'font-mono text-sm mb-4',
              isDemo ? 'text-terminal-yellow' : 'text-terminal-red'
            )}>{error}</p>
          )}

          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className={cn(
              'w-full py-3 rounded-lg font-mono font-bold transition-all duration-200',
              'flex items-center justify-center gap-2',
              otp.length === 6
                ? 'bg-terminal-green text-terminal-black hover:bg-terminal-green/90'
                : 'bg-terminal-gray text-terminal-muted cursor-not-allowed',
              loading && 'opacity-70 cursor-wait'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Verify OTP
              </>
            )}
          </button>

          <button
            onClick={handleResendOTP}
            disabled={countdown > 0}
            className={cn(
              'mt-4 flex items-center justify-center gap-2 text-sm font-mono mx-auto',
              countdown > 0 ? 'text-terminal-muted cursor-not-allowed' : 'text-terminal-green hover:underline'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
          </button>
        </motion.div>
      )}

      {step === 'verified' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-terminal-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-terminal-green" />
          </div>

          <h3 className="text-xl font-mono font-bold text-white mb-2">
            Phone Verified!
          </h3>
          <p className="text-terminal-green font-mono text-sm">
            Proceeding to payment...
          </p>
        </motion.div>
      )}
    </div>
  );
}
