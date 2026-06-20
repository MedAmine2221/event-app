/* eslint-disable react-hooks/immutability */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, X, ImageIcon, Cake } from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Pastry {
  id?: string;
  name: string;
  image: string;
  contact: string;
  socialMedia: string[];
  item: {
    pastryName: string,
    image: string
  }
}

const EMPTY_FORM: Omit<Pastry, "id"> = {
  name: "", image: "",  contact: "",
  socialMedia: [''],
  item: {
    pastryName: "",
    image: ""
  }

};

export const AdminPastry = ({ colors }: { colors: any }) => {
  const [pastries, setPastries] = useState<Pastry[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPastry, setEditingPastry] = useState<Pastry | null>(null);
  const [formError, setFormError] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<Pastry, "id">>(EMPTY_FORM);

  useEffect(() => { fetchPastries(); }, []);

  const fetchPastries = async () => {
    setFetchLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "pastries"));
      const data: Pastry[] = [];
      querySnapshot.forEach((d) => data.push({ id: d.id, ...d.data() } as Pastry));
      setPastries(data);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name) {
      setFormError("Tous les champs sont requis");
      return;
    }
    if (!formData.image) {
      setFormError("Une image est requise");
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingPastry?.id) {
        await updateDoc(doc(db, "pastries", editingPastry.id), formData);
        setPastries(prev => prev.map(p =>
          p.id === editingPastry.id ? { ...formData, id: editingPastry.id } : p
        ));
      } else {
        const docRef = await addDoc(collection(db, "pastries"), formData);
        setPastries(prev => [...prev, { ...formData, id: docRef.id }]);
      }
      closeModal();
    } catch (error: any) {
      setFormError(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette pâtisserie ?")) return;
    try {
      await deleteDoc(doc(db, "pastries", id));
      setPastries(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const openEditModal = (pastry: Pastry) => {
    setEditingPastry(pastry);
    setFormData({ name: pastry.name, specialty: pastry.specialty, price: pastry.price, image: pastry.image, description: pastry.description });
    setImagePreview(pastry.image);
    setFormError("");
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPastry(null);
    setFormData(EMPTY_FORM);
    setImagePreview("");
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPastry(null);
    setFormData(EMPTY_FORM);
    setImagePreview("");
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (fetchLoading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: colors.textDark }}>
            Gestion des Pâtisseries
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textLight }}>
            Gérez les pâtisseries partenaires
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: colors.primary, color: "white" }}
        >
          <Plus size={18} />
          Ajouter une pâtisserie
        </button>
      </div>

      {/* Grille ou état vide */}
      {pastries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <Cake size={36} style={{ color: colors.primary }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: colors.textDark }}>
            Aucune pâtisserie
          </h3>
          <p className="text-sm mb-6 max-w-xs" style={{ color: colors.textLight }}>
            Vous n&apos;avez pas encore ajouté de pâtisseries partenaires.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90 text-sm font-medium"
            style={{ backgroundColor: colors.primary, color: "white" }}
          >
            <Plus size={16} />
            Ajouter une pâtisserie
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastries.map((pastry, idx) => (
            <motion.div
              key={pastry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              <div className="h-48 overflow-hidden bg-gray-100">
                {pastry.image ? (
                  <img src={pastry.image} alt={pastry.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={40} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{pastry.name}</h3>
                <p className="text-xs mb-2" style={{ color: colors.textLight }}>{pastry.specialty}</p>
                <p className="text-sm mb-3" style={{ color: colors.textLight }}>{pastry.description}</p>
                <p className="text-sm font-semibold mb-3" style={{ color: colors.primary }}>{pastry.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(pastry)}
                    className="flex-1 py-2 rounded-lg text-white text-sm"
                    style={{ background: colors.primary }}
                  >
                    <Edit2 size={14} className="inline mr-1" /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(pastry.id!)}
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
            className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-medium" style={{ color: colors.textDark }}>
                {editingPastry ? "Modifier" : "Ajouter"} une pâtisserie
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: `${colors.primary}50` }}
                  placeholder="Ex: Masmoudi"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  Image *
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

              {/* Erreur */}
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
                      {editingPastry ? "Modification..." : "Création..."}
                    </>
                  ) : (
                    editingPastry ? "Mettre à jour" : "Ajouter la pâtisserie"
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