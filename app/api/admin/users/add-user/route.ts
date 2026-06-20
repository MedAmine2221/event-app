/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()
    const { email, password, displayName, role } = await req.json();

    if (!email || !password || !displayName) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    // 1. Créer dans Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });

    // 2. Définir le rôle en custom claim
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    // 3. Sauvegarder dans Firestore
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ uid: userRecord.uid }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}