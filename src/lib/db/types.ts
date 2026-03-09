// Database Types for Container Theatre

// Customer profile (auto-created on first booking)
export interface Customer {
  id: string;
  phone: string;              // Primary identifier (without country code)
  phoneWithCode: string;      // Full phone with +91
  name: string;
  email?: string;

  // Stats
  totalBookings: number;
  lastBookingDate?: string;

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLoginAt?: Date | string;
}

export interface CreateCustomerInput {
  phone: string;
  name: string;
  email?: string;
}

export type BookingStatus =
  | 'pending'      // Payment initiated but not completed
  | 'confirmed'    // Payment successful, booking confirmed
  | 'completed'    // Event has happened
  | 'cancelled'    // Booking cancelled
  | 'no-show';     // Customer didn't show up

export interface Booking {
  id: string;

  // Customer link
  customerId?: string;        // Links to Customer document

  // Customer details
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guests: number;
  specialRequests?: string;

  // Booking details
  packageId: string;
  packageName: string;
  date: string;           // Format: YYYY-MM-DD
  slot: string;           // morning, afternoon, evening, night

  // Pricing
  packagePrice: number;
  addOnsPrice: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  isWeekend: boolean;

  // Add-ons
  addOns: {
    id: string;
    name: string;
    price: number;
  }[];

  // Payment details
  paymentId?: string;      // Razorpay payment ID
  orderId?: string;        // Razorpay order ID
  paymentMethod?: string;  // upi, card, netbanking, etc.

  // Status
  status: BookingStatus;

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
  confirmedAt?: Date | string;
  completedAt?: Date | string;
  cancelledAt?: Date | string;

  // Internal notes (admin only)
  internalNotes?: string;
}

export interface SlotAvailability {
  date: string;
  slot: string;
  isAvailable: boolean;
  bookingId?: string;
}

export interface DayAvailability {
  date: string;
  slots: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
}

// Create booking input (subset of Booking)
export interface CreateBookingInput {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guests: number;
  specialRequests?: string;
  packageId: string;
  packageName: string;
  date: string;
  slot: string;
  packagePrice: number;
  addOnsPrice: number;
  totalAmount: number;
  advancePaid: number;
  isWeekend: boolean;
  addOns: {
    id: string;
    name: string;
    price: number;
  }[];
  paymentId?: string;
  orderId?: string;
}

// Admin dashboard filters
export interface BookingFilters {
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Booking statistics
export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  advanceCollected: number;
  pendingBalance: number;
}

// Banner types for promotional content
export type BannerType = 'announcement' | 'promotional' | 'popup';

export interface Banner {
  id: string;
  type: BannerType;
  title: string;
  subtitle?: string;

  // Content
  content?: string;           // Rich text / HTML content
  imageUrl?: string;          // Background or promotional image
  buttonText?: string;        // CTA button text
  buttonLink?: string;        // CTA button link

  // Styling
  backgroundColor?: string;   // Hex color
  textColor?: string;         // Hex color

  // Scheduling
  isActive: boolean;
  startDate?: string;         // When to start showing (YYYY-MM-DD)
  endDate?: string;           // When to stop showing (YYYY-MM-DD)

  // Display settings
  priority: number;           // Higher = shows first (for multiple banners)
  dismissible: boolean;       // Can user close it?
  showOnce: boolean;          // Show only once per session (for popups)

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateBannerInput {
  type: BannerType;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  priority?: number;
  dismissible?: boolean;
  showOnce?: boolean;
}

export interface BannerFilters {
  type?: BannerType;
  isActive?: boolean;
}
