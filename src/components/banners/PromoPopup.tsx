'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Banner } from '@/lib/db/types';

interface PromoPopupProps {
  delay?: number; // Delay before showing popup (ms)
}

export default function PromoPopup({ delay = 3000 }: PromoPopupProps) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanner();
  }, []);

  useEffect(() => {
    if (!banner || loading) return;

    // Check if already shown in this session
    if (banner.showOnce) {
      const shownPopups = sessionStorage.getItem('shownPopups');
      if (shownPopups) {
        const parsed = JSON.parse(shownPopups);
        if (parsed.includes(banner.id)) {
          return; // Don't show again
        }
      }
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [banner, loading, delay]);

  const fetchBanner = async () => {
    try {
      const response = await fetch('/api/banners?type=popup&active=true');
      const data = await response.json();

      if (data.success && data.banners && data.banners.length > 0) {
        setBanner(data.banners[0]); // Get highest priority
      }
    } catch (error) {
      console.error('Error fetching popup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (banner?.showOnce) {
      // Mark as shown in session
      const shownPopups = sessionStorage.getItem('shownPopups');
      const parsed = shownPopups ? JSON.parse(shownPopups) : [];
      parsed.push(banner.id);
      sessionStorage.setItem('shownPopups', JSON.stringify(parsed));
    }
    setIsVisible(false);
  };

  if (!banner || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]"
        onClick={banner.dismissible ? handleClose : undefined}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backgroundColor: banner.backgroundColor || '#1a1a2e',
            color: banner.textColor || '#ffffff',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {banner.dismissible && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Background image */}
          {banner.imageUrl && (
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center"
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
            />
          )}

          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Decorative element */}
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{
                backgroundColor: `${banner.textColor}20` || 'rgba(255,255,255,0.1)',
              }}
            >
              <span className="text-3xl">🎉</span>
            </div>

            <h3 className="text-2xl font-mono font-bold mb-3">
              {banner.title}
            </h3>

            {banner.subtitle && (
              <p className="text-lg font-mono opacity-90 mb-3">
                {banner.subtitle}
              </p>
            )}

            {banner.content && (
              <p className="text-sm font-mono opacity-75 mb-6">
                {banner.content}
              </p>
            )}

            {banner.buttonText && banner.buttonLink && (
              <Link
                href={banner.buttonLink}
                onClick={handleClose}
                className="inline-block px-8 py-3 rounded-lg font-mono font-bold text-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: banner.textColor || '#ffffff',
                  color: banner.backgroundColor || '#1a1a2e',
                }}
              >
                {banner.buttonText}
              </Link>
            )}

            {banner.dismissible && (
              <button
                onClick={handleClose}
                className="block w-full mt-4 text-sm font-mono opacity-60 hover:opacity-100 transition-opacity"
              >
                No thanks
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
