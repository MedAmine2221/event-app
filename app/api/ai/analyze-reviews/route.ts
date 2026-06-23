/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getGeminiModel, generateContentWithRetry, GeminiQuotaError } from "@/lib/gemini";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection("ratings").orderBy("createdAt", "desc").limit(50).get();

    const reviews = snapshot.docs.map((d) => {
      const r = d.data();
      return { name: r.name, rating: r.rating, comment: r.comment };
    });

    if (reviews.length === 0) {
      return NextResponse.json({
        summary: "Aucun avis disponible pour le moment.",
        sentiment: "neutral",
        positivePoints: [],
        negativePoints: [],
        alerts: [],
      });
    }

    const model = getGeminiModel();

    const prompt = `
    Tu es un analyste pour "Carthage Events", une agence événementielle en Tunisie.
    Analyse ces avis clients (JSON) et fournis une synthèse utile pour l'équipe admin.

    Avis (JSON): ${JSON.stringify(reviews)}

    Réponds UNIQUEMENT en JSON valide, sans markdown, avec ce format exact:
    {
      "summary": "Résumé global en 2-3 phrases en français",
      "sentiment": "positive" | "neutral" | "negative",
      "positivePoints": ["point fort 1", "point fort 2"],
      "negativePoints": ["point faible 1", "point faible 2"],
      "alerts": ["alerte urgente si avis très négatif ou problème récurrent, sinon tableau vide"]
    }
  `;

    const result = await generateContentWithRetry(model, prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Réponse IA invalide" }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("GET /api/ai/analyze-reviews error:", error);

    if (error instanceof GeminiQuotaError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    return NextResponse.json({ error: error.message || "Erreur serveur" }, { status: 500 });
  }
}