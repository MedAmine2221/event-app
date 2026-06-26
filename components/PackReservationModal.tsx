/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { MdRestaurant } from "react-icons/md";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Palette,
  Droplets,
  Coffee,
  Sparkles,
} from "lucide-react";
import { ReservationPack, PackId, PACK_LABELS, SEASONS } from "@/types/pack";
import { createPackReservation } from "@/lib/pack-service";
import { getSeason, getSeasonalPrice } from "@/lib/seasonal-price-utils";
import { Venue } from "@/types";

const isVenueAvailable = (
  venue: Venue,
  date: string,
  period: "morning" | "evening"
): boolean => {
  if (!venue.unavailableDates) return true;
  return !venue.unavailableDates.some((u: UnavailableDate) => {
    if (u.date !== date) return false;
    if (u.period === "full") return true;
    return u.period === period;
  });
};

interface UnavailableDate {
  date: string;
  period: "morning" | "evening" | "full";
}

interface PackReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
  packs: ReservationPack[];
  venues: Venue[];
  initialPackId?: PackId;
  initialDate?: string;
  initialPeriod?: "morning" | "evening" | null; 
}

type Step = "pack" | "venue" | "options" | "contact" | "success";

export const PackReservationModal = ({
  isOpen,
  onClose,
  colors,
  packs,
  venues,
  initialPackId,
  initialDate,
  initialPeriod, 
}: PackReservationModalProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState<Step>(initialPackId ? "venue" : "pack");
  const [selectedPackId, setSelectedPackId] = useState<PackId | null>(initialPackId || null);
  
  const [date, setDate] = useState(initialDate || "");                                   // ⬅️ modifié
  const [period, setPeriod] = useState<"morning" | "evening" | null>(initialPeriod || null); // ⬅️ modifié
  
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  
  const [decorChoiceId, setDecorChoiceId] = useState<string | null>(null);
  const [juiceChoice, setJuiceChoice] = useState<string>("");
  
  const [formData, setFormData] = useState({ clientName: "", clientEmail: "", clientPhone: "", message: "" });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  const selectedSeason = date ? getSeason(new Date(date)) : null;
  const selectedPack = useMemo(
    () => packs.find((p) => p.packId === selectedPackId) || null,
    [packs, selectedPackId]
  );

  // Calculer les salles disponibles en temps réel
  const availableVenues = useMemo(() => {
    if (!date || !period) return [];
    return venues.filter((venue) => isVenueAvailable(venue, date, period));
  }, [venues, date, period]);

  // Vérifier si la salle sélectionnée est toujours disponible
  useEffect(() => {
    if (selectedVenueId && date && period) {
      const venue = venues.find((v) => v.id === selectedVenueId);
      if (venue && !isVenueAvailable(venue, date, period)) {
        setSelectedVenueId(null);
      }
    }
  }, [date, period, venues, selectedVenueId]);
  useEffect(() => {
    if (isOpen) {
      setStep(initialPackId ? "venue" : "pack");
      setSelectedPackId(initialPackId || null);
      setDate(initialDate || "");
      setPeriod(initialPeriod || null);
    }
  }, [isOpen, initialPackId, initialDate, initialPeriod]);
useEffect(() => {
  if (isOpen) {
    setStep(initialPackId ? "venue" : "pack");
    setSelectedPackId(initialPackId || null);
    setDate(initialDate || "");
    setPeriod(initialPeriod || null);
    setFormData({
      clientName: user?.displayName || "",
      clientEmail: user?.email || "",
      clientPhone: "",
      message: "",
    });
  }
}, [isOpen, initialPackId, initialDate, initialPeriod, user]);
  const selectedVenue = useMemo(
    () => venues.find((v) => v.id === selectedVenueId) || null,
    [venues, selectedVenueId]
  );

  const today = new Date().toISOString().split("T")[0];

  if (!isOpen) return null;

const resetAndClose = () => {
  setStep(initialPackId ? "venue" : "pack");
  setSelectedPackId(initialPackId || null);
  setDate(initialDate || "");
  setPeriod(initialPeriod || null);
  setSelectedVenueId(null);
  setDecorChoiceId(null);
  setJuiceChoice("");
  setFormData({
    clientName: user?.displayName || "",
    clientEmail: user?.email || "",
    clientPhone: "",
    message: "",
  });
  setSubmitError("");
  onClose();
};
const getDisplayPriceWithPeriod = (
  venue: any,
  season: string,
  period?: "morning" | "evening" | null
): string => {
  // 1. Prix par créneau (priorité haute)
  if (period && venue.periodPrices && venue.periodPrices.length > 0) {
    const periodPrice = venue.periodPrices.find((p: any) => p.period === period);
    if (periodPrice?.price) return periodPrice.price;
  }

  // 2. Prix saisonnier
  if (venue.seasonalPrices && venue.seasonalPrices.length > 0) {
    const seasonalPrice = venue.seasonalPrices.find((sp: any) => sp.season === season);
    if (seasonalPrice?.price) return seasonalPrice.price;
  }

  // 3. Prix de base
  return venue.price || "—";
};
const handleSubmit = async () => {
    if (!selectedPack || !selectedVenue || !date || !period) return;
    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      setSubmitError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSubmitLoading(true);
    setSubmitError("");
    try {
      const decorChoice =
        selectedPack.packId === "pack1" && decorChoiceId
          ? (() => {
              const opt = selectedPack.decorOptions?.find((o) => o.id === decorChoiceId);
              return opt
                ? { label: opt.label, color: opt.color, nappeColor: opt.nappeColor, chairCoverColor: opt.chairCoverColor }
                : null; // ✅ null instead of undefined
            })()
          : null; // ✅ null instead of undefined

      await createPackReservation({
        packId: selectedPack.packId,
        packName: selectedPack.name,
        venueId: selectedVenue.id ?? "",
        venueName: selectedVenue.name,
        date,
        period,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        message: formData.message,
        decorChoice: decorChoice ?? undefined, // keep type happy
        juiceChoice: selectedPack.packId === "pack3" ? juiceChoice : undefined,
      });
      setStep("success");
    } catch (error: any) {
      setSubmitError(error.message || "Une erreur est survenue, veuillez réessayer");
    } finally {
      setSubmitLoading(false);
    }
  };

  const canGoToContact =
    selectedPack &&
    selectedVenue &&
    date &&
    period &&
    (selectedPack.packId !== "pack1" || decorChoiceId) &&
    (selectedPack.packId !== "pack3" || juiceChoice);
  const packPrice = selectedPack && selectedSeason 
    ? getSeasonalPrice(selectedPack, selectedSeason) || selectedPack.price
    : selectedPack?.price;
const venuePrice = selectedVenue
  ? getDisplayPriceWithPeriod(selectedVenue, selectedSeason || "", period)
  : null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={resetAndClose}
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
            <h2 className="text-xl font-medium" style={{ color: colors.textDark }}>
              {step === "success" ? "Réservation envoyée" : "Réserver un pack"}
            </h2>
            <button onClick={resetAndClose} className="p-1 rounded-full hover:bg-black/5">
              <X size={20} style={{ color: colors.textDark }} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {step === "pack" && (
              <div className="grid grid-cols-1 gap-4">
                {packs.map((pack) => (
                  <button
                    key={pack.packId}
                    onClick={() => { setSelectedPackId(pack.packId); setStep("venue"); }}
                    className="text-left p-4 rounded-xl border-2 transition-all hover:shadow-md"
                    style={{ borderColor: `${colors.textLight}25` }}
                  >
                    <p className="text-xs font-medium mb-1" style={{ color: colors.primary }}>
                      {PACK_LABELS[pack.packId]}
                    </p>
                    <h3 className="font-semibold text-lg mb-1" style={{ color: colors.textDark }}>{pack.name}</h3>
                    <p className="text-sm mb-2" style={{ color: colors.textLight }}>{pack.description}</p>
                    <p className="text-sm font-semibold" style={{ color: colors.primary }}>{pack.price}</p>
                  </button>
                ))}
              </div>
            )}

            {step === "venue" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 flex items-center gap-1.5" style={{ color: colors.textDark }}>
                      <CalendarIcon size={14} style={{ color: colors.primary }} /> Date de l&apos;événement
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={date}
                      onChange={(e) => { 
                        setDate(e.target.value); 
                        setSelectedVenueId(null);
                      }}
                      className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
                      style={{ borderColor: `${colors.textLight}30` }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: colors.textDark }}>Créneau</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "morning" as const, label: "Matinée (16h-20h)", icon: Sun },
                        { value: "evening" as const, label: "Soirée (21h-00h)", icon: Moon },
                      ].map((opt) => {
                        const Icon = opt.icon;
                        const selected = period === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { 
                              setPeriod(opt.value); 
                              setSelectedVenueId(null);
                            }}
                            className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg border-2 text-xs font-medium"
                            style={{
                              borderColor: selected ? colors.primary : `${colors.textLight}25`,
                              background: selected ? `${colors.primary}10` : "transparent",
                              color: selected ? colors.primary : colors.textLight,
                            }}
                          >
                            <Icon size={14} /> {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  {date && period ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium" style={{ color: colors.textDark }}>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: "#4CAF50" }} />
                            {availableVenues.length} salle{availableVenues.length > 1 ? "s" : ""} disponible{availableVenues.length > 1 ? "s" : ""}
                          </span>
                        </p>
                        {availableVenues.length > 0 && (
                          <span className="text-xs" style={{ color: colors.textLight }}>
                            Cliquez sur une salle pour la sélectionner
                          </span>
                        )}
                      </div>

                      {availableVenues.length === 0 ? (
                        <div className="p-6 rounded-xl text-center" style={{ background: `${colors.primary}08` }}>
                          <p className="text-sm" style={{ color: colors.textDark }}>
                            😕 Aucune salle disponible
                          </p>
                          <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                            Essayez une autre date ou un autre créneau
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                          {availableVenues.map((venue) => {
                            const isSelected = selectedVenueId === venue.id;
                            return (
                              <button
                                key={venue.id}
                                onClick={() => setSelectedVenueId(venue.id ?? "")}
                                className={`text-left rounded-xl overflow-hidden border-2 transition-all hover:shadow-md ${
                                  isSelected ? "ring-2 ring-offset-1" : ""
                                }`}
                                style={{
                                  borderColor: isSelected ? colors.primary : `${colors.textLight}20`,
                                }}
                              >
                                <div className="h-24 bg-gray-100 relative">
                                  <img 
                                    src={venue.image} 
                                    alt={venue.name} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%23999' text-anchor='middle' dy='.3em'%3E📍%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                  {isSelected && (
                                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                                      <CheckCircle size={14} style={{ color: colors.primary }} />
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <p className="font-medium text-sm" style={{ color: colors.textDark }}>{venue.name}</p>
                                  <p className="text-xs" style={{ color: colors.textLight }}>{venue.capacity}</p>
                                  <p className="text-xs font-medium mt-0.5" style={{ color: colors.primary }}>{venue.price}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 rounded-xl text-center" style={{ background: `${colors.primary}05` }}>
                      <p className="text-sm" style={{ color: colors.textLight }}>
                        Sélectionnez une date et un créneau pour voir les salles disponibles
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  {!initialPackId && (
                    <button
                      onClick={() => setStep("pack")}
                      className="flex-1 py-2.5 rounded-lg border text-sm"
                      style={{ borderColor: colors.primary, color: colors.primary }}
                    >
                      Retour
                    </button>
                  )}
                  {initialPackId && (
                    <div className="flex-1" />
                  )}
                  <button
                    onClick={() => setStep("options")}
                    disabled={!selectedVenueId || availableVenues.length === 0}
                    className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: colors.primary }}
                  >
                    Continuer {selectedVenueId && `(${selectedVenue?.name})`}
                  </button>
                </div>
              </div>
            )}

            {step === "options" && selectedPack && (
              <div className="space-y-5">
                <div className="p-3 rounded-lg text-sm" style={{ background: `${colors.primary}08`, color: colors.textDark }}>
                  <p><strong>{selectedPack?.name}</strong> — {selectedVenue?.name}</p>
                  <p style={{ color: colors.textLight }}>
                    {date && new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · {period === "morning" ? "Matinée" : "Soirée"}
                  </p>
                </div>

                {selectedPack.packId === "pack1" && (
                  <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-1.5" style={{ color: colors.textDark }}>
                      <Palette size={16} style={{ color: colors.primary }} /> Choisissez votre décor
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedPack.decorOptions || []).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setDecorChoiceId(opt.id)}
                          className={`text-left p-3 rounded-xl border-2 transition-all ${
                            decorChoiceId === opt.id ? "ring-2 ring-offset-1" : ""
                          }`}
                          style={{
                            borderColor: decorChoiceId === opt.id ? colors.primary : `${colors.textLight}20`,
                          }}
                        >
                          <p className="text-sm font-medium mb-2" style={{ color: colors.textDark }}>{opt.label}</p>
                          <div className="flex gap-2">
                            <span className="w-6 h-6 rounded-full border" style={{ background: opt.color }} title="Couleur" />
                            <span className="w-6 h-6 rounded-full border" style={{ background: opt.nappeColor }} title="Nappe" />
                            <span className="w-6 h-6 rounded-full border" style={{ background: opt.chairCoverColor }} title="Housse" />
                          </div>
                        </button>
                      ))}
                      {(selectedPack.decorOptions || []).length === 0 && (
                        <p className="text-sm col-span-2 text-center py-3" style={{ color: colors.textLight }}>
                          Aucune option de décor disponible pour le moment.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {(selectedPack.packId === "pack2" || selectedPack.packId === "pack3") && (
                  <div className="p-4 rounded-xl" style={{ background: `${colors.primary}08` }}>
                    <p className="text-sm font-medium mb-2" style={{ color: colors.textDark }}>Inclus dans ce pack :</p>
                    <ul className="space-y-1.5 text-sm" style={{ color: colors.textLight }}>
                      {selectedPack.includesWater && <li className="flex items-center gap-2"><Droplets size={14} style={{ color: colors.primary }} /> Eau</li>}
                      {selectedPack.includesTea && <li className="flex items-center gap-2"><Coffee size={14} style={{ color: colors.primary }} /> Thé</li>}
                      {selectedPack.packId === "pack3" && selectedPack.includesWaiter && (
                        <li className="flex items-center gap-2"><MdRestaurant size={14} style={{ color: colors.primary }} /> Service de table inclus</li>
                      )}
                      {selectedPack.serviceDescription && <li>{selectedPack.serviceDescription}</li>}
                    </ul>
                  </div>
                )}

                {selectedPack.packId === "pack3" && (
                  <div>
                    <p className="text-sm font-medium mb-2" style={{ color: colors.textDark }}>Choisissez votre jus</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedPack.juiceOptions || []).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setJuiceChoice(opt.name)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all"
                          style={{
                            borderColor: juiceChoice === opt.name ? colors.primary : `${colors.textLight}25`,
                            background: juiceChoice === opt.name ? colors.primary : "transparent",
                            color: juiceChoice === opt.name ? "white" : colors.textLight,
                          }}
                        >
                          {opt.name}
                        </button>
                      ))}
                      {(selectedPack.juiceOptions || []).length === 0 && (
                        <p className="text-sm" style={{ color: colors.textLight }}>Aucun jus disponible pour le moment.</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep("venue")} className="flex-1 py-2.5 rounded-lg border text-sm" style={{ borderColor: colors.primary, color: colors.primary }}>
                    Retour
                  </button>
                  <button
                    onClick={() => setStep("contact")}
                    disabled={!canGoToContact}
                    className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                    style={{ background: colors.primary }}
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {step === "contact" && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg text-sm" style={{ background: `${colors.primary}08`, color: colors.textDark }}>
                  <p><strong>{selectedPack?.name}</strong> — {selectedVenue?.name}</p>
                  <p style={{ color: colors.textLight }}>
                    {date && new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · {period === "morning" ? "Matinée" : "Soirée"}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Nom complet *"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 disabled:opacity-60"
                  style={{ borderColor: `${colors.textLight}30` }}
                  disabled={!!user?.displayName}
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 disabled:opacity-60"
                  style={{ borderColor: `${colors.textLight}30` }}
                  disabled={!!user?.email}
                />
                <input
                  type="tel"
                  placeholder="Téléphone *"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: `${colors.textLight}30` }}
                />
                <textarea
                  placeholder="Message (optionnel)"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: `${colors.textLight}30` }}
                />

                {submitError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                    <AlertCircle size={16} /> {submitError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep("options")} className="flex-1 py-2.5 rounded-lg border text-sm" style={{ borderColor: colors.primary, color: colors.primary }} disabled={submitLoading}>
                    Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    className="flex-1 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: colors.primary }}
                  >
                    {submitLoading ? (<><Loader2 size={16} className="animate-spin" /> Envoi...</>) : "Confirmer la réservation"}
                  </button>
                </div>
              </div>
            )}
            <div className="p-3 rounded-lg text-sm" style={{ background: `${colors.primary}08`, color: colors.textDark }}>
              <p><strong>{selectedPack?.name}</strong> — {selectedVenue?.name}</p>
              <p style={{ color: colors.textLight }}>
                {date && new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · {period === "morning" ? "Matinée" : "Soirée"}
              </p>
              {selectedSeason && (
                <p className="mt-1 text-xs" style={{ color: colors.primary }}>
                  {SEASONS.find(s => s.value === selectedSeason)?.emoji} Tarif {SEASONS.find(s => s.value === selectedSeason)?.label}
                </p>
              )}

            </div>
            <div className="flex gap-4 mt-2 text-sm">
              <span>Pack: <strong>{packPrice}</strong></span>
              <span>
                Salle: <strong>{venuePrice || "--"}</strong>
                {period && (
                  <span className="ml-1 text-[10px]" style={{ color: colors.textLight }}>
                    ({period === "morning" ? "☀️ Matin" : "🌙 Soirée"})
                  </span>
                )}
              </span>
            </div>
            {step === "success" && (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: colors.textDark }}>Réservation envoyée !</h3>
                <p className="text-sm mb-6" style={{ color: colors.textLight }}>
                  Votre demande a été enregistrée. Notre équipe vous contactera très prochainement pour confirmer.
                </p>
                <button onClick={resetAndClose} className="px-8 py-2.5 rounded-lg text-white text-sm font-medium" style={{ background: colors.primary }}>
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};