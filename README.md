# Container Theatre v1.0

> No bugs. Just blockbusters.

Nagercoil's first private mini theatre booking website with interactive 3D experience and Razorpay payment integration.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **3D Graphics**: React Three Fiber + Drei
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Payments**: Razorpay
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Razorpay account (for payments)

### Installation

```bash
# Navigate to project directory
cd container-theatre-v1

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Add your Razorpay keys to .env.local (see below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Razorpay Setup

### 1. Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up / Log in
3. Complete KYC verification (required for live payments)

### 2. Get API Keys

1. Go to **Settings** → **API Keys**
2. Generate a new key pair
3. You'll get:
   - **Key ID**: `rzp_test_xxxxxxxxxxxx` (test) or `rzp_live_xxxxxxxxxxxx` (live)
   - **Key Secret**: Shown only once, save it securely

### 3. Configure Environment Variables

Edit `.env.local`:

```bash
# For testing (use test mode keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret_key

# For production (use live mode keys)
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
# RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
# RAZORPAY_KEY_SECRET=your_live_secret_key
```

### 4. Test Cards (Test Mode)

Use these cards for testing:

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4111 1111 1111 1111 | Any future | Any | Success |
| 4000 0000 0000 0002 | Any future | Any | Declined |

Test UPI: `success@razorpay` (auto-success)

### Payment Flow

```
1. User clicks "Pay" button
2. Frontend calls /api/razorpay/create-order
3. Server creates order via Razorpay API
4. Razorpay checkout opens
5. User completes payment
6. Frontend calls /api/razorpay/verify-payment
7. Server verifies signature
8. Booking confirmed
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── razorpay/
│   │       ├── create-order/route.ts   # Create payment order
│   │       └── verify-payment/route.ts  # Verify payment
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── booking/
│   │   ├── AddOnSelector.tsx
│   │   ├── BookingFlow.tsx
│   │   ├── BookingSummary.tsx    # Payment integration here
│   │   ├── CustomerForm.tsx
│   │   ├── DateTimePicker.tsx
│   │   └── PackageCard.tsx
│   ├── three/
│   │   ├── ContainerTheatre.tsx
│   │   └── Scene.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Footer.tsx
│       ├── Header.tsx
│       ├── Input.tsx
│       └── TerminalWindow.tsx
├── data/
│   └── packages.ts
├── lib/
│   ├── razorpay.ts      # Razorpay utilities
│   ├── store.ts
│   └── utils.ts
└── types/
    └── razorpay.d.ts    # TypeScript definitions
```

## Features

- Interactive 3D container theatre model
- Multi-step booking flow
- Package selection with pricing
- Date & time slot picker
- Add-on selector
- Customer details form
- **Razorpay payment integration**
- Payment verification with signature
- Booking confirmation with ID
- Responsive design
- Terminal/code-themed UI

## Customization

### Update Contact Information

Edit the contact details in:
- `src/components/ui/Footer.tsx`
- `src/components/ui/Header.tsx`
- `src/app/page.tsx`

### Modify Packages & Pricing

Edit `src/data/packages.ts` to update:
- Package names and descriptions
- Pricing (weekday/weekend)
- Features included
- Add-ons

### Customize Razorpay Checkout

Edit `src/components/booking/BookingSummary.tsx`:

```typescript
await initializeRazorpay({
  // ...
  theme: {
    color: '#00FF41', // Your brand color
  },
  // Add more options
});
```

## Production Checklist

Before going live:

- [ ] Switch to Razorpay live mode keys
- [ ] Complete Razorpay KYC verification
- [ ] Update contact information
- [ ] Add real phone/WhatsApp numbers
- [ ] Set up database for bookings (Firebase/Supabase)
- [ ] Add SMS notifications (MSG91/Twilio)
- [ ] Configure webhook for payment events
- [ ] Add Google Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Test all payment flows

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables on Vercel

Add these in your Vercel project settings:

- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### Other Platforms

```bash
npm run build
npm start
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Webhook Setup (Optional)

For production, set up Razorpay webhooks:

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Create webhook endpoint in your app

## Troubleshooting

### Payment not working

1. Check if Razorpay keys are correct in `.env.local`
2. Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` starts with `rzp_test_` or `rzp_live_`
3. Check browser console for errors
4. Verify API routes are working: `/api/razorpay/create-order`

### Demo mode

If Razorpay keys are not configured, the app runs in demo mode:
- Orders are created with `order_demo_` prefix
- Payment verification is skipped
- Booking is confirmed without actual payment

## License

Private project - Container Theatre v1.0

---

deployed with ❤️ by a developer
