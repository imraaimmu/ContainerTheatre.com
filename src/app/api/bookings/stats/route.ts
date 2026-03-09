import { NextRequest, NextResponse } from 'next/server';
import { getBookingStats } from '@/lib/db/bookings';

// GET /api/bookings/stats - Get booking statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const stats = await getBookingStats(dateFrom, dateTo);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
