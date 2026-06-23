"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { addBandReview, addPastryReview } from "@/lib/engagement-service";

interface ItemReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "band" | "pastry";
  targetId: string;
  targetName: string;
  colors: {
    primary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
  onSubmitted?: () => void;
}

export const ItemReviewModal = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  colors,
  onSubmitted,
}: ItemReviewModalProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [name, setName] = useState(user?.displayName || "");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetAndClose = () => {
    setRating(0);
    setComment("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || rating === 0 || !comment) {
      setError("Merci de remplir votre nom, une note et un commentaire");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      if (targetType === "band") {
        await addBandReview(targetId, { bandId: targetId, name, rating, comment });
      } else {
        await addPastryReview(targetId, { pastryId: targetId, name, rating, comment });
      }
      onSubmitted?.();
      resetAndClose();
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue, veuillez réessayer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1100"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-1101"
          >
            <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: colors.background }}>
              <div className="relative p-6 border-b" style={{ borderColor: `${colors.textLight}20` }}>
                <button
                  onClick={resetAndClose}
                  className="absolute right-4 top-4 p-1 rounded-full transition-colors hover:bg-black/5"
                >
                  <X size={20} style={{ color: colors.textDark }} />
                </button>
                <h2 className="text-xl font-medium text-center" style={{ color: colors.textDark }}>
                  Donnez votre avis
                </h2>
                <p className="text-xs text-center mt-1" style={{ color: colors.textLight }}>
                  {targetName}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Votre nom
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-all disabled:opacity-60"
                    style={{ borderColor: `${colors.textLight}30`, background: colors.background, color: colors.textDark }}
                    placeholder="Votre nom complet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Votre note
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => !isSubmitting && setRating(star)}
                        onMouseEnter={() => !isSubmitting && setHoverRating(star)}
                        onMouseLeave={() => !isSubmitting && setHoverRating(0)}
                        className="transition-transform hover:scale-110 disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        <Star
                          size={32}
                          fill={(hoverRating || rating) >= star ? colors.primary : "none"}
                          style={{ color: (hoverRating || rating) >= star ? colors.primary : colors.textLight, transition: "all 0.2s" }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Votre commentaire
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-all resize-none disabled:opacity-60"
                    style={{ borderColor: `${colors.textLight}30`, background: colors.background, color: colors.textDark }}
                    placeholder="Partagez votre expérience..."
                  />
                </div>

                {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

                <motion.button
                  type="submit"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full py-3 rounded-full text-white font-medium transition-all shadow-lg disabled:opacity-50"
                  style={{ background: colors.primary }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Publier mon avis"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};