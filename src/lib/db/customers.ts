// Customer database operations
import { getAdminDb, isFirebaseAdminConfigured } from '@/lib/firebase-admin';
import { Customer, CreateCustomerInput, Booking } from './types';

const COLLECTION = 'customers';

// Demo customers for when Firebase is not configured
const demoCustomers: Record<string, Customer> = {};

// Normalize phone number (remove country code, spaces, etc.)
export function normalizePhone(phone: string): string {
  return phone.replace(/^\+91/, '').replace(/\D/g, '').slice(-10);
}

// Create or get customer by phone
export async function getOrCreateCustomer(
  input: CreateCustomerInput
): Promise<Customer> {
  const phone = normalizePhone(input.phone);

  // Try to find existing customer
  const existing = await getCustomerByPhone(phone);
  if (existing) {
    // Update name/email if provided and different
    if (input.name !== existing.name || input.email !== existing.email) {
      await updateCustomer(existing.id, {
        name: input.name,
        email: input.email,
      });
      return {
        ...existing,
        name: input.name,
        email: input.email,
      };
    }
    return existing;
  }

  // Create new customer
  return createCustomer(input);
}

// Create a new customer
export async function createCustomer(
  input: CreateCustomerInput
): Promise<Customer> {
  const phone = normalizePhone(input.phone);
  const now = new Date();

  const customer: Omit<Customer, 'id'> = {
    phone,
    phoneWithCode: `+91${phone}`,
    name: input.name,
    email: input.email,
    totalBookings: 0,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (!isFirebaseAdminConfigured()) {
    // Demo mode
    const id = `cust_demo_${Date.now()}`;
    const newCustomer = { id, ...customer };
    demoCustomers[phone] = newCustomer;
    console.log('Demo customer created:', newCustomer);
    return newCustomer;
  }

  const db = getAdminDb();
  const docRef = await db.collection(COLLECTION).add({
    ...customer,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    ...customer,
  };
}

// Get customer by phone number
export async function getCustomerByPhone(
  phone: string
): Promise<Customer | null> {
  const normalizedPhone = normalizePhone(phone);

  if (!isFirebaseAdminConfigured()) {
    // Demo mode
    return demoCustomers[normalizedPhone] || null;
  }

  const db = getAdminDb();
  const snapshot = await db
    .collection(COLLECTION)
    .where('phone', '==', normalizedPhone)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as Customer;
}

// Get customer by ID
export async function getCustomerById(id: string): Promise<Customer | null> {
  if (!isFirebaseAdminConfigured()) {
    // Demo mode - search by ID
    return Object.values(demoCustomers).find((c) => c.id === id) || null;
  }

  const db = getAdminDb();
  const doc = await db.collection(COLLECTION).doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as Customer;
}

// Update customer
export async function updateCustomer(
  id: string,
  updates: Partial<Omit<Customer, 'id' | 'phone' | 'phoneWithCode' | 'createdAt'>>
): Promise<boolean> {
  const now = new Date();

  if (!isFirebaseAdminConfigured()) {
    // Demo mode
    const customer = Object.values(demoCustomers).find((c) => c.id === id);
    if (customer) {
      Object.assign(customer, updates, { updatedAt: now.toISOString() });
      return true;
    }
    return false;
  }

  const db = getAdminDb();
  await db
    .collection(COLLECTION)
    .doc(id)
    .update({
      ...updates,
      updatedAt: now,
    });

  return true;
}

// Increment customer booking count
export async function incrementCustomerBookings(
  customerId: string,
  bookingDate: string
): Promise<void> {
  if (!isFirebaseAdminConfigured()) {
    // Demo mode
    const customer = Object.values(demoCustomers).find(
      (c) => c.id === customerId
    );
    if (customer) {
      customer.totalBookings += 1;
      customer.lastBookingDate = bookingDate;
      customer.updatedAt = new Date().toISOString();
    }
    return;
  }

  const db = getAdminDb();
  const { FieldValue } = await import('firebase-admin/firestore');

  await db.collection(COLLECTION).doc(customerId).update({
    totalBookings: FieldValue.increment(1),
    lastBookingDate: bookingDate,
    updatedAt: new Date(),
  });
}

// Update last login timestamp
export async function updateCustomerLastLogin(
  customerId: string
): Promise<void> {
  const now = new Date();

  if (!isFirebaseAdminConfigured()) {
    // Demo mode
    const customer = Object.values(demoCustomers).find(
      (c) => c.id === customerId
    );
    if (customer) {
      customer.lastLoginAt = now.toISOString();
    }
    return;
  }

  const db = getAdminDb();
  await db.collection(COLLECTION).doc(customerId).update({
    lastLoginAt: now,
    updatedAt: now,
  });
}

// Get customer's bookings
export async function getCustomerBookings(
  customerId: string
): Promise<Booking[]> {
  if (!isFirebaseAdminConfigured()) {
    // Demo mode - return empty for now
    console.log('Demo mode: getCustomerBookings for', customerId);
    return [];
  }

  const db = getAdminDb();
  const snapshot = await db
    .collection('bookings')
    .where('customerId', '==', customerId)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Booking[];
}
