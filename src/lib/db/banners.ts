// Banner Database Operations (Server-Side)
import { getAdminDb, isFirebaseAdminConfigured } from '../firebase-admin';
import { Banner, CreateBannerInput, BannerType, BannerFilters } from './types';

const COLLECTION = 'banners';

// Demo banners for when Firebase is not configured
const demoBanners: Banner[] = [
  {
    id: 'demo_announcement_1',
    type: 'announcement',
    title: '🎉 Grand Opening Special!',
    subtitle: 'Get 20% off on all packages this week',
    buttonText: 'Book Now',
    buttonLink: '#booking',
    backgroundColor: '#00FF41',
    textColor: '#0D0D0D',
    isActive: true,
    priority: 10,
    dismissible: true,
    showOnce: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo_promo_1',
    type: 'promotional',
    title: 'Valentine\'s Special',
    subtitle: 'Romantic movie night for couples',
    content: 'Book our Pair Programming package and get complimentary decoration!',
    buttonText: 'View Offer',
    buttonLink: '#booking',
    backgroundColor: '#FF1744',
    textColor: '#FFFFFF',
    isActive: true,
    priority: 5,
    dismissible: false,
    showOnce: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Generate unique banner ID
function generateBannerId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BNR${timestamp}${random}`;
}

// Create a new banner
export async function createBanner(input: CreateBannerInput): Promise<Banner> {
  const now = new Date();
  const banner: Banner = {
    id: generateBannerId(),
    type: input.type,
    title: input.title,
    subtitle: input.subtitle,
    content: input.content,
    imageUrl: input.imageUrl,
    buttonText: input.buttonText,
    buttonLink: input.buttonLink,
    backgroundColor: input.backgroundColor,
    textColor: input.textColor,
    isActive: input.isActive ?? true,
    startDate: input.startDate,
    endDate: input.endDate,
    priority: input.priority ?? 0,
    dismissible: input.dismissible ?? true,
    showOnce: input.showOnce ?? false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (!isFirebaseAdminConfigured()) {
    console.log('Demo mode - Banner created:', banner);
    demoBanners.push(banner);
    return banner;
  }

  const db = getAdminDb();
  await db.collection(COLLECTION).doc(banner.id).set(banner);

  return banner;
}

// Get banner by ID
export async function getBannerById(id: string): Promise<Banner | null> {
  if (!isFirebaseAdminConfigured()) {
    return demoBanners.find((b) => b.id === id) || null;
  }

  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as Banner;
}

// Get all banners with optional filters
export async function getBanners(filters?: BannerFilters): Promise<Banner[]> {
  if (!isFirebaseAdminConfigured()) {
    let filtered = [...demoBanners];

    if (filters?.type) {
      filtered = filtered.filter((b) => b.type === filters.type);
    }
    if (filters?.isActive !== undefined) {
      filtered = filtered.filter((b) => b.isActive === filters.isActive);
    }

    return filtered.sort((a, b) => b.priority - a.priority);
  }

  const db = getAdminDb();
  let query = db.collection(COLLECTION).orderBy('priority', 'desc');

  if (filters?.type) {
    query = query.where('type', '==', filters.type);
  }
  if (filters?.isActive !== undefined) {
    query = query.where('isActive', '==', filters.isActive);
  }

  const snapshot = await query.get();
  const banners: Banner[] = [];

  snapshot.forEach((doc) => {
    banners.push(doc.data() as Banner);
  });

  return banners;
}

// Get active banners for display (checks date range)
export async function getActiveBanners(type?: BannerType): Promise<Banner[]> {
  const today = new Date().toISOString().split('T')[0];
  const allBanners = await getBanners({ type, isActive: true });

  // Filter by date range
  return allBanners.filter((banner) => {
    if (banner.startDate && banner.startDate > today) return false;
    if (banner.endDate && banner.endDate < today) return false;
    return true;
  });
}

// Update banner
export async function updateBanner(
  id: string,
  updates: Partial<Omit<Banner, 'id' | 'createdAt'>>
): Promise<boolean> {
  const now = new Date();

  if (!isFirebaseAdminConfigured()) {
    const index = demoBanners.findIndex((b) => b.id === id);
    if (index !== -1) {
      demoBanners[index] = {
        ...demoBanners[index],
        ...updates,
        updatedAt: now.toISOString(),
      };
      return true;
    }
    return false;
  }

  const db = getAdminDb();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({
      ...updates,
      updatedAt: now.toISOString(),
    });

  return true;
}

// Toggle banner active status
export async function toggleBannerStatus(id: string): Promise<boolean> {
  const banner = await getBannerById(id);
  if (!banner) return false;

  return updateBanner(id, { isActive: !banner.isActive });
}

// Delete banner
export async function deleteBanner(id: string): Promise<boolean> {
  if (!isFirebaseAdminConfigured()) {
    const index = demoBanners.findIndex((b) => b.id === id);
    if (index !== -1) {
      demoBanners.splice(index, 1);
      return true;
    }
    return false;
  }

  const db = getAdminDb();
  await db.collection(COLLECTION).doc(id).delete();

  return true;
}
