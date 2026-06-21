/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/VenueBookingModal.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import { getOrCreateSlots, bookSlot } from "@/lib/booking-service";
import { TimeSlot } from "@/types/booking";
import { useAppSelector } from "@/store/hooks";

interface VenueBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: {
    id: string;
    name: string;
    image: string;
    capacity: string;
    price: string;
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
}

export const VenueBookingModal = ({
  isOpen,
  onClose,
  venue,
  colors,
}: VenueBookingModalProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [step, setStep] = useState<"date" | "form" | "success">("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "evening" | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    message: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Charger les créneaux disponibles
    useEffect(() => {
    if (isOpen && selectedDate && venue?.id) {
        const fetchSlots = async () => {
        setLoading(true);
        try {
            // Utiliser getOrCreateSlots au lieu de getAvailableSlots
            const slots = await getOrCreateSlots(venue.id, selectedDate);
            setAvailableSlots(slots);
        } catch (err: any) {
            console.error("Erreur chargement créneaux:", err);
            if (err.code === "failed-precondition") {
            setError("⚠️ Un index Firebase est nécessaire. Veuillez contacter l'administrateur.");
            }
        } finally {
            setLoading(false);
        }
        };
        fetchSlots();
    }
    }, [isOpen, selectedDate, venue?.id]);
useEffect(() => {
  if (isOpen && user) {
    setFormData((prev) => ({
      ...prev,
      clientName: prev.clientName || user.displayName || "",
      clientEmail: prev.clientEmail || user.email || "",
    }));
  }
}, [isOpen, user]);
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedPeriod(null);
    setError("");
  };

  const handlePeriodSelect = (period: "morning" | "evening") => {
    const slot = availableSlots.find(s => s.period === period && s.isAvailable);
    if (!slot) {
      setError("Ce créneau n'est plus disponible");
      return;
    }
    setSelectedPeriod(period);
    setError("");
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.clientName || !formData.clientEmail || !formData.clientPhone) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!selectedDate || !selectedPeriod) {
      setError("Veuillez sélectionner une date et un créneau");
      return;
    }

    const slot = availableSlots.find(s => s.period === selectedPeriod && s.isAvailable);
    if (!slot) {
      setError("Ce créneau n'est plus disponible. Veuillez en sélectionner un autre.");
      return;
    }

    setSubmitLoading(true);
    try {
      await bookSlot(slot.id, {
        venueId: venue.id,
        venueName: venue.name,
        date: selectedDate,
        period: selectedPeriod,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        message: formData.message,
      });
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitLoading(false);
    }
  };

const resetAndClose = () => {
  setStep("date");
  setSelectedDate("");
  setSelectedPeriod(null);
  setFormData({
    clientName: user?.displayName || "",
    clientEmail: user?.email || "",
    clientPhone: "",
    message: "",
  });
  setError("");
  onClose();
};

  if (!isOpen) return null;

  // Définir les options de créneaux en dehors du JSX pour éviter les problèmes
  const periodOptions = [
    { 
      value: "morning" as const, 
      label: "Matinée (10h-14h)", 
      Icon: Sun,
      iconSize: 24
    },
    { 
      value: "evening" as const, 
      label: "Soirée (18h-2h)", 
      Icon: Moon,
      iconSize: 24
    },
  ];

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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-1101 max-h-[90vh]"
      >
        <div
          className="rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          style={{ background: colors.background }}
        >
          {/* Header */}
          <div className="relative p-5 border-b flex items-center justify-between" style={{ borderColor: `${colors.textLight}20` }}>
            <div>
              <h2 className="text-xl font-medium" style={{ color: colors.textDark }}>
                {step === "success" ? "Réservation confirmée" : "Réserver une salle"}
              </h2>
              <p className="text-sm" style={{ color: colors.textLight }}>{venue.name}</p>
            </div>
            <button onClick={resetAndClose} className="p-1 rounded-full hover:bg-black/5">
              <X size={20} style={{ color: colors.textDark }} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {/* Étape 1: Sélection de la date */}
            {step === "date" && (
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: colors.textDark }}>
                    <CalendarIcon size={16} style={{ color: colors.primary }} />
                    Choisissez une date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                    style={{ borderColor: `${colors.textLight}30` }}
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: colors.textDark }}>
                      <Clock size={16} style={{ color: colors.primary }} />
                      Créneaux disponibles
                    </label>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin" style={{ color: colors.primary }} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {periodOptions.map(({ value, label, Icon }) => {
                          const slot = availableSlots.find(s => s.period === value);
                          const isAvailable = slot?.isAvailable;

                          return (
                            <button
                              key={value}
                              onClick={() => handlePeriodSelect(value)}
                              disabled={!isAvailable}
                              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                                isAvailable
                                  ? "hover:shadow-md cursor-pointer"
                                  : "opacity-50 cursor-not-allowed"
                              }`}
                              style={{
                                borderColor: isAvailable ? colors.primary : `${colors.textLight}30`,
                                background: isAvailable ? "transparent" : `${colors.textLight}10`,
                              }}
                            >
                              <Icon size={24} className="mb-1" />
                              <span className="text-sm font-medium">{label}</span>
                              <span className="text-xs" style={{ color: isAvailable ? "#4CAF50" : colors.textLight }}>
                                {isAvailable ? "Disponible" : "Indisponible"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Étape 2: Formulaire client */}
            {step === "form" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 rounded-lg" style={{ background: `${colors.primary}08` }}>
                  <p className="text-sm font-medium" style={{ color: colors.textDark }}>
                    {venue.name}
                  </p>
                  <p className="text-xs" style={{ color: colors.textLight }}>
                    {selectedDate && new Date(selectedDate).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })} · {selectedPeriod === "morning" ? "Matinée" : "Soirée"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                    Nom complet *
                  </label>
                    <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 disabled:opacity-60"
                    style={{ borderColor: `${colors.textLight}30` }}
                    placeholder="Votre nom"
                    required
                    disabled={!!user?.displayName}
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                    Email *
                  </label>
                    <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 disabled:opacity-60"
                    style={{ borderColor: `${colors.textLight}30` }}
                    placeholder="votre@email.com"
                    required
                    disabled={!!user?.email}
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                    style={{ borderColor: `${colors.textLight}30` }}
                    placeholder="Votre numéro"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                    Message (optionnel)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none resize-none"
                    style={{ borderColor: `${colors.textLight}30` }}
                    placeholder="Informations supplémentaires..."
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("date")}
                    className="flex-1 py-3 rounded-xl border text-sm font-medium transition-all hover:bg-gray-50"
                    style={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: colors.primary }}
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      "Confirmer"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Étape 3: Succès */}
            {step === "success" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-2" style={{ color: colors.textDark }}>
                  Réservation envoyée !
                </h3>
                <p className="text-sm mb-6" style={{ color: colors.textLight }}>
                  Votre demande de réservation a été enregistrée. Notre équipe vous contactera pour confirmer.
                </p>
                <button
                  onClick={resetAndClose}
                  className="px-8 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90"
                  style={{ background: colors.primary }}
                >
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