/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/pack-reservations/route.ts
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { PackReservation } from "@/types/pack";

export async function GET(req: Request) {
  try {
    const adminDb = getAdminDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query = adminDb.collection("packReservations").orderBy("createdAt", "desc");
    
    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const reservations: PackReservation[] = [];
    snapshot.forEach((doc) => {
      reservations.push({ id: doc.id, ...doc.data() } as PackReservation);
    });

    return NextResponse.json({ reservations });
  } catch (error: any) {
    console.error("GET /api/admin/pack-reservations error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const adminDb = getAdminDb();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID et status requis" },
        { status: 400 }
      );
    }

    const ref = adminDb.collection("packReservations").doc(id);
    await ref.update({
      status,
      updatedAt: new Date().toISOString(),
    });

    // Si annulé, libérer le créneau
    if (status === "cancelled") {
      const doc = await ref.get();
      const data = doc.data();
      if (data) {
        const slotsQuery = await adminDb
          .collection("timeSlots")
          .where("venueId", "==", data.venueId)
          .where("date", "==", data.date)
          .where("period", "==", data.period)
          .where("bookedBy", "==", id)
          .get();

        slotsQuery.forEach((slotDoc) => {
          slotDoc.ref.update({
            isAvailable: true,
            bookedBy: null,
            bookedAt: null,
          });
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/admin/pack-reservations error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}