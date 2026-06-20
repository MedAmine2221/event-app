/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
// components/admin/AdminGallery.tsx
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Plus, Edit2, Trash2, X, ImageIcon, 
  MoveUp, MoveDown, Sparkles
} from "lucide-react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GalleryImage {
  id?: string;
  title: string;
  image: string;
  category: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

const EMPTY_FORM: Omit<GalleryImage, "id"> = {
  title: "",
  image: "",
  category: "mariage",
  featured: false,
  order: 0,
  createdAt: new Date().toISOString(),
};

export const AdminGallery = ({ colors }: { colors: any }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formError, setFormError] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Omit<GalleryImage, "id">>(EMPTY_FORM);

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    setFetchLoading(true);
    try {
      const galleryRef = collection(db, "gallery");
      const q = query(galleryRef, orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      const data: GalleryImage[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as GalleryImage);
      });
      setImages(data);
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

    if (!formData.title || !formData.image) {
      setFormError("Le titre et l'image sont requis");
      return;
    }

    setSubmitLoading(true);
    const dataToSave = {
      ...formData,
      createdAt: new Date().toISOString(),
      order: editingImage ? formData.order : Date.now(),
    };

    try {
      if (editingImage?.id) {
        await updateDoc(doc(db, "gallery", editingImage.id), dataToSave);
        setImages(prev => prev.map(img =>
          img.id === editingImage.id ? { ...dataToSave, id: editingImage.id } : img
        ));
      } else {
        const docRef = await addDoc(collection(db, "gallery"), dataToSave);
        setImages(prev => [...prev, { ...dataToSave, id: docRef.id }]);
      }
      closeModal();
    } catch (error: any) {
      setFormError(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return;
    try {
      await deleteDoc(doc(db, "gallery", id));
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const moveImage = async (id: string, direction: "up" | "down") => {
    const index = images.findIndex(img => img.id === id);
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === images.length - 1) return;

    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

    // Mettre à jour les ordres
    try {
      for (let i = 0; i < newImages.length; i++) {
        await updateDoc(doc(db, "gallery", newImages[i].id!), { order: i });
      }
      setImages(newImages);
    } catch (error) {
      console.error("Erreur lors du déplacement:", error);
    }
  };

  const openEditModal = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      image: image.image,
      category: image.category,
      featured: image.featured,
      order: image.order,
      createdAt: image.createdAt,
    });
    setImagePreview(image.image);
    setFormError("");
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingImage(null);
    setFormData({ ...EMPTY_FORM });
    setImagePreview("");
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingImage(null);
    setFormData({ ...EMPTY_FORM });
    setImagePreview("");
    setFormError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (fetchLoading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-medium" style={{ color: colors.textDark }}>
            Gestion de la Galerie
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textLight }}>
            Gérez les photos de vos événements
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: colors.primary, color: "white" }}
        >
          <Plus size={18} />
          Ajouter une photo
        </button>
      </div>

      {/* Grille */}
      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <ImageIcon size={36} style={{ color: colors.primary }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: colors.textDark }}>
            Aucune photo
          </h3>
          <p className="text-sm mb-6 max-w-xs" style={{ color: colors.textLight }}>
            Vous n&apos;avez pas encore ajouté de photos à la galerie.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:opacity-90 text-sm font-medium"
            style={{ backgroundColor: colors.primary, color: "white" }}
          >
            <Plus size={16} />
            Ajouter une photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, idx) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm border-2 hover:shadow-lg transition-all"
              style={{ borderColor: image.featured ? colors.primary : "transparent" }}
            >
              {/* Badge Featured */}
              {image.featured && (
                <div
                  className="text-center py-1 text-xs font-medium text-white flex items-center justify-center gap-1"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Sparkles size={12} />
                  À la une
                </div>
              )}

              {/* Image */}
              <div className="h-48 overflow-hidden bg-gray-100 relative">
                {image.image ? (
                  <img src={image.image} alt={image.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={40} className="text-gray-300" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                <p className="text-xs mb-3" style={{ color: colors.textLight }}>
                  Ordre: {image.order}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => moveImage(image.id!, "up")}
                    className="p-2 rounded-lg border hover:bg-gray-50"
                    disabled={idx === 0}
                  >
                    <MoveUp size={14} style={{ color: idx === 0 ? colors.textLight : colors.textDark }} />
                  </button>
                  <button
                    onClick={() => moveImage(image.id!, "down")}
                    className="p-2 rounded-lg border hover:bg-gray-50"
                    disabled={idx === images.length - 1}
                  >
                    <MoveDown size={14} style={{ color: idx === images.length - 1 ? colors.textLight : colors.textDark }} />
                  </button>
                  <button
                    onClick={() => openEditModal(image)}
                    className="flex-1 py-2 rounded-lg text-white text-sm flex items-center justify-center gap-1"
                    style={{ background: colors.primary }}
                  >
                    <Edit2 size={14} /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(image.id!)}
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
                {editingImage ? "Modifier" : "Ajouter"} une photo
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: colors.textDark }}>
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  style={{ borderColor: `${colors.primary}50` }}
                  placeholder="Ex: Mariage de Sara & Ahmed"
                />
              </div>

              {/* Featured */}
              <div
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all"
                style={{
                  borderColor: formData.featured ? colors.primary : `${colors.primary}30`,
                  backgroundColor: formData.featured ? `${colors.primary}08` : "transparent",
                }}
                onClick={() => setFormData({ ...formData, featured: !formData.featured })}
              >
                <div
                  className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: colors.primary,
                    backgroundColor: formData.featured ? colors.primary : "transparent"
                  }}
                >
                  {formData.featured && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-2" style={{ color: colors.textDark }}>
                    <Sparkles size={16} style={{ color: colors.primary }} />
                    Photo à la une
                  </p>
                  <p className="text-xs" style={{ color: colors.textLight }}>
                    Met cette photo en avant dans la galerie
                  </p>
                </div>
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
                      {editingImage ? "Modification..." : "Création..."}
                    </>
                  ) : (
                    editingImage ? "Mettre à jour" : "Ajouter la photo"
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