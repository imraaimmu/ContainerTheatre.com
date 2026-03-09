import { NextRequest, NextResponse } from 'next/server';
import {
  checkSlotAvailability,
  getDayAvailability,
  getDateRangeAvailability,
} from '@/lib/db/bookings';

// GET /api/availability - Check slot availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const slot = searchParams.get('slot');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Check specific slot availability
    if (date && slot) {
      const availability = await checkSlotAvailability(date, slot);
      return NextResponse.json({
        success: true,
        availability,
      });
    }

    // Get day availability
    if (date && !slot) {
      const availability = await getDayAvailability(date);
      return NextResponse.json({
        success: true,
        availability,
      });
    }

    // Get date range availability
    if (startDate && endDate) {
      const availability = await getDateRangeAvailability(startDate, endDate);
      return NextResponse.json({
        success: true,
        availability,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Missing required parameters. Provide date, or startDate and endDate',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
