'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import PhoneLogin from '@/components/auth/PhoneLogin';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/my-bookings');
    }
  }, [user, loading, router]);

  const handleLoginSuccess = () => {
    router.push('/my-bookings');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-terminal-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <PhoneLogin
      title="Customer Login"
      subtitle="Login to view your bookings and get faster checkout"
      onSuccess={handleLoginSuccess}
    />
  );
}
