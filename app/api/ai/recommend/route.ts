/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getGeminiModel, generateContentWithRetry, GeminiQuotaError, GeminiQuotaZeroError } from "@/lib/gemini";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { description, guestCount, budget, date } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Description requise" }, { status: 400 });
    }

    const adminDb = getAdminDb();

    const [
      venuesSnap,
      bandsSnap,
      packagesSnap,
      pastriesSnap,
      drinksSnap,
      sweetsSnap,
      tablePackagesSnap,
      reservationPacksSnap,
    ] = await Promise.all([
      adminDb.collection("venues").get(),
      adminDb.collection("bands").get(),
      adminDb.collection("weddingPackages").get(),
      adminDb.collection("pastries").get(),
      adminDb.collection("drinks").get(),
      adminDb.collection("sweets").get(),
      adminDb.collection("formules").get(),
      adminDb.collection("reservationPacks").get(),
    ]);

    const venues = venuesSnap.docs.map((d) => {
      const v = d.data();
      return {
        id: d.id,
        name: v.name,
        capacity: v.capacity,
        price: v.price,
        type: v.type,
        isIndoor: v.isIndoor,
        description: v.description,
        featured: v.featured || false,
      };
    });

    const bands = bandsSnap.docs.map((d) => {
      const b = d.data();
      return {
        id: d.id,
        name: b.name,
        genre: b.genre,
        price: b.price,
        description: b.description,
        contact: b.contact,
        socialMedia: b.socialMedia,
      };
    });

    const packages = packagesSnap.docs.map((d) => {
      const p = d.data();
      return {
        id: d.id,
        name: p.name,
        type: p.type,
        price: p.price,
        description: p.description,
        isPopular: p.isPopular || false,
        includedItems: p.includedItems,
      };
    });

    const pastries = pastriesSnap.docs.map((d) => {
      const p = d.data();
      return {
        id: d.id,
        name: p.name,
        specialty: p.specialty,
        price: p.price,
        description: p.description,
        products: p.products,
        contact: p.contact,
        socialMedia: p.socialMedia,
      };
    });

    const drinks = drinksSnap.docs.map((d) => {
      const dr = d.data();
      return { id: d.id, name: dr.name, category: dr.category, price: dr.price, description: dr.description };
    });

    const sweets = sweetsSnap.docs.map((d) => {
      const s = d.data();
      return { id: d.id, name: s.name, type: s.type, price: s.price, description: s.description };
    });

    const tablePackages = tablePackagesSnap.docs.map((d) => {
      const t = d.data();
      return { id: d.id, name: t.name, price: t.price, items: t.items, featured: t.featured || false };
    });

    const reservationPacks = reservationPacksSnap.docs.map((d) => {
      const r = d.data();
      return { id: d.id, packId: r.packId, name: r.name, description: r.description, price: r.price };
    });

    const model = getGeminiModel();

    const prompt = `
Tu es un conseiller événementiel expert pour "Carthage Events" en Tunisie.
Un client décrit son besoin pour un événement (mariage, fiançailles, soirée privée...).
Recommande UNIQUEMENT parmi les options réelles ci-dessous, en choisissant les MEILLEURES options
adaptées à sa demande (qualité, pertinence du style/genre/spécialité, adéquation budget/capacité).

Besoin du client:
- Description: ${description}
- Nombre d'invités: ${guestCount || "non précisé"}
- Budget: ${budget || "non précisé"}
- Date: ${date || "non précisée"}

Catalogue disponible (JSON):
Salles: ${JSON.stringify(venues)}
Bands/Artistes: ${JSON.stringify(bands)}
Formules Mariage: ${JSON.stringify(packages)}
Pâtisseries: ${JSON.stringify(pastries)}
Boissons: ${JSON.stringify(drinks)}
Douceurs/Fruits secs: ${JSON.stringify(sweets)}
Formules Tables: ${JSON.stringify(tablePackages)}
Packs de Réservation: ${JSON.stringify(reservationPacks)}

Règles:
- Sélectionne entre 1 et 3 éléments maximum par catégorie, les plus pertinents et de meilleure qualité.
- Si une catégorie n'a aucune option pertinente pour ce besoin, renvoie un tableau vide pour cette catégorie.
- Privilégie les éléments marqués "featured" ou "isPopular" à pertinence égale.
- Sois concret dans l'explication : justifie chaque catégorie de choix selon la demande du client.

Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte avant/après, avec ce format exact:
{
  "recommendedVenueIds": ["id1"],
  "recommendedBandIds": ["id1"],
  "recommendedPackageIds": ["id1"],
  "recommendedPastryIds": ["id1"],
  "recommendedDrinkIds": ["id1"],
  "recommendedSweetIds": ["id1"],
  "recommendedTablePackageIds": ["id1"],
  "recommendedReservationPackIds": ["id1"],
  "explanation": "Texte en français (4-6 phrases) expliquant pourquoi ces choix conviennent au client, catégorie par catégorie"
}
`;

    const result = await generateContentWithRetry(model, prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Réponse IA invalide, réessayez" }, { status: 502 });
    }

    const filterByIds = <T extends { id: string }>(items: T[], ids: string[] | undefined) =>
      items.filter((item) => ids?.includes(item.id));

    return NextResponse.json({
      explanation: parsed.explanation || "",
      venues: filterByIds(venues, parsed.recommendedVenueIds),
      bands: filterByIds(bands, parsed.recommendedBandIds),
      packages: filterByIds(packages, parsed.recommendedPackageIds),
      pastries: filterByIds(pastries, parsed.recommendedPastryIds),
      drinks: filterByIds(drinks, parsed.recommendedDrinkIds),
      sweets: filterByIds(sweets, parsed.recommendedSweetIds),
      tablePackages: filterByIds(tablePackages, parsed.recommendedTablePackageIds),
      reservationPacks: filterByIds(reservationPacks, parsed.recommendedReservationPackIds),
    });
  } catch (error: any) {
    console.error("POST /api/ai/recommend error:", error);

    if (error instanceof GeminiQuotaZeroError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    if (error instanceof GeminiQuotaError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}