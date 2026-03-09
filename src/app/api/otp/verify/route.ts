import { NextRequest, NextResponse } from 'next/server';

const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { sessionId, otp } = await request.json();

    if (!sessionId || !otp) {
      return NextResponse.json(
        { success: false, error: 'Session ID and OTP are required' },
        { status: 400 }
      );
    }

    // Demo mode verification
    if (!TWO_FACTOR_API_KEY || sessionId.startsWith('demo_session_')) {
      // In demo mode, accept 123456 as valid OTP
      if (otp === '123456') {
        return NextResponse.json({
          success: true,
          verified: true,
          message: 'OTP verified successfully (demo mode)',
        });
      } else {
        return NextResponse.json({
          success: false,
          verified: false,
          error: 'Invalid OTP. In demo mode, use 123456',
        });
      }
    }

    // Verify OTP via 2Factor
    const response = await fetch(
      `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`,
      { method: 'GET' }
    );

    const data = await response.json();

    if (data.Status === 'Success' && data.Details === 'OTP Matched') {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'OTP verified successfully',
      });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        error: data.Details || 'Invalid OTP',
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
