/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/packs/route.ts (nouvelle route)
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection("reservationPacks").get();
    const packs: any[] = [];
    snapshot.forEach((doc) => {
      packs.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json({ packs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const adminDb = getAdminDb();
    const { packId, data } = await req.json();
    
    if (!packId) {
      return NextResponse.json(
        { error: "packId requis" },
        { status: 400 }
      );
    }
    
    await adminDb.collection("reservationPacks").doc(packId).set(data, { merge: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}