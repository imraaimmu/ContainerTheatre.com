import { NextRequest, NextResponse } from 'next/server';

const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Clean phone number - remove spaces, dashes, and country code if present
    const cleanPhone = phone.replace(/[\s-]/g, '').replace(/^\+91/, '');

    // Validate 10-digit Indian phone number
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    // Demo mode if API key not configured
    if (!TWO_FACTOR_API_KEY) {
      console.log('Demo mode - OTP would be sent to:', cleanPhone);
      return NextResponse.json({
        success: true,
        sessionId: 'demo_session_' + Date.now(),
        demo: true,
        message: 'Demo mode: Use OTP 123456',
      });
    }

    // Send OTP via 2Factor
    const response = await fetch(
      `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${cleanPhone}/AUTOGEN/OTP1`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (data.Status === 'Success') {
      return NextResponse.json({
        success: true,
        sessionId: data.Details,
        message: 'OTP sent successfully',
      });
    } else {
      console.error('2Factor error:', data);
      return NextResponse.json(
        { success: false, error: data.Details || 'Failed to send OTP' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
