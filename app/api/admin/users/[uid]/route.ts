/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/users/[uid]/route.ts
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

// PATCH — modifier le rôle (et optionnellement displayName)
// app/api/admin/users/[uid]/route.ts
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ uid: string }> }  // ← Promise ici
) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const { uid } = await params;  // ← await ici

    await adminAuth.deleteUser(uid);
    await adminDb.collection("users").doc(uid).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uid: string }> }  // ← idem
) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const { uid } = await params;  // ← await ici
    const body = await req.json();
    const { role, displayName } = body;

    const authUpdate: any = {};
    if (displayName) authUpdate.displayName = displayName;
    if (Object.keys(authUpdate).length > 0) {
      await adminAuth.updateUser(uid, authUpdate);
    }

    if (role) {
      await adminAuth.setCustomUserClaims(uid, { role });
    }

    const firestoreUpdate: any = {};
    if (role) firestoreUpdate.role = role;
    if (displayName) firestoreUpdate.displayName = displayName;

    if (Object.keys(firestoreUpdate).length > 0) {
      await adminDb.collection("users").doc(uid).update(firestoreUpdate);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}