// Razorpay configuration and utilities

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise (INR * 100)
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    [key: string]: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface CreateOrderPayload {
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  packageName: string;
  bookingDate: string;
  timeSlot: string;
  guests: number;
  addOns: string[];
}

export interface OrderResponse {
  success: boolean;
  order?: {
    id: string;
    amount: number;
    currency: string;
  };
  error?: string;
}

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  bookingDetails: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    packageId: string;
    packageName: string;
    bookingDate: string;
    timeSlot: string;
    guests: number;
    specialRequests?: string;
    totalAmount: number;
    advancePaid: number;
    isWeekend: boolean;
    addOns: Array<{ id: string; name: string; price: number }>;
    addOnsPrice: number;
  };
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initializeRazorpay = async (
  options: RazorpayOptions
): Promise<void> => {
  const loaded = await loadRazorpayScript();

  if (!loaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
};

// Create order via API
export const createOrder = async (
  payload: CreateOrderPayload
): Promise<OrderResponse> => {
  try {
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create order',
    };
  }
};

// Verify payment via API
export const verifyPayment = async (
  payload: VerifyPaymentPayload
): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
  try {
    const response = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to verify payment',
    };
  }
};
