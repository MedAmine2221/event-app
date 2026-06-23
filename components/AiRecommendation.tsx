/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, MapPin, Music, Heart, X, AlertCircle, Cake, Wine, Utensils, Package } from "lucide-react";

interface AiRecommendationProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
}

interface RecommendationResult {
  explanation: string;
  venues: any[];
  bands: any[];
  packages: any[];
  pastries: any[];
  drinks: any[];
  sweets: any[];
  tablePackages: any[];
  reservationPacks: any[];
}

export const AiRecommendation = ({ colors }: AiRecommendationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, guestCount, budget, date }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la recommandation");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue, veuillez réessayer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="py-8 px-4 md:px-10 max-w-350 mx-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(true)}
          className="w-full rounded-2xl p-6 shadow-lg flex items-center justify-between gap-4"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, #8B6B5A)` }}
        >
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 rounded-xl bg-white/20">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium text-lg">Trouvez votre formule idéale avec l&apos;IA</h3>
              <p className="text-white/80 text-sm">Décrivez votre événement, on vous recommande le meilleur choix</p>
            </div>
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1100"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-1101 max-h-[90vh]"
            >
              <div className="rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ background: colors.background }}>
                <div className="relative p-5 border-b flex items-center justify-between" style={{ borderColor: `${colors.textLight}20` }}>
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} style={{ color: colors.primary }} />
                    <h2 className="text-xl font-medium" style={{ color: colors.textDark }}>
                      Conseiller IA
                    </h2>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-black/5">
                    <X size={20} style={{ color: colors.textDark }} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                  {!result && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                          Décrivez votre événement *
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          required
                          className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none"
                          style={{ borderColor: `${colors.textLight}30` }}
                          placeholder="Ex: Je cherche une salle en extérieur pour un mariage romantique avec vue sur mer, ambiance traditionnelle tunisienne..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textDark }}>
                            Nombre d&apos;invités
                          </label>
                          <input
                            type="number"
                            value={guestCount}
                            onChange={(e) => setGuestCount(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                            style={{ borderColor: `${colors.textLight}30` }}
                            placeholder="Ex: 200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textDark }}>
                            Budget (TND)
                          </label>
                          <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                            style={{ borderColor: `${colors.textLight}30` }}
                            placeholder="Ex: 10000"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: colors.textDark }}>
                            Date
                          </label>
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                            style={{ borderColor: `${colors.textLight}30` }}
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                          <AlertCircle size={16} /> {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !description.trim()}
                        className="w-full py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ background: colors.primary }}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Analyse en cours...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Obtenir des recommandations
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {result && (
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl" style={{ background: `${colors.primary}10` }}>
                        <p className="text-sm" style={{ color: colors.textDark }}>{result.explanation}</p>
                      </div>

                      {result.venues.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: colors.textDark }}>
                            <MapPin size={16} style={{ color: colors.primary }} /> Salles recommandées
                          </h3>
                          <div className="space-y-2">
                            {result.venues.map((v) => (
                              <div key={v.id} className="p-3 rounded-lg border" style={{ borderColor: `${colors.textLight}20` }}>
                                <p className="font-medium text-sm" style={{ color: colors.textDark }}>{v.name}</p>
                                <p className="text-xs" style={{ color: colors.textLight }}>{v.capacity} · {v.price}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

{result.bands.map((b) => (
  <div key={b.id} className="p-3 rounded-lg border" style={{ borderColor: `${colors.textLight}20` }}>
    <p className="font-medium text-sm" style={{ color: colors.textDark }}>{b.name}</p>
    <p className="text-xs" style={{ color: colors.textLight }}>{b.genre} · {b.price}</p>
    {(b.likes > 0 || b.reviewCount > 0) && (
      <p className="text-[11px] mt-1 flex items-center gap-3" style={{ color: colors.primary }}>
        {b.likes > 0 && <span>❤️ {b.likes}</span>}
        {b.reviewCount > 0 && <span>⭐ {b.averageRating?.toFixed(1)} ({b.reviewCount} avis)</span>}
      </p>
    )}
  </div>
))}

                      {result.packages.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: colors.textDark }}>
                            <Heart size={16} style={{ color: colors.primary }} /> Formules recommandées
                          </h3>
                          <div className="space-y-2">
                            {result.packages.map((p) => (
                              <div key={p.id} className="p-3 rounded-lg border" style={{ borderColor: `${colors.textLight}20` }}>
                                <p className="font-medium text-sm" style={{ color: colors.textDark }}>{p.name}</p>
                                <p className="text-xs" style={{ color: colors.textLight }}>{p.price}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
{result.pastries.length > 0 && (
  <div>
    <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: colors.textDark }}>
      <Cake size={16} style={{ color: colors.primary }} /> Pâtisseries recommandées
    </h3>
    <div className="space-y-2">
      {result.pastries.map((p: any) => (
        <div key={p.id} className="p-3 rounded-lg border" style={{ borderColor: `${colors.textLight}20` }}>
          <p className="font-medium text-sm" style={{ color: colors.textDark }}>{p.name}</p>
          <p className="text-xs" style={{ color: colors.textLight }}>{p.specialty} · {p.price}</p>
          {p.products && p.products.length > 0 && (
            <p className="text-xs mt-1" style={{ color: colors.textLight }}>
              {p.products.slice(0, 3).join(", ")}
            </p>
          )}
          {(p.likes > 0 || p.reviewCount > 0) && (
  <p className="text-[11px] mt-1 flex items-center gap-3" style={{ color: colors.primary }}>
    {p.likes > 0 && <span>❤️ {p.likes}</span>}
    {p.reviewCount > 0 && <span>⭐ {p.averageRating?.toFixed(1)} ({p.reviewCount} avis)</span>}
  </p>
)}
        </div>
      ))}
    </div>
  </div>
)}

{result.drinks.length > 0 && (
  <div>
    <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: colors.textDark }}>
      <Wine size={16} style={{ color: colors.primary }} /> Boissons recommandées
    </h3>
    <div className="space-y-2">
      {result.drinks.map((d: any) => (
        <div key={d.id} className="p-3 rounded-lg border" style={{ borderColor: `${colors.textLight}20` }}>
          <p className="font-medium text-sm" style={{ color: colors.textDark }}>{d.name}</p>
          <p className="text-xs" style={{ color: colors.textLight }}>{d.category} · {d.price}</p>
        </div>
      ))}
    </div>
  </div>
)}

{result.sweets.length > 0 && (
  <div>
    <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: colors.textDark }}>
      <Utensils size={16} style={{ color: colors.primary }} /> Douceurs recommandées
    </h3>
    <div className="space-y-2">
      {result.sweets.map((s: any) => (
        <div key={s.id} className="p-3 rounded-lg border" style={{ borderColor: `${colors.textLight}20` }}>
          <p className="font-medium text-sm" style={{ color: colors.textDark }}>{s.name}</p>
          <p className="text-xs" style={{ color: colors.textLight }}>{s.type} · {s.price}</p>
        </div>
      ))}
    </div>
  </div>
)}

{result.tablePackages.length > 0 && (
  <div>
    <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: colors.textDark }}>
      <Package size={16} style={{ color: colors.primary }} /> Formules tables recommandées
    </h3>
    <div className="space-y-2">
      {result.tablePackages.map((t: any) => (
        <div key={t.id} className="p-3 rounded-lg border" style={{ borderColor: `${colors.textLight}20` }}>
          <p className="font-medium text-sm" style={{ color: colors.textDark }}>{t.name}</p>
          <p className="text-xs" style={{ color: colors.textLight }}>{t.price}</p>
        </div>
      ))}
    </div>
  </div>
)}

{result.reservationPacks.length > 0 && (
  <div>
    <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5" style={{ color: colors.textDark }}>
      <Sparkles size={16} style={{ color: colors.primary }} /> Packs de réservation recommandés
    </h3>
    <div className="space-y-2">
      {result.reservationPacks.map((r: any) => (
        <div key={r.id} className="p-3 rounded-lg border" style={{ borderColor: `${colors.textLight}20` }}>
          <p className="font-medium text-sm" style={{ color: colors.textDark }}>{r.name}</p>
          <p className="text-xs" style={{ color: colors.textLight }}>{r.price}</p>
        </div>
      ))}
    </div>
  </div>
)}
                      <button
                        onClick={() => { setResult(null); setDescription(""); }}
                        className="w-full py-2.5 rounded-xl border text-sm font-medium"
                        style={{ borderColor: colors.primary, color: colors.primary }}
                      >
                        Nouvelle recherche
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};