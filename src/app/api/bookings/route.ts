import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getBookings } from '@/lib/db/bookings';
import { CreateBookingInput, BookingFilters } from '@/lib/db/types';

// GET /api/bookings - Get all bookings (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: BookingFilters = {};

    const status = searchParams.get('status');
    if (status) {
      filters.status = status as BookingFilters['status'];
    }

    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) {
      filters.dateFrom = dateFrom;
    }

    const dateTo = searchParams.get('dateTo');
    if (dateTo) {
      filters.dateTo = dateTo;
    }

    const search = searchParams.get('search');
    if (search) {
      filters.search = search;
    }

    const bookings = await getBookings(filters);

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingInput = await request.json();

    // Validate required fields
    if (!body.customerName || !body.customerPhone || !body.date || !body.slot) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = await createBooking(body);

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
