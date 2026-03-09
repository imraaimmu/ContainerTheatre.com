import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByPhone, getCustomerBookings } from '@/lib/db/customers';

// GET /api/customers/[phone]/bookings - Get customer's bookings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
) {
  try {
    const { phone } = await params;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone parameter required' },
        { status: 400 }
      );
    }

    // Find customer by phone
    const customer = await getCustomerByPhone(phone);

    if (!customer) {
      return NextResponse.json({
        success: true,
        bookings: [],
        message: 'No customer found with this phone number',
      });
    }

    // Get customer's bookings
    const bookings = await getCustomerBookings(customer.id);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        totalBookings: customer.totalBookings,
      },
      bookings,
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
