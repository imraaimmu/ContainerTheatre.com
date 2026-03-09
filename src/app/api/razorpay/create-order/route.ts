import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Razorpay API credentials from environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      customerName,
      customerPhone,
      customerEmail,
      packageName,
      bookingDate,
      timeSlot,
      guests,
      addOns,
    } = body;

    // Validate required fields
    if (!amount || !customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Razorpay credentials are configured
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      // For development/demo: return a mock order
      console.warn('Razorpay credentials not configured. Using mock order.');
      return NextResponse.json({
        success: true,
        order: {
          id: `order_demo_${Date.now()}`,
          amount: amount * 100,
          currency: 'INR',
        },
        demo: true,
      });
    }

    // Create Razorpay order
    const orderData = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `ct_${Date.now()}`,
      notes: {
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        packageName,
        bookingDate,
        timeSlot,
        guests: String(guests),
        addOns: addOns?.join(', ') || '',
      },
    };

    // Make request to Razorpay API
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay order creation failed:', errorData);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }

    const order = await response.json();

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
