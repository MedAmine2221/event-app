/* eslint-disable react-hooks/immutability */
// components/admin/AdminWeddingPackages.tsx
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ImageIcon,
  Crown,
  Star,
  Sparkles,
  Music,
  Cake,
  Coffee,
  Flower2,
  Users,
  MapPin,
  Camera,
  Home,
  Trees,
  Waves,
  Sofa,
  Globe,
  CheckCircle,
  Heart,
} from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface WeddingPackage {
  id?: string;
  name: string;
  type: "normal" | "pro" | "gold" | "premium";
  description: string;
  price: string;
  priceDetails: {
    perPerson?: string;
    total?: string;
    minGuests?: number;
    maxGuests?: number;
  };
  features: {
    venue: {
      included: boolean;
      types?: string[];
      description: string;
    };
    band: {
      included: boolean;
      description: string;
      options?: string[];
    };
    pastries: {
      included: boolean;
      description: string;
      options?: string[];
    };
    drinks: {
      included: boolean;
      description: string;
      options?: string[];
    };
    sweets: {
      included: boolean;
      description: string;
      options?: string[];
    };
    decoration?: {
      included: boolean;
      description: string;
    };
    weddingPlanner?: {
      included: boolean;
      description: string;
    };
    animation?: {
      included: boolean;
      description: string;
    };
    photography?: {
      included: boolean;
      description: string;
    };
  };
  includedItems: string[];
  isPopular?: boolean;
  image?: string;
}

const PACKAGE_TYPES = [
  { 
    value: "standard", 
    label: "Standard", 
    icon: Heart,
    color: "#4CAF50",
    description: ""
  },
  { 
    value: "prestige", 
    label: "Prestige", 
    icon: Star,
    color: "#2196F3",
    description: ""
  },
  { 
    value: "premium", 
    label: "Premium", 
    icon: Crown,
    color: "#FFD700",
    description: ""
  },
];

const VENUE_TYPES = [
  { value: "salle_fete", label: "Salle de Fête", icon: Home },
  { value: "salle_planaire", label: "Salle Plénière", icon: Globe },
  { value: "espace_vert", label: "Espace Vert", icon: Trees },
  { value: "espace_mer", label: "Espace sur Mer", icon: Waves },
  { value: "jardin", label: "Jardin", icon: Flower2 },
  { value: "terrasse", label: "Terrasse", icon: Sofa },
];

const EMPTY_FORM: Omit<WeddingPackage, "id"> = {
  name: "",
  type: "normal",
  description: "",
  price: "",
  priceDetails: {
    perPerson: "",
    total: "",
    minGuests: 50,
    maxGuests: 150,
  },
  features: {
    venue: { included: true, types: [], description: "" },
    band: { included: true, description: "", options: [] },
    pastries: { included: true, description: "", options: [] },
    drinks: { included: true, description: "", options: [] },
    sweets: { included: true, description: "", options: [] },
    decoration: { included: false, description: "" },
    weddingPlanner: { included: false, description: "" },
    animation: { included: false, description: "" },
    photography: { included: false, description: "" },
  },
  includedItems: [""],
  isPopular: false,
  image: "",
};

export const AdminWeddingPackages = ({ colors }: { colors: any }) => {
  const [packages, setPackages] = useState<WeddingPackage[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<WeddingPackage | null>(null);
  const [formError, setFormError] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<WeddingPackage, "id">>(EMPTY_FORM);

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    setFetchLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "weddingPackages"));
      const data: WeddingPackage[] = [];
      querySnapshot.forEach((d) => data.push({ id: d.id, ...d.data() } as WeddingPackage));
      setPackages(data);
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

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...formData.includedItems];
    newItems[index] = value;
    if (index === newItems.length - 1 && value.trim() !== "") {
      newItems.push("");
    }
    setFormData({ ...formData, includedItems: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = formData.includedItems.filter((_, i) => i !== index);
    if (newItems.length === 0) newItems.push("");
    setFormData({ ...formData, includedItems: newItems });
  };

  const handleOptionChange = (
    category: keyof WeddingPackage["features"],
    field: "options" | "description",
    value: any
  ) => {
    const feature = formData.features[category];
    if (!feature) return;
    
    // S'assurer que options est un tableau
    const options = Array.isArray(feature.options) ? feature.options : [];
    
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [category]: {
          ...feature,
          [field]: value,
          options: options,
        },
      },
    });
  };

  const addOption = (category: keyof WeddingPackage["features"]) => {
    const feature = formData.features[category];
    if (!feature) return;
    
    const options = Array.isArray(feature.options) ? [...feature.options] : [];
    options.push("");
    
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [category]: {
          ...feature,
          options: options,
        },
      },
    });
  };

  const removeOption = (category: keyof WeddingPackage["features"], index: number) => {
    const feature = formData.features[category];
    if (!feature) return;
    
    const options = Array.isArray(feature.options) ? feature.options : [];
    options.splice(index, 1);
    
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [category]: {
          ...feature,
          options: options,
        },
      },
    });
  };

  const updateOption = (category: keyof WeddingPackage["features"], index: number, value: string) => {
    const feature = formData.features[category];
    if (!feature) return;
    
    const options = Array.isArray(feature.options) ? [...feature.options] : [];
    options[index] = value;
    
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [category]: {
          ...feature,
          options: options,
        },
      },
    });
  };

  const toggleVenueType = (type: string) => {
    const currentTypes = formData.features.venue?.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        venue: {
          ...formData.features.venue,
          types: newTypes,
        },
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const cleanItems = formData.includedItems.filter(i => i.trim() !== "");
    
    // Nettoyer les options vides dans chaque catégorie
    const cleanedFeatures = { ...formData.features };
    Object.keys(cleanedFeatures).forEach((key) => {
      const feature = cleanedFeatures[key as keyof WeddingPackage["features"]];
      if (feature && Array.isArray(feature.options)) {
        feature.options = feature.options.filter(o => o && o.trim() !== "");
      }
      if (feature && feature.types && Array.isArray(feature.types)) {
        feature.types = feature.types.filter(t => t && t.trim() !== "");
      }
    });

    if (!formData.name || !formData.description || !formData.price) {
      setFormError("Tous les champs obligatoires doivent être remplis");
      return;
    }
    if (cleanItems.length === 0) {
      setFormError("Ajoutez au moins un élément inclus");
      return;
    }

    setSubmitLoading(true);
    const dataToSave = { 
      ...formData, 
      includedItems: cleanItems,
      features: cleanedFeatures 
    };

    try {
      if (editingPackage?.id) {
        await updateDoc(doc(db, "weddingPackages", editingPackage.id), dataToSave);
        setPackages(prev => prev.map(p =>
          p.id === editingPackage.id ? { ...dataToSave, id: editingPackage.id } : p
        ));
      } else {
        const docRef = await addDoc(collection(db, "weddingPackages"), dataToSave);
        setPackages(prev => [...prev, { ...dataToSave, id: docRef.id }]);
      }
      closeModal();
    } catch (error: any) {
      setFormError(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette formule ?")) return;
    try {
      await deleteDoc(doc(db, "weddingPackages", id));
      setPackages(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const openEditModal = (pkg: WeddingPackage) => {
    setEditingPackage(pkg);
    setFormData({
      ...pkg,
      includedItems: [...pkg.includedItems, ""],
    });
    setImagePreview(pkg.image || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPackage(null);
    setFormData({ ...EMPTY_FORM, includedItems: [""] });
    setImagePreview("");
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    setFormData({ ...EMPTY_FORM, includedItems: [""] });
    setImagePreview("");
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getTypeColor = (type: string) => {
    const found = PACKAGE_TYPES.find(t => t.value === type);
    return found ? found.color : "#C3937C";
  };

  if (fetchLoading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: colors.textDark }}>
            Formules Mariage
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textLight }}>
            Gérez les formules complètes : Normal, Pro, Gold et Premium
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: colors.primary, color: "white" }}
        >
          <Plus size={18} />
          Ajouter une formule
        </button>
      </div>

      {/* Grille */}
      {packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <Heart size={36} style={{ color: colors.primary }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: colors.textDark }}>
            Aucune formule de mariage
          </h3>
          <p className="text-sm mb-6 max-w-xs" style={{ color: colors.textLight }}>
            Vous n&apos;avez pas encore créé de formules. Commencez par en ajouter une.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90 text-sm font-medium"
            style={{ backgroundColor: colors.primary, color: "white" }}
          >
            <Plus size={16} />
            Ajouter une formule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg, idx) => {
            const typeColor = getTypeColor(pkg.type);
            const TypeIcon = PACKAGE_TYPES.find(t => t.value === pkg.type)?.icon || Heart;
            
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-xl overflow-hidden shadow-sm border-2 hover:shadow-lg transition-all ${
                  pkg.isPopular ? `border-[${colors.primary}]` : "border-transparent"
                }`}
              >
                {/* Badge Popular */}
                {pkg.isPopular && (
                  <div
                    className="text-center py-1 text-xs font-medium text-white flex items-center justify-center gap-1"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Sparkles size={12} />
                    Formule la plus populaire
                  </div>
                )}

                {/* Header avec type */}
                <div className="p-4" style={{ backgroundColor: `${typeColor}10` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: typeColor }}
                      >
                        <TypeIcon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: colors.textDark }}>
                          {pkg.name}
                        </h3>
                        <p className="text-xs" style={{ color: colors.textLight }}>
                          {PACKAGE_TYPES.find(t => t.value === pkg.type)?.description || ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ 
                      backgroundColor: typeColor,
                      color: "white"
                    }}>
                      {pkg.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {/* Image */}
                  {pkg.image && (
                    <div className="h-40 rounded-lg overflow-hidden mb-3 bg-gray-100">
                      <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm mb-3" style={{ color: colors.textLight }}>
                    {pkg.description}
                  </p>

                  {/* Prix */}
                  <div className="flex items-center gap-4 mb-3 p-3 rounded-lg" style={{ backgroundColor: `${colors.primary}08` }}>
                    <div>
                      <p className="text-xs" style={{ color: colors.textLight }}>Prix</p>
                      <p className="font-bold" style={{ color: colors.primary }}>{pkg.price}</p>
                    </div>
                    {pkg.priceDetails?.perPerson && (
                      <div>
                        <p className="text-xs" style={{ color: colors.textLight }}>Par personne</p>
                        <p className="font-semibold" style={{ color: colors.textDark }}>{pkg.priceDetails.perPerson}</p>
                      </div>
                    )}
                    {pkg.priceDetails?.minGuests && pkg.priceDetails?.maxGuests && (
                      <div>
                        <p className="text-xs" style={{ color: colors.textLight }}>Invités</p>
                        <p className="font-semibold" style={{ color: colors.textDark }}>
                          {pkg.priceDetails.minGuests} - {pkg.priceDetails.maxGuests}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Services inclus */}
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-2" style={{ color: colors.textDark }}>
                      Services inclus :
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.features.venue?.included && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                          <MapPin size={10} /> Salle
                        </span>
                      )}
                      {pkg.features.band?.included && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                          <Music size={10} /> Music
                        </span>
                      )}
                      {pkg.features.pastries?.included && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                          <Cake size={10} /> Pâtisserie
                        </span>
                      )}
                      {pkg.features.drinks?.included && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                          <Coffee size={10} /> Boissons
                        </span>
                      )}
                      {pkg.features.weddingPlanner?.included && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                          <Users size={10} /> Wedding Planner
                        </span>
                      )}
                      {pkg.features.photography?.included && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                          <Camera size={10} /> Photo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Elements inclus (3 premiers) */}
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1" style={{ color: colors.textDark }}>
                      Inclus :
                    </p>
                    <ul className="space-y-0.5">
                      {pkg.includedItems.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs" style={{ color: colors.textLight }}>
                          <CheckCircle size={10} className="mt-0.5 shrink-0" style={{ color: colors.primary }} />
                          <span>{item}</span>
                        </li>
                      ))}
                      {pkg.includedItems.length > 3 && (
                        <li className="text-xs" style={{ color: colors.primary }}>
                          + {pkg.includedItems.length - 3} autres prestations
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="flex-1 py-2 rounded-lg text-white text-sm flex items-center justify-center gap-1"
                      style={{ background: colors.primary }}
                    >
                      <Edit2 size={14} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id!)}
                      className="px-3 py-2 rounded-lg border text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Ajouter / Modifier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-medium" style={{ color: colors.textDark }}>
                {editingPackage ? "Modifier" : "Ajouter"} une formule de mariage
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom et Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                    Nom de la formule *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ borderColor: `${colors.primary}50` }}
                    placeholder="Ex: Pack Normal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                    Type de formule *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ borderColor: `${colors.primary}50` }}
                  >
                    {PACKAGE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  style={{ borderColor: `${colors.primary}50` }}
                  rows={2}
                  placeholder="Description de la formule..."
                />
              </div>

              {/* Prix */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                    Prix total *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ borderColor: `${colors.primary}50` }}
                    placeholder="Ex: 15 000 TND"
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  Image de la formule
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
                    {imagePreview ? "Changer l'image" : "Cliquez pour sélectionner une image"}
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

              {/* Services inclus */}
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: colors.textDark }}>
                  Services inclus dans la formule
                </h3>
                
                {/* Venue */}
                <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: `${colors.primary}30` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.features.venue?.included}
                      onChange={(e) => setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          venue: { ...formData.features.venue, included: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: colors.primary }}
                    />
                    <span className="text-sm font-medium" style={{ color: colors.textDark }}>
                      <MapPin size={16} className="inline mr-1" /> Salle / Espace
                    </span>
                  </div>
                  {formData.features.venue?.included && (
                    <div className="ml-7 space-y-2">
                      <input
                        type="text"
                        value={formData.features.venue?.description || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          features: {
                            ...formData.features,
                            venue: { ...formData.features.venue, description: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                        style={{ borderColor: `${colors.primary}50` }}
                        placeholder="Description de la salle/espace"
                      />
                      <div className="flex flex-wrap gap-2">
                        <p className="text-xs w-full" style={{ color: colors.textLight }}>
                          Types d&apos;espaces disponibles :
                        </p>
                        {VENUE_TYPES.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => toggleVenueType(type.value)}
                            className={`text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                              formData.features.venue?.types?.includes(type.value)
                                ? "text-white"
                                : ""
                            }`}
                            style={{
                              backgroundColor: formData.features.venue?.types?.includes(type.value)
                                ? colors.primary
                                : `${colors.textLight}10`,
                              color: formData.features.venue?.types?.includes(type.value)
                                ? "white"
                                : colors.textLight,
                            }}
                          >
                            <type.icon size={12} />
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Decoration */}
                <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: `${colors.primary}30` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.features.decoration?.included || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          decoration: { ...formData.features.decoration, included: e.target.checked, description: formData.features.decoration?.description || "" }
                        }
                      })}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: colors.primary }}
                    />
                    <span className="text-sm font-medium" style={{ color: colors.textDark }}>
                      <Flower2 size={16} className="inline mr-1" /> Décoration
                    </span>
                  </div>
                  {formData.features.decoration?.included && (
                    <div className="ml-7">
                      <input
                        type="text"
                        value={formData.features.decoration?.description || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          features: {
                            ...formData.features,
                            decoration: { ...formData.features.decoration, description: e.target.value }
                          }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                        style={{ borderColor: `${colors.primary}50` }}
                        placeholder="Description de la décoration"
                      />
                      
                    </div>
                  )}
                </div>
                {/* Drinks */}
                <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: `${colors.primary}30` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.features.drinks?.included}
                      onChange={(e) => setFormData({
                        ...formData,
                        features: {
                          ...formData.features,
                          drinks: { ...formData.features.drinks, included: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: colors.primary }}
                    />
                    <span className="text-sm font-medium" style={{ color: colors.textDark }}>
                      <Coffee size={16} className="inline mr-1" /> Boissons
                    </span>
                  </div>
                  {formData.features.drinks?.included && (
                    <div className="ml-7 space-y-2">
                      <input
                        type="text"
                        value={formData.features.drinks?.description || ""}
                        onChange={(e) => handleOptionChange("drinks", "description", e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none text-sm"
                        style={{ borderColor: `${colors.primary}50` }}
                        placeholder="Description des boissons"
                      />
                      <div>
                        <p className="text-xs" style={{ color: colors.textLight }}>Options disponibles :</p>
                        {((formData.features.drinks?.options as string[]) || []).map((option, idx) => (
                          <div key={idx} className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption("drinks", idx, e.target.value)}
                              className="flex-1 px-3 py-1 border rounded-lg focus:outline-none text-sm"
                              style={{ borderColor: `${colors.primary}50` }}
                              placeholder={`Option ${idx + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeOption("drinks", idx)}
                              className="p-1 hover:bg-red-50 rounded"
                            >
                              <X size={14} className="text-red-400" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption("drinks")}
                          className="mt-1 text-xs flex items-center gap-1 hover:opacity-80"
                          style={{ color: colors.primary }}
                        >
                          <Plus size={12} /> Ajouter une option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <hr style={{ borderColor: `${colors.textLight}20` }} />

              {/* Éléments inclus */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Nos Extras
                </label>
                <div className="space-y-2">
                  {formData.includedItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <CheckCircle size={16} style={{ color: colors.primary }} />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none text-sm"
                        style={{ borderColor: `${colors.primary}50` }}
                        placeholder="Ex: Salle de fête équipée"
                      />
                      {formData.includedItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <X size={14} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, includedItems: [...formData.includedItems, ""] })}
                  className="mt-2 text-sm flex items-center gap-1 hover:opacity-80"
                  style={{ color: colors.primary }}
                >
                  <Plus size={14} /> Ajouter un élément
                </button>
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
                      {editingPackage ? "Modification..." : "Création..."}
                    </>
                  ) : (
                    editingPackage ? "Mettre à jour la formule" : "Créer la formule"
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