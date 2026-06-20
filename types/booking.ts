// types/booking.ts
export interface TimeSlot {
  id: string;
  venueId: string;
  date: string; // format YYYY-MM-DD
  period: 'morning' | 'evening';
  isAvailable: boolean;
  bookedBy?: string;
  bookedAt?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  date: string;
  period: 'morning' | 'evening';
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}