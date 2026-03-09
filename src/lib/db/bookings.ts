// Booking Database Operations (Server-Side)
import { getAdminFirestore, isAdminConfigured } from '../firebase-admin';
import {
  Booking,
  CreateBookingInput,
  BookingStatus,
  SlotAvailability,
  DayAvailability,
  BookingFilters,
  BookingStats,
} from './types';

const COLLECTION = 'bookings';

// Generate unique booking ID
function generateBookingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CT${timestamp}${random}`;
}

// Create a new booking
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  // Demo mode if Firebase not configured
  if (!isAdminConfigured()) {
    const booking: Booking = {
      id: generateBookingId(),
      ...input,
      balanceDue: input.totalAmount - input.advancePaid,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    };
    console.log('Demo mode - Booking created:', booking);
    return booking;
  }

  const db = getAdminFirestore();
  const bookingId = generateBookingId();

  const booking: Booking = {
    id: bookingId,
    ...input,
    balanceDue: input.totalAmount - input.advancePaid,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confirmedAt: new Date().toISOString(),
  };

  await db.collection(COLLECTION).doc(bookingId).set(booking);

  return booking;
}

// Get booking by ID
export async function getBookingById(id: string): Promise<Booking | null> {
  if (!isAdminConfigured()) {
    console.log('Demo mode - getBookingById:', id);
    return null;
  }

  const db = getAdminFirestore();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as Booking;
}

// Get all bookings with optional filters
export async function getBookings(filters?: BookingFilters): Promise<Booking[]> {
  if (!isAdminConfigured()) {
    console.log('Demo mode - getBookings');
    return [];
  }

  const db = getAdminFirestore();
  let query = db.collection(COLLECTION).orderBy('createdAt', 'desc');

  if (filters?.status) {
    query = query.where('status', '==', filters.status);
  }

  if (filters?.dateFrom) {
    query = query.where('date', '>=', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.where('date', '<=', filters.dateTo);
  }

  const snapshot = await query.limit(100).get();
  const bookings: Booking[] = [];

  snapshot.forEach((doc) => {
    const booking = doc.data() as Booking;

    // Apply search filter (client-side since Firestore doesn't support full-text search)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      if (
        !booking.customerName.toLowerCase().includes(searchLower) &&
        !booking.customerPhone.includes(filters.search) &&
        !booking.id.toLowerCase().includes(searchLower)
      ) {
        return;
      }
    }

    bookings.push(booking);
  });

  return bookings;
}

// Update booking status
export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  notes?: string
): Promise<boolean> {
  if (!isAdminConfigured()) {
    console.log('Demo mode - updateBookingStatus:', id, status);
    return true;
  }

  const db = getAdminFirestore();
  const updateData: Partial<Booking> = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (status === 'completed') {
    updateData.completedAt = new Date().toISOString();
  } else if (status === 'cancelled') {
    updateData.cancelledAt = new Date().toISOString();
  }

  if (notes) {
    updateData.internalNotes = notes;
  }

  await db.collection(COLLECTION).doc(id).update(updateData);
  return true;
}

// Check if a slot is available
export async function checkSlotAvailability(
  date: string,
  slot: string
): Promise<SlotAvailability> {
  if (!isAdminConfigured()) {
    // Demo mode - always available
    return { date, slot, isAvailable: true };
  }

  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('date', '==', date)
    .where('slot', '==', slot)
    .where('status', 'in', ['confirmed', 'pending'])
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { date, slot, isAvailable: true };
  }

  const booking = snapshot.docs[0].data() as Booking;
  return {
    date,
    slot,
    isAvailable: false,
    bookingId: booking.id,
  };
}

// Get availability for a specific date
export async function getDayAvailability(date: string): Promise<DayAvailability> {
  if (!isAdminConfigured()) {
    // Demo mode - all slots available
    return {
      date,
      slots: {
        morning: true,
        afternoon: true,
        evening: true,
        night: true,
      },
    };
  }

  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('date', '==', date)
    .where('status', 'in', ['confirmed', 'pending'])
    .get();

  const bookedSlots = new Set<string>();
  snapshot.forEach((doc) => {
    const booking = doc.data() as Booking;
    bookedSlots.add(booking.slot);
  });

  return {
    date,
    slots: {
      morning: !bookedSlots.has('morning'),
      afternoon: !bookedSlots.has('afternoon'),
      evening: !bookedSlots.has('evening'),
      night: !bookedSlots.has('night'),
    },
  };
}

// Get availability for date range
export async function getDateRangeAvailability(
  startDate: string,
  endDate: string
): Promise<Record<string, DayAvailability>> {
  if (!isAdminConfigured()) {
    // Demo mode - all slots available (return empty object, let frontend handle defaults)
    return {};
  }

  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .where('status', 'in', ['confirmed', 'pending'])
    .get();

  const availability: Record<string, DayAvailability> = {};

  snapshot.forEach((doc) => {
    const booking = doc.data() as Booking;
    const date = booking.date;

    if (!availability[date]) {
      availability[date] = {
        date,
        slots: {
          morning: true,
          afternoon: true,
          evening: true,
          night: true,
        },
      };
    }

    availability[date].slots[booking.slot as keyof typeof availability[typeof date]['slots']] = false;
  });

  return availability;
}

// Get booking statistics
export async function getBookingStats(
  dateFrom?: string,
  dateTo?: string
): Promise<BookingStats> {
  if (!isAdminConfigured()) {
    return {
      totalBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0,
      advanceCollected: 0,
      pendingBalance: 0,
    };
  }

  const db = getAdminFirestore();
  let query = db.collection(COLLECTION) as FirebaseFirestore.Query;

  if (dateFrom) {
    query = query.where('date', '>=', dateFrom);
  }
  if (dateTo) {
    query = query.where('date', '<=', dateTo);
  }

  const snapshot = await query.get();

  const stats: BookingStats = {
    totalBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    advanceCollected: 0,
    pendingBalance: 0,
  };

  snapshot.forEach((doc) => {
    const booking = doc.data() as Booking;
    stats.totalBookings++;

    switch (booking.status) {
      case 'confirmed':
        stats.confirmedBookings++;
        stats.advanceCollected += booking.advancePaid;
        stats.pendingBalance += booking.balanceDue;
        break;
      case 'completed':
        stats.completedBookings++;
        stats.totalRevenue += booking.totalAmount;
        stats.advanceCollected += booking.advancePaid;
        break;
      case 'cancelled':
        stats.cancelledBookings++;
        break;
    }
  });

  return stats;
}

// Get bookings for a specific date
export async function getBookingsByDate(date: string): Promise<Booking[]> {
  if (!isAdminConfigured()) {
    return [];
  }

  const db = getAdminFirestore();
  const snapshot = await db
    .collection(COLLECTION)
    .where('date', '==', date)
    .orderBy('slot')
    .get();

  const bookings: Booking[] = [];
  snapshot.forEach((doc) => {
    bookings.push(doc.data() as Booking);
  });

  return bookings;
}

// Get upcoming bookings
export async function getUpcomingBookings(limit = 10): Promise<Booking[]> {
  if (!isAdminConfigured()) {
    return [];
  }

  const db = getAdminFirestore();
  const today = new Date().toISOString().split('T')[0];

  const snapshot = await db
    .collection(COLLECTION)
    .where('date', '>=', today)
    .where('status', '==', 'confirmed')
    .orderBy('date')
    .orderBy('slot')
    .limit(limit)
    .get();

  const bookings: Booking[] = [];
  snapshot.forEach((doc) => {
    bookings.push(doc.data() as Booking);
  });

  return bookings;
}
