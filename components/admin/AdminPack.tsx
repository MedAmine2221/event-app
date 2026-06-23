/* eslint-disable react-hooks/immutability */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";;
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  X,
  ImageIcon,
  Palette,
  Droplets,
  Coffee,
  Sparkles,
  Edit2,
} from "lucide-react";
import { ReservationPack, DecorOption, JuiceOption, PackId, PACK_LABELS, SeasonalPrice, Season, SEASONS } from "@/types/pack";
import { getReservationPacks, saveReservationPack } from "@/lib/pack-service";
import { PACK_IDS } from "@/constants";


const DEFAULT_PACK: Record<PackId, Omit<ReservationPack, "id" | "packId">> = {
  pack1: {
    name: "Standard",
    description: "Choisissez votre salle et personnalisez la décoration : couleur, nappes et housses de chaises.",
    price: "À partir de 2000 TND",
    seasonalPrices: [],
    image: "",
    decorOptions: [],
  },
  pack2: {
    name: "Prestig",
    description: "Choisissez votre salle, profitez de l'eau, du thé et d'un service inclus.",
    price: "À partir de 1500 TND",
    seasonalPrices: [],
    image: "",
    includesWater: true,
    includesTea: true,
    serviceDescription: "Service de table inclus",
  },
  pack3: {
    name: "Premium",
    description: "Choisissez votre salle, profitez d'un serveur dédié, d'un jus au choix, de l'eau et du thé.",
    price: "À partir de 2500 TND",
    seasonalPrices: [],
    image: "",
    includesWater: true,
    includesTea: true,
    includesWaiter: true,
    serviceDescription: "Serveur dédié pendant tout l'événement",
    juiceOptions: [],
  },
};
  const SeasonalPricesEditor = ({ 
    seasonalPrices, 
    onChange, 
    colors 
  }: { 
    seasonalPrices: SeasonalPrice[]; 
    onChange: (prices: SeasonalPrice[]) => void;
    colors: any;
  }) => {
    const updateSeasonalPrice = (season: Season, value: string) => {
      const numValue = parseFloat(value);
      const existing = seasonalPrices.find(sp => sp.season === season);
      let newPrices: SeasonalPrice[];
      
      if (existing) {
        newPrices = seasonalPrices.map(sp => 
          sp.season === season 
            ? { ...sp, price: value, priceNumber: isNaN(numValue) ? 0 : numValue }
            : sp
        );
      } else {
        newPrices = [
          ...seasonalPrices,
          { season, price: value, priceNumber: isNaN(numValue) ? 0 : numValue }
        ];
      }
      
      onChange(newPrices);
    };
    
    return (
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
          🏷️ Tarifs saisonniers
        </label>
        <p className="text-xs mb-3" style={{ color: colors.textLight }}>
          {"Si aucun prix saisonnier n'est défini, le prix par défaut sera utilisé."}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SEASONS.map(({ value, label, emoji }) => {
            const current = seasonalPrices.find(sp => sp.season === value);
            return (
              <div key={value} className="flex items-center gap-2">
                <span className="text-sm">{emoji}</span>
                <input
                  type="number"
                  value={current?.price || ""}
                  onChange={(e) => updateSeasonalPrice(value, e.target.value)}
                  placeholder={label}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none"
                  style={{ borderColor: `${colors.primary}50` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };
export const AdminPacks = ({ colors }: { colors: any }) => {
  const [packs, setPacks] = useState<Record<string, ReservationPack>>({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackId, setEditingPackId] = useState<PackId | null>(null);
  const [formError, setFormError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<ReservationPack, "id" | "packId">>(DEFAULT_PACK.pack1);

  useEffect(() => { fetchPacks(); }, []);

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const data = await getReservationPacks();
      const map: Record<string, ReservationPack> = {};
      data.forEach((p) => { map[p.packId] = p; });
      setPacks(map);
    } catch (error) {
      console.error("Erreur fetch packs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setFormData((prev) => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const openEditModal = (packId: PackId) => {
    const existing = packs[packId];
    setEditingPackId(packId);
    setFormData(existing ? { ...DEFAULT_PACK[packId], ...existing } : DEFAULT_PACK[packId]);
    setImagePreview(existing?.image || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackId(null);
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Pack 1 : options décor ---
  const addDecorOption = () => {
    const newOption: DecorOption = {
      id: `decor_${Date.now()}`,
      label: "",
      color: "#C3937C",
      nappeColor: "#EAD9C9",
      chairCoverColor: "#FFFFFF",
    };
    setFormData((prev) => ({ ...prev, decorOptions: [...(prev.decorOptions || []), newOption] }));
  };

  const updateDecorOption = (id: string, field: keyof DecorOption, value: string) => {
    setFormData((prev) => ({
      ...prev,
      decorOptions: (prev.decorOptions || []).map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const removeDecorOption = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      decorOptions: (prev.decorOptions || []).filter((opt) => opt.id !== id),
    }));
  };

  // --- Pack 3 : jus ---
  const addJuiceOption = () => {
    const newOption: JuiceOption = { id: `juice_${Date.now()}`, name: "" };
    setFormData((prev) => ({ ...prev, juiceOptions: [...(prev.juiceOptions || []), newOption] }));
  };

  const updateJuiceOption = (id: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      juiceOptions: (prev.juiceOptions || []).map((opt) => (opt.id === id ? { ...opt, name } : opt)),
    }));
  };

  const removeJuiceOption = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      juiceOptions: (prev.juiceOptions || []).filter((opt) => opt.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!editingPackId) return;

    if (!formData.name || !formData.description || !formData.price) {
      setFormError("Tous les champs obligatoires doivent être remplis");
      return;
    }

    setSubmitLoading(true);
    try {
      const cleanData = { 
        ...formData,
        seasonalPrices: formData.seasonalPrices || [],
      };
      if (cleanData.decorOptions) {
        cleanData.decorOptions = cleanData.decorOptions.filter((o) => o.label.trim() !== "");
      }
      if (cleanData.juiceOptions) {
        cleanData.juiceOptions = cleanData.juiceOptions.filter((o) => o.name.trim() !== "");
      }

      await saveReservationPack(editingPackId, cleanData);
      setPacks((prev) => ({
        ...prev,
        [editingPackId]: { id: editingPackId, packId: editingPackId, ...cleanData },
      }));
      closeModal();
    } catch (error: any) {
      setFormError(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-medium" style={{ color: colors.textDark }}>
          Packs de Réservation
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textLight }}>
          Configurez les 3 packs proposés aux clients lors de la réservation d&apos;une salle
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PACK_IDS.map((packId, idx) => {
          const pack = packs[packId] ? { ...DEFAULT_PACK[packId], ...packs[packId] } : DEFAULT_PACK[packId];
          const icons = [Palette, Droplets, Coffee];
          const Icon = icons[idx];

          return (
            <motion.div
              key={packId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border-2"
              style={{ borderColor: packs[packId] ? colors.primary : `${colors.textLight}20` }}
            >
              <div className="h-40 overflow-hidden bg-gray-100 relative">
                {pack.image ? (
                  <img src={pack.image} alt={pack.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: `${colors.primary}10` }}>
                    <Icon size={36} style={{ color: colors.primary }} />
                  </div>
                )}
                <span
                  className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ background: colors.primary }}
                >
                  {PACK_LABELS[packId].split("—")[0].trim()}
                </span>
                {!packs[packId] && (
                  <span className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700">
                    Non configuré
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-1">{pack.name}</h3>
                <p className="text-sm mb-3" style={{ color: colors.textLight }}>{pack.description}</p>
                <p className="text-sm font-semibold mb-4" style={{ color: colors.primary }}>{pack.price}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.primary}15`, color: colors.primary }}>
                    🏛️ Choix de salle
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.primary}15`, color: colors.primary }}>
                    🎨 {pack.decorOptions?.length || 0} décors
                  </span>
                  {(packId === "pack2" || packId === "pack3") && pack.includesWater && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.primary}15`, color: colors.primary }}>
                      💧 Eau
                    </span>
                  )}
                  {(packId === "pack2" || packId === "pack3") && pack.includesTea && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.primary}15`, color: colors.primary }}>
                      🍵 Thé
                    </span>
                  )}
                  {packId === "pack3" && pack.includesWaiter && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.primary}15`, color: colors.primary }}>
                      🤵 Serveur
                    </span>
                  )}
                  {packId === "pack3" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${colors.primary}15`, color: colors.primary }}>
                      🥤 {pack.juiceOptions?.length || 0} jus
                    </span>
                  )}
                </div>

                <button
                  onClick={() => openEditModal(packId)}
                  className="w-full py-2 rounded-lg text-white text-sm flex items-center justify-center gap-1.5"
                  style={{ background: colors.primary }}
                >
                  <Edit2 size={14} /> Configurer
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {isModalOpen && editingPackId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-medium" style={{ color: colors.textDark }}>
                Configurer le {PACK_LABELS[editingPackId]}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>Nom du pack *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  style={{ borderColor: `${colors.primary}50` }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  style={{ borderColor: `${colors.primary}50` }}
                />
              </div>
              <SeasonalPricesEditor
                seasonalPrices={formData.seasonalPrices || []}
                onChange={(prices) => setFormData({ ...formData, seasonalPrices: prices })}
                colors={colors}
              />

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>Image</label>
                {imagePreview && (
                  <div className="mb-2 relative w-full h-36 rounded-lg overflow-hidden border" style={{ borderColor: `${colors.primary}30` }}>
                    <img src={imagePreview} alt="Prévisualisation" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(""); setFormData((p) => ({ ...p, image: "" })); }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                )}
                <div
                  className="w-full px-3 py-5 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: `${colors.primary}50` }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={22} className="mx-auto mb-1" style={{ color: colors.primary }} />
                  <p className="text-sm" style={{ color: colors.textLight }}>
                    {imagePreview ? "Changer l'image" : "Cliquez pour sélectionner une image"}
                  </p>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </div>
              </div>

              <hr style={{ borderColor: `${colors.textLight}20` }} />

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: colors.textDark }}>
                  <Palette size={16} style={{ color: colors.primary }} />
                  Options de décor (couleur, nappe, housse de chaise)
                </label>
                <div className="space-y-3">
                  {(formData.decorOptions || []).map((opt) => (
                    <div key={opt.id} className="flex flex-wrap items-center gap-2 p-3 rounded-lg border" style={{ borderColor: `${colors.textLight}20` }}>
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => updateDecorOption(opt.id, "label", e.target.value)}
                        placeholder="Nom (ex: Rouge & Or)"
                        className="flex-1 min-w-32 px-3 py-2 border rounded-lg text-sm focus:outline-none"
                        style={{ borderColor: `${colors.primary}50` }}
                      />
                      <label className="flex items-center gap-1 text-xs" style={{ color: colors.textLight }}>
                        Couleur
                        <input type="color" value={opt.color} onChange={(e) => updateDecorOption(opt.id, "color", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                      </label>
                      <label className="flex items-center gap-1 text-xs" style={{ color: colors.textLight }}>
                        Nappe
                        <input type="color" value={opt.nappeColor} onChange={(e) => updateDecorOption(opt.id, "nappeColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                      </label>
                      <label className="flex items-center gap-1 text-xs" style={{ color: colors.textLight }}>
                        Housse
                        <input type="color" value={opt.chairCoverColor} onChange={(e) => updateDecorOption(opt.id, "chairCoverColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                      </label>
                      <button type="button" onClick={() => removeDecorOption(opt.id)} className="p-1.5 rounded hover:bg-red-50">
                        <X size={14} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addDecorOption} className="mt-2 text-sm flex items-center gap-1 hover:opacity-80" style={{ color: colors.primary }}>
                  <Plus size={14} /> Ajouter une option de décor
                </button>
              </div>
              {(editingPackId === "pack2" || editingPackId === "pack3") && (
                <div className="space-y-3">
                  <div className="flex items-center gap-6 flex-wrap">
                    <label className="flex items-center gap-2 text-sm" style={{ color: colors.textDark }}>
                      <input type="checkbox" checked={!!formData.includesWater} onChange={(e) => setFormData({ ...formData, includesWater: e.target.checked })} className="w-4 h-4" style={{ accentColor: colors.primary }} />
                      <Droplets size={14} /> Eau incluse
                    </label>
                    <label className="flex items-center gap-2 text-sm" style={{ color: colors.textDark }}>
                      <input type="checkbox" checked={!!formData.includesTea} onChange={(e) => setFormData({ ...formData, includesTea: e.target.checked })} className="w-4 h-4" style={{ accentColor: colors.primary }} />
                      <Coffee size={14} /> Thé inclus
                    </label>
                    {editingPackId === "pack3" && (
                      <label className="flex items-center gap-2 text-sm" style={{ color: colors.textDark }}>
                        <input type="checkbox" checked={!!formData.includesWaiter} onChange={(e) => setFormData({ ...formData, includesWaiter: e.target.checked })} className="w-4 h-4" style={{ accentColor: colors.primary }} />
                        <Sparkles size={14} /> Serveur inclus
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>Description du service</label>
                    <input
                      type="text"
                      value={formData.serviceDescription || ""}
                      onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                      style={{ borderColor: `${colors.primary}50` }}
                      placeholder="Ex: Service de table assuré par notre équipe"
                    />
                  </div>
                </div>
              )}

              {editingPackId === "pack3" && (
                <div>
                  <label className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: colors.textDark }}>
                    🥤 Choix de jus proposés au client
                  </label>
                  <div className="space-y-2">
                    {(formData.juiceOptions || []).map((opt) => (
                      <div key={opt.id} className="flex gap-2">
                        <input
                          type="text"
                          value={opt.name}
                          onChange={(e) => updateJuiceOption(opt.id, e.target.value)}
                          placeholder="Ex: Jus d'orange"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none"
                          style={{ borderColor: `${colors.primary}50` }}
                        />
                        <button type="button" onClick={() => removeJuiceOption(opt.id)} className="p-1.5 rounded hover:bg-red-50">
                          <X size={14} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addJuiceOption} className="mt-2 text-sm flex items-center gap-1 hover:opacity-80" style={{ color: colors.primary }}>
                    <Plus size={14} /> Ajouter un jus
                  </button>
                </div>
              )}

              {formError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: colors.primary }}
                >
                  {submitLoading ? "Enregistrement..." : "Enregistrer le pack"}
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