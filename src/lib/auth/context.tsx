'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  error: string | null;
  otpSent: boolean;
  resetAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setupRecaptcha = () => {
    if (!auth) return null;

    if (recaptchaVerifier) {
      return recaptchaVerifier;
    }

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please try again.');
        setRecaptchaVerifier(null);
      },
    });

    setRecaptchaVerifier(verifier);
    return verifier;
  };

  const sendOTP = async (phoneNumber: string) => {
    if (!auth) {
      setError('Authentication not configured');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const verifier = setupRecaptcha();
      if (!verifier) {
        throw new Error('Could not setup reCAPTCHA');
      }

      // Format phone number for India if not already formatted
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+91${phoneNumber.replace(/^0/, '')}`;

      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP');
      // Reset recaptcha on error
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        setRecaptchaVerifier(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otp: string): Promise<boolean> => {
    if (!confirmationResult) {
      setError('Please request OTP first');
      return false;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      setUser(result.user);
      setOtpSent(false);
      setConfirmationResult(null);
      return true;
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError('Invalid OTP. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;

    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message || 'Failed to sign out');
    }
  };

  const resetAuth = () => {
    setError(null);
    setOtpSent(false);
    setConfirmationResult(null);
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      setRecaptchaVerifier(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sendOTP,
        verifyOTP,
        signOut,
        error,
        otpSent,
        resetAuth,
      }}
    >
      {children}
      <div id="recaptcha-container" />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
