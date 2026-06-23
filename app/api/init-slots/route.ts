import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, query, where, getDocs } from "firebase/firestore";
import { DATES, PERIODS } from "@/constants";

export async function GET() {
  try {
    const venuesSnapshot = await getDocs(collection(db, "venues"));
    const venueIds: string[] = [];
    venuesSnapshot.forEach((doc) => venueIds.push(doc.id));

    if (venueIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Aucune salle trouvée dans la base de données",
      });
    }

    let created = 0;
    let errors = 0;
    let skipped = 0;

    for (const venueId of venueIds) {
      for (const date of DATES) {
        for (const period of PERIODS) {
          try {
            // Vérifier si le créneau existe déjà
            const existingQuery = query(
              collection(db, "timeSlots"),
              where("venueId", "==", venueId),
              where("date", "==", date),
              where("period", "==", period)
            );
            const existing = await getDocs(existingQuery);
            
            if (existing.empty) {
              await addDoc(collection(db, "timeSlots"), {
                venueId: venueId,
                date: date,
                period: period,
                isAvailable: true,
                createdAt: Timestamp.now(),
              });
              created++;
            } else {
              skipped++;
            }
          } catch (error) {
            errors++;
            console.error(`❌ Erreur pour ${venueId} - ${date} - ${period}:`, error);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${created} créneaux créés, ${skipped} déjà existants, ${errors} erreurs`,
      created,
      skipped,
      errors,
    });
  } catch (error) {
    console.error("❌ Erreur globale:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'initialisation des créneaux" },
      { status: 500 }
    );
  }
}