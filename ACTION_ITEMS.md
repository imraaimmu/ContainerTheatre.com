# Container Theatre v1.0 - Action Items

## Priority: HIGH (Required for Launch)

### 1. Firebase Setup (Database Only)
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Enable **Firestore Database** (production mode)
- [ ] Get Firebase Admin credentials and update `.env.local`:
  ```
  FIREBASE_PROJECT_ID=your_project_id
  FIREBASE_CLIENT_EMAIL=your_service_account_email
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  ```

### 2. 2Factor SMS OTP Setup
- [ ] Create account at https://2factor.in
- [ ] Get API key from Dashboard
- [ ] Add to `.env.local`:
  ```
  TWO_FACTOR_API_KEY=your_2factor_api_key
  ```
- [ ] Cost: ~0.20 INR per OTP (much cheaper than Firebase)

### 3. Razorpay Setup
- [ ] Create Razorpay account at https://razorpay.com
- [ ] Complete KYC verification
- [ ] Get API keys from Dashboard > Settings > API Keys
- [ ] Update `.env.local`:
  ```
  RAZORPAY_KEY_ID=rzp_live_xxxxx
  RAZORPAY_KEY_SECRET=your_secret_key
  NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
  ```

### 4. Admin Phone Numbers
- [ ] Update admin whitelist in `src/lib/auth.ts`:
  ```typescript
  const ADMIN_PHONES = [
    '+91XXXXXXXXXX',  // Your phone number
    '+91XXXXXXXXXX',  // Other admin phone
  ];
  ```

### 5. Contact Information
- [ ] Update phone number in `src/app/page.tsx` (Contact section ~line 330)
- [ ] Update WhatsApp link with actual number
- [ ] Update Instagram handle
- [ ] Update Google Maps link with actual location

---

## Priority: MEDIUM (Before Public Launch)

### 5. Business Details
- [ ] Update theatre address in Footer component
- [ ] Add actual business hours if different from 10 AM - 11 PM
- [ ] Update package prices in `src/lib/db/packages.ts` if needed

### 6. Create Initial Banners
- [ ] Go to `/admin/banners` after login
- [ ] Create announcement banner (e.g., "Grand Opening!")
- [ ] Create promotional banner for any launch offers

### 7. SEO & Metadata
- [ ] Update site title/description in `src/app/layout.tsx`
- [ ] Add favicon (replace `/app/favicon.ico`)
- [ ] Add Open Graph image for social sharing

---

## Priority: LOW (Post-Launch Improvements)

### 8. Optional Enhancements
- [ ] Add Google Analytics tracking
- [ ] Set up email notifications for bookings
- [ ] Add more testimonials from real customers
- [ ] Upload actual theatre photos

### 9. Domain & Hosting
- [ ] Purchase domain name
- [ ] Deploy to Vercel/hosting provider
- [ ] Configure custom domain
- [ ] Set up SSL certificate (usually automatic)

---

## Quick Reference

| Feature | Admin URL | Status |
|---------|-----------|--------|
| Manage Bookings | `/admin` | Ready |
| Manage Packages | `/admin/packages` | Ready |
| Manage Banners | `/admin/banners` | Ready |
| Customer Login | `/login` | Ready |
| My Bookings | `/my-bookings` | Ready |

---

## Testing Checklist

Before going live:
- [ ] Test booking flow end-to-end
- [ ] Test OTP verification with real phone
- [ ] Test payment with Razorpay test mode first
- [ ] Test admin login and dashboard
- [ ] Test on mobile devices
- [ ] Test banner display and dismissal

---

*Last Updated: 2026-03-07*
