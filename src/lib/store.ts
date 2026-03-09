import { create } from 'zustand';
import { Package, AddOn } from '@/data/packages';

interface BookingState {
  // Current step
  step: number;
  setStep: (step: number) => void;

  // Selected package
  selectedPackage: Package | null;
  setSelectedPackage: (pkg: Package | null) => void;

  // Selected date
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;

  // Selected time slot
  selectedSlot: string | null;
  setSelectedSlot: (slot: string | null) => void;

  // Selected add-ons
  selectedAddOns: AddOn[];
  toggleAddOn: (addOn: AddOn) => void;

  // Customer details
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    guests: number;
    specialRequests: string;
  };
  setCustomerDetails: (details: Partial<BookingState['customerDetails']>) => void;

  // Computed
  isWeekend: () => boolean;
  getTotalPrice: () => number;

  // Reset
  reset: () => void;
}

const initialCustomerDetails = {
  name: '',
  phone: '',
  email: '',
  guests: 2,
  specialRequests: '',
};

export const useBookingStore = create<BookingState>((set, get) => ({
  step: 0,
  setStep: (step) => set({ step }),

  selectedPackage: null,
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),

  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),

  selectedSlot: null,
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),

  selectedAddOns: [],
  toggleAddOn: (addOn) => set((state) => {
    const exists = state.selectedAddOns.find((a) => a.id === addOn.id);
    if (exists) {
      return { selectedAddOns: state.selectedAddOns.filter((a) => a.id !== addOn.id) };
    }
    return { selectedAddOns: [...state.selectedAddOns, addOn] };
  }),

  customerDetails: initialCustomerDetails,
  setCustomerDetails: (details) => set((state) => ({
    customerDetails: { ...state.customerDetails, ...details },
  })),

  isWeekend: () => {
    const date = get().selectedDate;
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  },

  getTotalPrice: () => {
    const { selectedPackage, selectedAddOns, isWeekend } = get();
    if (!selectedPackage) return 0;

    const packagePrice = isWeekend()
      ? selectedPackage.weekendPrice
      : selectedPackage.weekdayPrice;

    const addOnsPrice = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);

    return packagePrice + addOnsPrice;
  },

  reset: () => set({
    step: 0,
    selectedPackage: null,
    selectedDate: null,
    selectedSlot: null,
    selectedAddOns: [],
    customerDetails: initialCustomerDetails,
  }),
}));
