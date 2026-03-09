import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createBooking, checkSlotAvailability } from '@/lib/db/bookings';
import { CreateBookingInput } from '@/lib/db/types';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingDetails,
    } = body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment details' },
        { status: 400 }
      );
    }

    if (!bookingDetails) {
      return NextResponse.json(
        { success: false, error: 'Missing booking details' },
        { status: 400 }
      );
    }

    // Check if slot is still available (prevent double booking)
    const availability = await checkSlotAvailability(
      bookingDetails.bookingDate,
      bookingDetails.timeSlot
    );

    if (!availability.isAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: 'This slot has already been booked. Please choose another slot.',
          code: 'SLOT_UNAVAILABLE',
        },
        { status: 409 }
      );
    }

    // Demo mode - skip signature verification
    if (razorpay_order_id.startsWith('order_demo_')) {
      const bookingInput: CreateBookingInput = {
        customerName: bookingDetails.customerName,
        customerPhone: bookingDetails.customerPhone,
        customerEmail: bookingDetails.customerEmail,
        guests: bookingDetails.guests,
        specialRequests: bookingDetails.specialRequests,
        packageId: bookingDetails.packageId || 'unknown',
        packageName: bookingDetails.packageName,
        date: bookingDetails.bookingDate,
        slot: bookingDetails.timeSlot,
        packagePrice: bookingDetails.totalAmount - (bookingDetails.addOnsPrice || 0),
        addOnsPrice: bookingDetails.addOnsPrice || 0,
        totalAmount: bookingDetails.totalAmount,
        advancePaid: bookingDetails.advancePaid,
        isWeekend: bookingDetails.isWeekend || false,
        addOns: bookingDetails.addOns || [],
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      };

      const booking = await createBooking(bookingInput);

      console.log('Demo booking created:', booking);

      return NextResponse.json({
        success: true,
        bookingId: booking.id,
        message: 'Demo booking confirmed',
      });
    }

    // Verify payment signature for real payments
    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Payment verification not configured' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed');
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Payment verified - Create booking in database
    const bookingInput: CreateBookingInput = {
      customerName: bookingDetails.customerName,
      customerPhone: bookingDetails.customerPhone,
      customerEmail: bookingDetails.customerEmail,
      guests: bookingDetails.guests,
      specialRequests: bookingDetails.specialRequests,
      packageId: bookingDetails.packageId || 'unknown',
      packageName: bookingDetails.packageName,
      date: bookingDetails.bookingDate,
      slot: bookingDetails.timeSlot,
      packagePrice: bookingDetails.totalAmount - (bookingDetails.addOnsPrice || 0),
      addOnsPrice: bookingDetails.addOnsPrice || 0,
      totalAmount: bookingDetails.totalAmount,
      advancePaid: bookingDetails.advancePaid,
      isWeekend: bookingDetails.isWeekend || false,
      addOns: bookingDetails.addOns || [],
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    };

    const booking = await createBooking(bookingInput);

    console.log('Booking confirmed:', {
      bookingId: booking.id,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      date: booking.date,
      slot: booking.slot,
    });

    // TODO: Send confirmation SMS/WhatsApp via Twilio/MSG91
    // TODO: Send confirmation email

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Payment verified and booking confirmed',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
