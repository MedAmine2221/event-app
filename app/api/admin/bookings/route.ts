/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { TimeSlot } from '@/types/booking';

export async function POST(req: Request) {
  try {
    const adminDb = getAdminDb();
    const { venueId, date, period, clientName, clientEmail, clientPhone, message } = await req.json();

    if (!venueId || !date || !period || !clientName || !clientEmail || !clientPhone) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si le créneau est disponible
    const slotsRef = adminDb.collection('timeSlots');
    const slotQuery = await slotsRef
      .where('venueId', '==', venueId)
      .where('date', '==', date)
      .where('period', '==', period)
      .where('isAvailable', '==', true)
      .get();

    if (slotQuery.empty) {
      return NextResponse.json(
        { error: 'Ce créneau n\'est plus disponible' },
        { status: 409 }
      );
    }

    const slotDoc = slotQuery.docs[0];

    const bookingRef = await adminDb.collection('bookings').add({
      venueId,
      date,
      period,
      clientName,
      clientEmail,
      clientPhone,
      message: message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await slotDoc.ref.update({
      isAvailable: false,
      bookedBy: bookingRef.id,
      bookedAt: new Date().toISOString(),
      clientName,
      clientEmail,
      clientPhone
    });

    return NextResponse.json(
      { success: true, bookingId: bookingRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/bookings error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const venueId = searchParams.get('venueId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!venueId) {
      return NextResponse.json(
        { error: 'venueId est requis' },
        { status: 400 }
      );
    }

    let query = adminDb.collection('timeSlots').where('venueId', '==', venueId);
    
    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    const snapshot = await query.orderBy('date', 'asc').get();
    const slots: TimeSlot[] = [];
    snapshot.forEach((doc) => {
      slots.push({ id: doc.id, ...doc.data() } as TimeSlot);
    });

    return NextResponse.json({ slots });
  } catch (error: any) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}