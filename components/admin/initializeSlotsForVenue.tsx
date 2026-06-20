// lib/booking-service.ts
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { TimeSlot, Booking } from '@/types/booking';

const SLOTS_COLLECTION = 'timeSlots';
const BOOKINGS_COLLECTION = 'bookings';

// Initialiser les créneaux pour une salle sur une période
export const initializeSlotsForVenue = async (
  venueId: string,
  startDate: Date,
  endDate: Date
): Promise<void> => {
  const batch = writeBatch(db);
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Créneau matin
    const morningRef = doc(collection(db, SLOTS_COLLECTION));
    batch.set(morningRef, {
      id: morningRef.id,
      venueId,
      date: dateStr,
      period: 'morning',
      isAvailable: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Créneau soir
    const eveningRef = doc(collection(db, SLOTS_COLLECTION));
    batch.set(eveningRef, {
      id: eveningRef.id,
      venueId,
      date: dateStr,
      period: 'evening',
      isAvailable: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  await batch.commit();
};

// Récupérer les créneaux disponibles pour une salle
export const getAvailableSlots = async (
  venueId: string,
  startDate: string,
  endDate: string
): Promise<TimeSlot[]> => {
  const q = query(
    collection(db, SLOTS_COLLECTION),
    where('venueId', '==', venueId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    where('isAvailable', '==', true),
    orderBy('date', 'asc')
  );
  
  const snapshot = await getDocs(q);
  const slots: TimeSlot[] = [];
  snapshot.forEach((doc) => {
    slots.push({ id: doc.id, ...doc.data() } as TimeSlot);
  });
  return slots;
};

// Réserver un créneau
export const bookSlot = async (
  slotId: string,
  bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Booking> => {
  const slotRef = doc(db, SLOTS_COLLECTION, slotId);
  const slotDoc = await getDoc(slotRef);
  
  if (!slotDoc.exists()) {
    throw new Error('Créneau non trouvé');
  }
  
  const slotData = slotDoc.data() as TimeSlot;
  
  if (!slotData.isAvailable) {
    throw new Error('Ce créneau n\'est plus disponible');
  }
  
  // Créer la réservation
  const booking: Omit<Booking, 'id'> = {
    ...bookingData,
    venueName: '', // À remplir avec le nom de la salle
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const bookingRef = await addDoc(collection(db, BOOKINGS_COLLECTION), booking);
  
  // Mettre à jour le créneau comme indisponible
  await updateDoc(slotRef, {
    isAvailable: false,
    bookedBy: bookingRef.id,
    bookedAt: Timestamp.now(),
    clientName: bookingData.clientName,
    clientEmail: bookingData.clientEmail,
    clientPhone: bookingData.clientPhone
  });
  
  return { id: bookingRef.id, ...booking };
};

// Annuler une réservation
export const cancelBooking = async (bookingId: string): Promise<void> => {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const bookingDoc = await getDoc(bookingRef);
  
  if (!bookingDoc.exists()) {
    throw new Error('Réservation non trouvée');
  }
  
  const bookingData = bookingDoc.data() as Booking;
  
  // Trouver et libérer le créneau associé
  const slotsQuery = query(
    collection(db, SLOTS_COLLECTION),
    where('bookedBy', '==', bookingId)
  );
  
  const slotsSnapshot = await getDocs(slotsQuery);
  const batch = writeBatch(db);
  
  slotsSnapshot.forEach((slotDoc) => {
    batch.update(slotDoc.ref, {
      isAvailable: true,
      bookedBy: null,
      bookedAt: null,
      clientName: null,
      clientEmail: null,
      clientPhone: null
    });
  });
  
  // Mettre à jour le statut de la réservation
  batch.update(bookingRef, {
    status: 'cancelled',
    updatedAt: new Date().toISOString()
  });
  
  await batch.commit();
};

// Récupérer toutes les réservations d'une salle
export const getVenueBookings = async (venueId: string): Promise<Booking[]> => {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('venueId', '==', venueId),
    orderBy('date', 'asc')
  );
  
  const snapshot = await getDocs(q);
  const bookings: Booking[] = [];
  snapshot.forEach((doc) => {
    bookings.push({ id: doc.id, ...doc.data() } as Booking);
  });
  return bookings;
};