'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Megaphone,
  Image,
  MessageSquare,
  Terminal,
  Loader2,
  X,
  Calendar,
  Link as LinkIcon,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/lib/auth/context';
import { Banner, BannerType } from '@/lib/db/types';
import { cn } from '@/lib/utils';
import PhoneLogin from '@/components/auth/PhoneLogin';

const bannerTypeInfo = {
  announcement: {
    label: 'Announcement Bar',
    icon: Megaphone,
    description: 'Top strip for urgent notices',
    color: 'terminal-green',
  },
  promotional: {
    label: 'Promotional Banner',
    icon: Image,
    description: 'Large banner for offers',
    color: 'terminal-blue',
  },
  popup: {
    label: 'Popup Modal',
    icon: MessageSquare,
    description: 'Overlay for special deals',
    color: 'terminal-purple',
  },
};

export default function BannersAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Banner>>({
    type: 'announcement',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    backgroundColor: '#00FF41',
    textColor: '#0D0D0D',
    isActive: true,
    priority: 0,
    dismissible: true,
    showOnce: false,
  });
  const [saving, setSaving] = useState(false);

  // Fetch banners
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/banners');
      const data = await response.json();

      if (data.success) {
        setBanners(data.banners || []);
      } else {
        setError(data.error || 'Failed to fetch banners');
      }
    } catch (err) {
      setError('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBanners();
    }
  }, [user]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingBanner
        ? `/api/banners/${editingBanner.id}`
        : '/api/banners';
      const method = editingBanner ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        fetchBanners();
        closeModal();
      } else {
        setError(data.error || 'Failed to save banner');
      }
    } catch (err) {
      setError('Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  // Toggle banner status
  const toggleStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' }),
      });

      const data = await response.json();

      if (data.success) {
        fetchBanners();
      }
    } catch (err) {
      console.error('Error toggling banner:', err);
    }
  };

  // Delete banner
  const deleteBanner = async (id: string) => {
    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchBanners();
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };

  // Open edit modal
  const openEditModal = (banner: Banner) => {
    setFormData(banner);
    setEditingBanner(banner);
    setShowCreateModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowCreateModal(false);
    setEditingBanner(null);
    setFormData({
      type: 'announcement',
      title: '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      backgroundColor: '#00FF41',
      textColor: '#0D0D0D',
      isActive: true,
      priority: 0,
      dismissible: true,
      showOnce: false,
    });
  };

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-terminal-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-terminal-green animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <PhoneLogin title="Admin Login" subtitle="Login to manage banners" />;
  }

  return (
    <div className="min-h-screen bg-terminal-black text-white">
      {/* Header */}
      <header className="bg-terminal-dark border-b border-terminal-gray sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-lg hover:bg-terminal-gray/50 text-terminal-muted hover:text-terminal-green transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-terminal-green/10 border border-terminal-green flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-terminal-green" />
                </div>
                <div>
                  <h1 className="text-white font-mono font-bold">Banner Management</h1>
                  <p className="text-terminal-green text-xs font-mono">Manage ads & promotions</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-terminal-green text-terminal-black rounded-lg font-mono font-medium hover:bg-terminal-green/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Banner
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="bg-terminal-red/10 border border-terminal-red/30 rounded-xl p-4 mb-6">
            <p className="text-terminal-red font-mono">{error}</p>
          </div>
        )}

        {/* Banner Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {(Object.entries(bannerTypeInfo) as [BannerType, typeof bannerTypeInfo.announcement][]).map(
            ([type, info]) => {
              const Icon = info.icon;
              const count = banners.filter((b) => b.type === type).length;
              const activeCount = banners.filter((b) => b.type === type && b.isActive).length;

              return (
                <div
                  key={type}
                  className="bg-terminal-dark border border-terminal-gray rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', `bg-${info.color}/10`)}>
                      <Icon className={cn('w-5 h-5', `text-${info.color}`)} />
                    </div>
                    <div>
                      <p className="text-white font-mono font-bold">{info.label}</p>
                      <p className="text-terminal-muted text-xs font-mono">{info.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-terminal-gray">
                    <span className="text-terminal-muted text-sm font-mono">
                      {count} total
                    </span>
                    <span className="text-terminal-green text-sm font-mono">
                      {activeCount} active
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* Banners List */}
        <div className="bg-terminal-dark border border-terminal-gray rounded-xl overflow-hidden">
          <div className="p-4 border-b border-terminal-gray">
            <h2 className="text-terminal-green font-mono font-bold">
              {'>'} All Banners ({banners.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-terminal-green animate-spin mx-auto mb-4" />
              <p className="text-terminal-muted font-mono">Loading banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone className="w-12 h-12 text-terminal-muted mx-auto mb-4" />
              <p className="text-terminal-muted font-mono mb-4">No banners yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-terminal-green text-terminal-black rounded-lg font-mono font-medium"
              >
                <Plus className="w-4 h-4" />
                Create First Banner
              </button>
            </div>
          ) : (
            <div className="divide-y divide-terminal-gray">
              {banners.map((banner) => {
                const typeInfo = bannerTypeInfo[banner.type];
                const Icon = typeInfo.icon;

                return (
                  <div
                    key={banner.id}
                    className="p-4 hover:bg-terminal-gray/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: banner.backgroundColor || '#333' }}
                        >
                          <Icon
                            className="w-6 h-6"
                            style={{ color: banner.textColor || '#fff' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-mono font-bold truncate">
                              {banner.title}
                            </h3>
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded-full text-xs font-mono',
                                banner.isActive
                                  ? 'bg-terminal-green/20 text-terminal-green'
                                  : 'bg-terminal-gray/50 text-terminal-muted'
                              )}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {banner.subtitle && (
                            <p className="text-terminal-muted text-sm font-mono truncate">
                              {banner.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs font-mono text-terminal-muted">
                            <span className={cn(`text-${typeInfo.color}`)}>
                              {typeInfo.label}
                            </span>
                            <span>Priority: {banner.priority}</span>
                            {banner.startDate && (
                              <span>From: {banner.startDate}</span>
                            )}
                            {banner.endDate && (
                              <span>Until: {banner.endDate}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(banner.id)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            banner.isActive
                              ? 'hover:bg-terminal-yellow/20 text-terminal-yellow'
                              : 'hover:bg-terminal-green/20 text-terminal-green'
                          )}
                          title={banner.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {banner.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(banner)}
                          className="p-2 rounded-lg hover:bg-terminal-blue/20 text-terminal-blue transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(banner.id)}
                          className="p-2 rounded-lg hover:bg-terminal-red/20 text-terminal-red transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-terminal-dark border border-terminal-gray rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-terminal-gray sticky top-0 bg-terminal-dark z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-terminal-green font-mono font-bold text-lg">
                    {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-terminal-muted hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Banner Type */}
                <div>
                  <label className="block text-terminal-green text-sm font-mono mb-2">
                    {'>'} Banner Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.entries(bannerTypeInfo) as [BannerType, typeof bannerTypeInfo.announcement][]).map(
                      ([type, info]) => {
                        const Icon = info.icon;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, type })}
                            className={cn(
                              'p-3 rounded-lg border text-left transition-colors',
                              formData.type === type
                                ? 'border-terminal-green bg-terminal-green/10'
                                : 'border-terminal-gray hover:border-terminal-green/50'
                            )}
                          >
                            <Icon className={cn('w-5 h-5 mb-2', `text-${info.color}`)} />
                            <p className="text-white font-mono text-sm">{info.label}</p>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-terminal-green text-sm font-mono mb-2">
                      {'>'} Title <span className="text-terminal-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Banner title"
                      className="w-full input-terminal rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-terminal-green text-sm font-mono mb-2">
                      {'>'} Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle || ''}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Optional subtitle"
                      className="w-full input-terminal rounded-lg"
                    />
                  </div>
                </div>

                {/* Button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-terminal-green text-sm font-mono mb-2">
                      <LinkIcon className="w-4 h-4 inline mr-1" />
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText || ''}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      placeholder="e.g., Book Now"
                      className="w-full input-terminal rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-terminal-green text-sm font-mono mb-2">
                      <LinkIcon className="w-4 h-4 inline mr-1" />
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={formData.buttonLink || ''}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      placeholder="e.g., #booking or /packages"
                      className="w-full input-terminal rounded-lg"
                    />
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-terminal-green text-sm font-mono mb-2">
                      <Palette className="w-4 h-4 inline mr-1" />
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.backgroundColor || '#00FF41'}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.backgroundColor || '#00FF41'}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="flex-1 input-terminal rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-terminal-green text-sm font-mono mb-2">
                      <Palette className="w-4 h-4 inline mr-1" />
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.textColor || '#0D0D0D'}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.textColor || '#0D0D0D'}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="flex-1 input-terminal rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-terminal-green text-sm font-mono mb-2">
                    {'>'} Preview
                  </label>
                  <div
                    className="p-4 rounded-lg text-center"
                    style={{
                      backgroundColor: formData.backgroundColor || '#00FF41',
                      color: formData.textColor || '#0D0D0D',
                    }}
                  >
                    <p className="font-mono font-bold">{formData.title || 'Banner Title'}</p>
                    {formData.subtitle && (
                      <p className="text-sm opacity-80">{formData.subtitle}</p>
                    )}
                    {formData.buttonText && (
                      <button
                        type="button"
                        className="mt-2 px-4 py-1 rounded text-sm font-mono"
                        style={{
                          backgroundColor: formData.textColor || '#0D0D0D',
                          color: formData.backgroundColor || '#00FF41',
                        }}
                      >
                        {formData.buttonText}
                      </button>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-terminal-green text-sm font-mono mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full input-terminal rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-terminal-green text-sm font-mono mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date (optional)
                    </label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full input-terminal rounded-lg"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-terminal-green text-sm font-mono mb-2">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={formData.priority || 0}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      className="w-full input-terminal rounded-lg"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-7">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="isActive" className="text-white font-mono text-sm">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-7">
                    <input
                      type="checkbox"
                      id="dismissible"
                      checked={formData.dismissible ?? true}
                      onChange={(e) => setFormData({ ...formData, dismissible: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="dismissible" className="text-white font-mono text-sm">
                      Dismissible
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pt-7">
                    <input
                      type="checkbox"
                      id="showOnce"
                      checked={formData.showOnce ?? false}
                      onChange={(e) => setFormData({ ...formData, showOnce: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="showOnce" className="text-white font-mono text-sm">
                      Show Once
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-terminal-gray">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-terminal-muted hover:text-white font-mono transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formData.title}
                    className="flex items-center gap-2 px-6 py-2 bg-terminal-green text-terminal-black rounded-lg font-mono font-medium hover:bg-terminal-green/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>{editingBanner ? 'Update Banner' : 'Create Banner'}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-terminal-dark border border-terminal-gray rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-mono font-bold text-lg mb-2">
                Delete Banner?
              </h3>
              <p className="text-terminal-muted font-mono text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-terminal-muted hover:text-white font-mono"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteBanner(deleteConfirm)}
                  className="px-4 py-2 bg-terminal-red text-white rounded-lg font-mono hover:bg-terminal-red/90"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
