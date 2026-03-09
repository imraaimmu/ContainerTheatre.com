# Container Theatre v1.0 - Project Memory

## Implementation Log

### FIREBASE-001: Firebase Backend Integration
- **Date**: 2026-03-07
- **Status**: FIXED
- **Description**: Complete Firebase Firestore backend for booking management
- **Key Files**:
  - `src/lib/firebase.ts` - Client SDK (singleton pattern)
  - `src/lib/firebase-admin.ts` - Admin SDK with service account support
  - `src/lib/db/types.ts` - TypeScript interfaces (Booking, BookingStatus, etc.)
  - `src/lib/db/bookings.ts` - All database operations (CRUD, availability)
  - `src/app/api/bookings/route.ts` - List and create bookings
  - `src/app/api/bookings/[id]/route.ts` - Get and update single booking
  - `src/app/api/bookings/stats/route.ts` - Booking statistics
  - `src/app/api/availability/route.ts` - Slot availability checking
  - `src/app/api/razorpay/verify-payment/route.ts` - Payment + booking creation
  - `src/app/admin/page.tsx` - Admin dashboard
  - `src/components/booking/DateTimePicker.tsx` - Real-time availability display
- **Lesson**:
  - Use demo mode when Firebase credentials not configured
  - Double-booking prevention: check slot availability before payment verification
  - Firebase Admin SDK requires service account for server-side operations

### RAZORPAY-001: Payment Integration
- **Date**: 2026-03-07
- **Status**: FIXED
- **Description**: Razorpay payment gateway integration with demo mode
- **Key Files**:
  - `src/lib/razorpay.ts` - Client-side Razorpay utilities
  - `src/app/api/razorpay/create-order/route.ts` - Order creation
  - `src/app/api/razorpay/verify-payment/route.ts` - Signature verification
  - `src/components/booking/BookingSummary.tsx` - Payment flow UI
- **Lesson**:
  - Demo mode uses `order_demo_` prefix to skip signature verification
  - Store booking AFTER payment verification, not before

### AUTH-001: Phone OTP Authentication (Admin)
- **Date**: 2026-03-07
- **Status**: FIXED
- **Description**: Firebase phone number OTP authentication for admin panel
- **Key Files**:
  - `src/lib/auth/context.tsx` - Auth context with phone OTP flow
  - `src/components/auth/PhoneLogin.tsx` - Phone login UI component
  - `src/app/layout.tsx` - AuthProvider wrapper
  - `src/app/admin/page.tsx` - Protected with auth guard
- **Features**:
  - Phone number input with +91 prefix (India)
  - 6-digit OTP verification
  - Invisible reCAPTCHA for spam protection
  - Admin whitelist via NEXT_PUBLIC_ADMIN_PHONES env var
  - Sign out functionality
- **Lesson**:
  - Firebase phone auth requires reCAPTCHA verifier
  - Use invisible reCAPTCHA for better UX
  - Whitelist empty = dev mode (allows all authenticated users)

### AUTH-002: Progressive Customer Authentication
- **Date**: 2026-03-07
- **Status**: FIXED
- **Description**: Smart hybrid auth - OTP at checkout for guests, optional login for returning customers
- **Key Files**:
  - `src/lib/db/types.ts` - Added Customer interface
  - `src/lib/db/customers.ts` - Customer database operations
  - `src/app/api/customers/route.ts` - Create/get customer API
  - `src/app/api/customers/[phone]/bookings/route.ts` - Customer bookings API
  - `src/components/booking/PhoneVerification.tsx` - OTP verification at checkout
  - `src/components/booking/BookingSummary.tsx` - Integrated OTP before payment
  - `src/components/booking/CustomerForm.tsx` - Pre-fill for logged-in users
  - `src/components/ui/Header.tsx` - Login button and user menu
  - `src/app/login/page.tsx` - Customer login page
  - `src/app/my-bookings/page.tsx` - Customer booking history
- **Flow**:
  1. First-time: Enter details → OTP verify → Pay → Account auto-created
  2. Returning (guest): Enter details → OTP verify → Pay → Linked to account
  3. Returning (logged in): Details pre-filled → Pay (no OTP) → Added to history
- **Lesson**:
  - OTP verification at checkout reduces fake bookings
  - Silent account creation = zero friction signup
  - Logged-in users skip OTP (already verified)

## Architecture Decisions

### Database Schema
- **Collection**: `bookings`
  - Links to customer via `customerId`
  - Status Flow: pending → confirmed → completed / cancelled
  - Slot IDs: morning, afternoon, evening, night
  - Unique Constraint: One booking per date+slot combination

- **Collection**: `customers`
  - Primary key: phone number (without country code)
  - Auto-created on first verified booking
  - Tracks totalBookings and lastBookingDate

### Pricing Structure
- 10 packages with tech-themed naming (Pair Programming, Full Stack Party, etc.)
- Weekend premium pricing
- Add-ons: decoration, cake, photography, etc.
- Advance payment: 50% upfront

## Environment Setup

1. Create `.env.local` from `.env.example`
2. Add Firebase project credentials (from Firebase Console)
3. Download service account JSON for server-side operations
4. Add Razorpay API keys (from Razorpay Dashboard)
5. Enable Phone Authentication in Firebase Console (Authentication > Sign-in method)
6. Add your admin phone numbers to `NEXT_PUBLIC_ADMIN_PHONES`
