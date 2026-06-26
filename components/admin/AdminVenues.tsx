/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";;
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ImageIcon,
  Building2,
  Trees,
  Waves,
  Users,
  Table,
  Home,
  Sparkles,
  Square,
  Globe,
  Heart,
  Sun,
  CalendarOff,
  Sunrise,
  Moon,
  CalendarDays,
} from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SeasonalPricesEditor } from "./SeasonalPricesEditor";
import { UnavailableDate, UnavailablePeriod, Venue } from "@/types";

const EMPTY_FORM: Omit<Venue, "id"> = {
  name: "",
  description: "",
  image: "",
  capacity: "",
  tables: 0,
  chairs: 0,
  type: "salle_fete",
  seasonalPrices: [],
  surface: "",
  isIndoor: true,
  featured: false,
  unavailableDates: [],
  periodPrices: [],
};

const TYPE_OPTIONS = [
  { 
    value: "salle_fete", 
    label: "Salle de Fête", 
    icon: Building2, 
    description: "Salle intérieure pour mariages, fiançailles et réceptions",
    defaultIndoor: true,
    emoji: "🏛️"
  },
  { 
    value: "salle_planaire", 
    label: "Salle Plénière", 
    icon: Globe, 
    description: "Grande salle pour mariages prestigieux et grands événements",
    defaultIndoor: true,
    emoji: "🏛️"
  },
  { 
    value: "espace_vert", 
    label: "Espace Vert", 
    icon: Trees, 
    description: "Espace en pleine nature pour mariages champêtres et bohèmes",
    defaultIndoor: false,
    emoji: "🌿"
  },
  { 
    value: "espace_mer", 
    label: "Espace sur Mer", 
    icon: Waves, 
    description: "Espace avec vue sur la mer pour mariages romantiques",
    defaultIndoor: false,
    emoji: "🌊"
  },
];

const PERIOD_OPTIONS: { value: UnavailablePeriod; label: string; icon: any }[] = [
  { value: "morning", label: "Matinée (16h-20h)", icon: Sunrise },
  { value: "evening", label: "Soirée (21h-00h)", icon: Moon },
  { value: "full", label: "Journée complète", icon: CalendarDays },
];

const getTypeLabel = (type: string) => {
  const found = TYPE_OPTIONS.find(t => t.value === type);
  return found ? found.label : type;
};

const getTypeEmoji = (type: string) => {
  const found = TYPE_OPTIONS.find(t => t.value === type);
  return found ? found.emoji : "🏛️";
};

const getPeriodLabel = (period: UnavailablePeriod) => {
  const found = PERIOD_OPTIONS.find(p => p.value === period);
  return found ? found.label : period;
};

export const AdminVenues = ({ colors }: { colors: any }) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formError, setFormError] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<Venue, "id">>(EMPTY_FORM);

  // Champs temporaires pour ajouter une (ou plusieurs) date(s) indisponible(s)
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [newUnavailableDate, setNewUnavailableDate] = useState("");
  const [newUnavailableEndDate, setNewUnavailableEndDate] = useState("");
  const [newUnavailablePeriod, setNewUnavailablePeriod] = useState<UnavailablePeriod>("full");
  const [rangeError, setRangeError] = useState("");

  useEffect(() => { 
    fetchVenues(); 
  }, []);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredVenues(venues);
    } else {
      setFilteredVenues(venues.filter(v => v.type === activeFilter));
    }
  }, [venues, activeFilter]);

  const fetchVenues = async () => {
    setFetchLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "venues"));
      const data: Venue[] = [];
      querySnapshot.forEach((d) => {
        const venueData = d.data();
        data.push({
          id: d.id,
          ...venueData,
          unavailableDates: venueData.unavailableDates || [],
          seasonalPrices: venueData.seasonalPrices || [], // ✅ AJOUTER ICI
        } as Venue);
      });
      setVenues(data);
      setFilteredVenues(data);
    } catch (error) {
      console.error("Erreur fetch:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Fusionne une date+période dans un tableau d'indisponibilités existant
  const mergeUnavailableDate = (
    list: UnavailableDate[],
    date: string,
    period: UnavailablePeriod
  ): UnavailableDate[] => {
    const existingIndex = list.findIndex((u) => u.date === date);

    if (existingIndex !== -1) {
      const existing = list[existingIndex];
      let mergedPeriod: UnavailablePeriod = period;
      if (
        existing.period === "full" ||
        period === "full" ||
        (existing.period === "morning" && period === "evening") ||
        (existing.period === "evening" && period === "morning")
      ) {
        mergedPeriod = "full";
      }
      const updated = [...list];
      updated[existingIndex] = { date, period: mergedPeriod };
      return updated;
    }

    return [...list, { date, period }];
  };

  // Génère la liste des dates (YYYY-MM-DD) entre deux bornes incluses
  const getDateRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    const current = new Date(start + "T00:00:00");
    const last = new Date(end + "T00:00:00");
    while (current <= last) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleAddUnavailableDate = () => {
    setRangeError("");

    if (dateMode === "single") {
      if (!newUnavailableDate) return;
      setFormData((prev) => ({
        ...prev,
        unavailableDates: mergeUnavailableDate(
          prev.unavailableDates,
          newUnavailableDate,
          newUnavailablePeriod
        ).sort((a, b) => a.date.localeCompare(b.date)),
      }));
      setNewUnavailableDate("");
    } else {
      if (!newUnavailableDate || !newUnavailableEndDate) return;
      if (newUnavailableEndDate < newUnavailableDate) {
        setRangeError("La date de fin doit être après la date de début");
        return;
      }
      const datesToAdd = getDateRange(newUnavailableDate, newUnavailableEndDate);
      setFormData((prev) => {
        let updated = [...prev.unavailableDates];
        datesToAdd.forEach((d) => {
          updated = mergeUnavailableDate(updated, d, newUnavailablePeriod);
        });
        return { ...prev, unavailableDates: updated.sort((a, b) => a.date.localeCompare(b.date)) };
      });
      setNewUnavailableDate("");
      setNewUnavailableEndDate("");
    }

    setNewUnavailablePeriod("full");
  };

  const handleRemoveUnavailableDate = (date: string) => {
    setFormData(prev => ({
      ...prev,
      unavailableDates: prev.unavailableDates.filter((u) => u.date !== date),
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.capacity) {
      setFormError("Tous les champs obligatoires doivent être remplis");
      return;
    }
    if (formData.tables <= 0) {
      setFormError("Le nombre de tables doit être supérieur à 0");
      return;
    }
    if (!formData.image) {
      setFormError("Une image est requise");
      return;
    }

    setSubmitLoading(true);

    const dataToSave = {
      name: formData.name,
      description: formData.description,
      image: formData.image,
      capacity: formData.capacity,
      tables: formData.tables,
      chairs: formData.chairs,
      type: formData.type,
      seasonalPrices: formData.seasonalPrices || [],
      surface: formData.surface || "",
      isIndoor: formData.isIndoor,
      featured: formData.featured,
      unavailableDates: formData.unavailableDates || [],
      periodPrices: formData.periodPrices || [],
    };

    try {
      if (editingVenue?.id) {
        await updateDoc(doc(db, "venues", editingVenue.id), dataToSave);
        setVenues(prev => prev.map(v =>
          v.id === editingVenue.id ? { ...dataToSave, id: editingVenue.id } : v
        ));
      } else {
        const docRef = await addDoc(collection(db, "venues"), dataToSave);
        setVenues(prev => [...prev, { ...dataToSave, id: docRef.id }]);
      }
      closeModal();
    } catch (error: any) {
      console.error("Erreur détaillée:", error);
      setFormError(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet espace ?")) return;
    try {
      await deleteDoc(doc(db, "venues", id));
      setVenues(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const openEditModal = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name || "",
      description: venue.description || "",
      image: venue.image || "",
      capacity: venue.capacity || "",
      tables: venue.tables || 0,
      chairs: venue.chairs || 0,
      type: venue.type || "salle_fete",
      seasonalPrices: venue.seasonalPrices || [],
      surface: venue.surface || "",
      isIndoor: venue.isIndoor !== undefined ? venue.isIndoor : true,
      featured: venue.featured || false,
      unavailableDates: venue.unavailableDates || [],
      periodPrices: venue.periodPrices || [],
    });
    setImagePreview(venue.image || "");
    setFormError("");
    setDateMode("single");
    setNewUnavailableDate("");
    setNewUnavailableEndDate("");
    setNewUnavailablePeriod("full");
    setRangeError("");
    setIsModalOpen(true);
  };
  const openAddModal = () => {
    setEditingVenue(null);
    setFormData({ ...EMPTY_FORM});
    setImagePreview("");
    setFormError("");
    setDateMode("single");
    setNewUnavailableDate("");
    setNewUnavailableEndDate("");
    setNewUnavailablePeriod("full");
    setRangeError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVenue(null);
    setFormData({ ...EMPTY_FORM });
    setImagePreview("");
    setFormError("");
    setDateMode("single");
    setNewUnavailableDate("");
    setNewUnavailableEndDate("");
    setNewUnavailablePeriod("full");
    setRangeError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Gérer le changement de type pour mettre à jour isIndoor automatiquement
  const handleTypeChange = (type: Venue["type"]) => {
    const option = TYPE_OPTIONS.find(t => t.value === type);
    setFormData({ 
      ...formData, 
      type,
      isIndoor: option ? option.defaultIndoor : true 
    });
  };

  if (fetchLoading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: colors.textDark }}>
            Gestion des Espaces
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textLight }}>
            Gérez les salles de fête, salles plénières, espaces verts, espaces sur mer, jardins et terrasses
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: colors.primary, color: "white" }}
        >
          <Plus size={18} />
          Ajouter un espace
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeFilter === "all" ? "text-white" : ""
          }`}
          style={{
            backgroundColor: activeFilter === "all" ? colors.primary : `${colors.textLight}10`,
            color: activeFilter === "all" ? "white" : colors.textLight,
          }}
        >
          ❤️ Tous ({venues.length})
        </button>
        {TYPE_OPTIONS.map((type) => {
          const count = venues.filter(v => v.type === type.value).length;
          return (
            <button
              key={type.value}
              onClick={() => setActiveFilter(type.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeFilter === type.value ? "text-white" : ""
              }`}
              style={{
                backgroundColor: activeFilter === type.value ? colors.primary : `${colors.textLight}10`,
                color: activeFilter === type.value ? "white" : colors.textLight,
              }}
            >
              <span>{type.emoji}</span>
              {type.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grille */}
      {filteredVenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <Heart size={36} style={{ color: colors.primary }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: colors.textDark }}>
            {activeFilter === "all" ? "Aucun espace" : `Aucun ${getTypeLabel(activeFilter)}`}
          </h3>
          <p className="text-sm mb-6 max-w-xs" style={{ color: colors.textLight }}>
            {activeFilter === "all" 
              ? "Vous n'avez pas encore ajouté d'espaces pour les mariages. Commencez par en ajouter un."
              : `Aucun ${getTypeLabel(activeFilter)} n'a été ajouté pour le moment.`}
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90 text-sm font-medium"
            style={{ backgroundColor: colors.primary, color: "white" }}
          >
            <Plus size={16} />
            Ajouter un espace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue, idx) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm border-2 hover:shadow-lg transition-all"
              style={{ borderColor: venue.featured ? colors.primary : "transparent" }}
            >
              {/* Badge Featured */}
              {venue.featured && (
                <div
                  className="text-center py-1 text-xs font-medium text-white flex items-center justify-center gap-1"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Sparkles size={12} />
                  Espace recommandé pour mariage
                </div>
              )}

              {/* Image */}
              <div className="h-48 overflow-hidden bg-gray-100 relative">
                {venue.image ? (
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={40} className="text-gray-300" />
                  </div>
                )}
                {/* Type badge */}
                <div
                  className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1"
                  style={{ backgroundColor: colors.primary }}
                >
                  <span>{getTypeEmoji(venue.type)}</span>
                  {getTypeLabel(venue.type)}
                </div>
                {/* Indoor/Outdoor badge */}
                <div
                  className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1"
                  style={{ 
                    backgroundColor: venue.isIndoor ? "#4CAF50" : "#FF9800" 
                  }}
                >
                  {venue.isIndoor ? (
                    <>
                      <Home size={12} /> Intérieur
                    </>
                  ) : (
                    <>
                      <Sun size={12} /> Extérieur
                    </>
                  )}
                </div>
              </div>

              <div className="p-4">
                {/* Nom */}
                <h3 className="font-semibold text-lg mb-1">{venue.name}</h3>
                
                {/* Capacité */}
                <div className="flex items-center gap-4 mb-2 text-sm" style={{ color: colors.textLight }}>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {venue.capacity}
                  </span>
                  <span className="flex items-center gap-1">
                    <Table size={14} />
                    {venue.tables} tables
                  </span>
                </div>

                {/* Surface */}
                {venue.surface && (
                  <p className="text-xs flex items-center gap-1 mb-2" style={{ color: colors.textLight }}>
                    <Square size={12} />
                    {venue.surface}
                  </p>
                )}

                {/* Description */}
                <p className="text-sm mb-3 line-clamp-2" style={{ color: colors.textLight }}>
                  {venue.description}
                </p>
                {/* Dates indisponibles */}
                {venue.unavailableDates && venue.unavailableDates.length > 0 && (
                  <div
                    className="mb-3 px-2.5 py-2 rounded-lg flex items-start gap-2"
                    style={{ backgroundColor: "#F4433610" }}
                  >
                    <CalendarOff size={14} className="mt-0.5 shrink-0" style={{ color: "#F44336" }} />
                    <p className="text-xs" style={{ color: "#D32F2F" }}>
                      {venue.unavailableDates.length} date
                      {venue.unavailableDates.length > 1 ? "s" : ""} bloquée
                      {venue.unavailableDates.length > 1 ? "s" : ""}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(venue)}
                    className="flex-1 py-2 rounded-lg text-white text-sm flex items-center justify-center gap-1"
                    style={{ background: colors.primary }}
                  >
                    <Edit2 size={14} /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(venue.id!)}
                    className="px-3 py-2 rounded-lg border text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Ajouter / Modifier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-medium" style={{ color: colors.textDark }}>
                {editingVenue ? "Modifier" : "Ajouter"} un espace
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  {"Nom de l'espace *"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: `${colors.primary}50` }}
                  placeholder="Ex: Salle des Cèdres"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  {"Type d'espace de mariage *"}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map((type) => {
                    const isSelected = formData.type === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeChange(type.value as Venue["type"])}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          isSelected ? "border-" : ""
                        }`}
                        style={{
                          borderColor: isSelected ? colors.primary : `${colors.textLight}20`,
                          backgroundColor: isSelected ? `${colors.primary}10` : "transparent",
                        }}
                      >
                        <span className="text-xl">{type.emoji}</span>
                        <span className="text-xs font-medium" style={{ color: isSelected ? colors.primary : colors.textLight }}>
                          {type.label}
                        </span>
                        <span className="text-[10px] text-center" style={{ color: colors.textLight }}>
                          {type.description.split("pour")[1]?.trim() || type.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capacité + Tables + Chaises */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                    Capacité *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ borderColor: `${colors.primary}50` }}
                    placeholder="Ex: 300 invités"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                    Tables *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.tables || ""}
                    onChange={(e) => setFormData({ ...formData, tables: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ borderColor: `${colors.primary}50` }}
                    placeholder="Ex: 30"
                  />
                </div>
              </div>
              <SeasonalPricesEditor
                seasonalPrices={formData.seasonalPrices || []}
                onChange={(prices) => setFormData({ ...formData, seasonalPrices: prices })}
                colors={colors}
              />
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  🕐 Tarifs par créneau horaire
                </label>
                <p className="text-xs mb-3" style={{ color: colors.textLight }}>
                  Si défini, le prix changera selon le créneau choisi par le client.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "morning" as const, label: "Matinée (16h–20h)", emoji: "☀️" },
                    { value: "evening" as const, label: "Soirée (21h–00h)", emoji: "🌙" },
                  ].map(({ value, label, emoji }) => {
                    const current = formData.periodPrices?.find(p => p.period === value);
                    return (
                      <div key={value} className="flex items-center gap-2">
                        <span className="text-sm">{emoji}</span>
                        <div className="flex-1">
                          <p className="text-xs mb-1" style={{ color: colors.textLight }}>{label}</p>
                          <input
                            type="number"
                            value={current?.price || ""}
                            onChange={(e) => {
                              const numVal = parseFloat(e.target.value);
                              const existing = formData.periodPrices?.find(p => p.period === value);
                              let newPrices = formData.periodPrices ? [...formData.periodPrices] : [];
                              if (existing) {
                                newPrices = newPrices.map(p =>
                                  p.period === value
                                    ? { ...p, price: e.target.value, priceNumber: isNaN(numVal) ? 0 : numVal }
                                    : p
                                );
                              } else {
                                newPrices.push({ period: value, price: e.target.value, priceNumber: isNaN(numVal) ? 0 : numVal });
                              }
                              setFormData({ ...formData, periodPrices: newPrices });
                            }}
                            placeholder="Prix en TND"
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none"
                            style={{ borderColor: `${colors.primary}50` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  {"Image de l'espace *"}
                </label>
                {imagePreview && (
                  <div className="mb-2 relative w-full h-40 rounded-lg overflow-hidden border"
                    style={{ borderColor: `${colors.primary}30` }}>
                    <img src={imagePreview} alt="Prévisualisation" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setFormData(prev => ({ ...prev, image: "" }));
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                )}
                <div
                  className="w-full px-3 py-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: `${colors.primary}50` }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={24} className="mx-auto mb-1" style={{ color: colors.primary }} />
                  <p className="text-sm" style={{ color: colors.textLight }}>
                    {imagePreview ? "Changer l'image" : "Cliquez pour sélectionner une image de l'espace"}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <hr style={{ borderColor: `${colors.textLight}20` }} />

              {/* Dates d'indisponibilité */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: colors.textDark }}>
                  <CalendarOff size={16} style={{ color: colors.primary }} />
                  Dates d&apos;indisponibilité
                </label>
                <p className="text-xs mb-3" style={{ color: colors.textLight }}>
                  Bloquez les dates où cet espace n&apos;est pas disponible, en précisant si c&apos;est pour la matinée, la soirée, ou toute la journée.
                </p>

                {/* Formulaire d'ajout */}
                <div
                  className="p-3 rounded-lg border mb-3"
                  style={{ borderColor: `${colors.primary}30`, backgroundColor: `${colors.primary}05` }}
                >
                  {/* Toggle date unique / plage de dates */}
                  <div className="flex gap-2 mb-3 p-1 rounded-full" style={{ background: `${colors.textLight}10` }}>
                    <button
                      type="button"
                      onClick={() => { setDateMode("single"); setRangeError(""); }}
                      className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        dateMode === "single" ? "text-white shadow-sm" : ""
                      }`}
                      style={dateMode === "single" ? { background: colors.primary } : { color: colors.textLight }}
                    >
                      <CalendarOff size={12} />
                      Date unique
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDateMode("range"); setRangeError(""); }}
                      className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        dateMode === "range" ? "text-white shadow-sm" : ""
                      }`}
                      style={dateMode === "range" ? { background: colors.primary } : { color: colors.textLight }}
                    >
                      <CalendarDays size={12} />
                      Plage de dates
                    </button>
                  </div>

                  {dateMode === "single" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 mb-2">
                      <input
                        type="date"
                        value={newUnavailableDate}
                        onChange={(e) => setNewUnavailableDate(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                        style={{ borderColor: `${colors.primary}50` }}
                      />
                      <button
                        type="button"
                        onClick={handleAddUnavailableDate}
                        disabled={!newUnavailableDate}
                        className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Plus size={14} />
                        Ajouter
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] mb-1 block" style={{ color: colors.textLight }}>
                            Date de début
                          </label>
                          <input
                            type="date"
                            value={newUnavailableDate}
                            onChange={(e) => setNewUnavailableDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                            style={{ borderColor: `${colors.primary}50` }}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] mb-1 block" style={{ color: colors.textLight }}>
                            Date de fin
                          </label>
                          <input
                            type="date"
                            min={newUnavailableDate || undefined}
                            value={newUnavailableEndDate}
                            onChange={(e) => setNewUnavailableEndDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                            style={{ borderColor: `${colors.primary}50` }}
                          />
                        </div>
                      </div>
                      {rangeError && (
                        <p className="text-xs text-red-600">{rangeError}</p>
                      )}
                      <button
                        type="button"
                        onClick={handleAddUnavailableDate}
                        disabled={!newUnavailableDate || !newUnavailableEndDate}
                        className="w-full px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Plus size={14} />
                        Bloquer toute la période
                        {newUnavailableDate && newUnavailableEndDate && newUnavailableEndDate >= newUnavailableDate
                          ? ` (${getDateRange(newUnavailableDate, newUnavailableEndDate).length} jours)`
                          : ""}
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {PERIOD_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const selected = newUnavailablePeriod === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setNewUnavailablePeriod(opt.value)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all border-2"
                          style={{
                            borderColor: selected ? colors.primary : `${colors.textLight}25`,
                            backgroundColor: selected ? colors.primary : "transparent",
                            color: selected ? "white" : colors.textLight,
                          }}
                        >
                          <Icon size={12} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Liste des dates bloquées */}
                {formData.unavailableDates.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {formData.unavailableDates.map((u) => (
                      <div
                        key={u.date}
                        className="flex items-center justify-between px-3 py-2 rounded-lg border"
                        style={{ borderColor: `${colors.textLight}20` }}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarOff size={14} style={{ color: "#F44336" }} />
                          <span className="text-sm" style={{ color: colors.textDark }}>
                            {new Date(u.date).toLocaleDateString("fr-FR", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}
                          >
                            {getPeriodLabel(u.period)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveUnavailableDate(u.date)}
                          className="p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <X size={14} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center py-3" style={{ color: colors.textLight }}>
                    Aucune date bloquée pour le moment — cet espace est disponible à toutes les dates.
                  </p>
                )}
              </div>

              {formError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {formError}
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  {submitLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {editingVenue ? "Modification..." : "Création..."}
                    </>
                  ) : (
                    editingVenue ? "Mettre à jour l'espace" : "Ajouter l'espace"
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitLoading}
                  className="flex-1 py-3 rounded-lg border transition-all hover:bg-gray-50 disabled:opacity-60"
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};