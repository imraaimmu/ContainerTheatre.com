'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Banner } from '@/lib/db/types';

export default function AnnouncementBar() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if previously dismissed in this session
    const dismissedBanners = sessionStorage.getItem('dismissedAnnouncements');
    if (dismissedBanners) {
      const parsed = JSON.parse(dismissedBanners);
      if (parsed.length > 0) {
        // We'll check against specific banner ID after fetching
      }
    }

    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const response = await fetch('/api/banners?type=announcement&active=true');
      const data = await response.json();

      if (data.success && data.banners && data.banners.length > 0) {
        const activeBanner = data.banners[0]; // Get highest priority

        // Check if this specific banner was dismissed
        const dismissedBanners = sessionStorage.getItem('dismissedAnnouncements');
        if (dismissedBanners) {
          const parsed = JSON.parse(dismissedBanners);
          if (parsed.includes(activeBanner.id)) {
            setDismissed(true);
          }
        }

        setBanner(activeBanner);
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    if (banner) {
      // Store dismissed banner ID in session
      const dismissedBanners = sessionStorage.getItem('dismissedAnnouncements');
      const parsed = dismissedBanners ? JSON.parse(dismissedBanners) : [];
      parsed.push(banner.id);
      sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(parsed));
    }
    setDismissed(true);
  };

  if (loading || !banner || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-50"
        style={{
          backgroundColor: banner.backgroundColor || '#00FF41',
          color: banner.textColor || '#0D0D0D',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center gap-4 text-center">
            <p className="font-mono text-sm font-medium">
              {banner.title}
              {banner.subtitle && (
                <span className="ml-2 opacity-80">{banner.subtitle}</span>
              )}
            </p>

            {banner.buttonText && banner.buttonLink && (
              <Link
                href={banner.buttonLink}
                className="px-3 py-1 rounded text-xs font-mono font-bold transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: banner.textColor || '#0D0D0D',
                  color: banner.backgroundColor || '#00FF41',
                }}
              >
                {banner.buttonText}
              </Link>
            )}

            {banner.dismissible && (
              <button
                onClick={handleDismiss}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-70 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
