import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateCustomer,
  getCustomerByPhone,
  updateCustomerLastLogin,
} from '@/lib/db/customers';

// POST /api/customers - Create or get customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, email, firebaseUid } = body;

    if (!phone || !name) {
      return NextResponse.json(
        { success: false, error: 'Phone and name are required' },
        { status: 400 }
      );
    }

    // Get or create customer
    const customer = await getOrCreateCustomer({
      phone,
      name,
      email,
    });

    // Update last login if Firebase UID provided
    if (firebaseUid && customer.id) {
      await updateCustomerLastLogin(customer.id);
    }

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      customer,
      isNew: customer.totalBookings === 0,
    });
  } catch (error) {
    console.error('Error creating/getting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process customer' },
      { status: 500 }
    );
  }
}

// GET /api/customers?phone=xxx - Get customer by phone
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone parameter required' },
        { status: 400 }
      );
    }

    const customer = await getCustomerByPhone(phone);

    if (!customer) {
      return NextResponse.json({
        success: true,
        exists: false,
        customer: null,
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      customer,
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}
