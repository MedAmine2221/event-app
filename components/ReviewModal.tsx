"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors: {
    primary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
  onReviewSubmit: (review: { name: string; rating: number; comment: string }) => void;
}

export const ReviewModal = ({ isOpen, onClose, colors, onReviewSubmit }: ReviewModalProps) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && rating > 0 && comment) {
      onReviewSubmit({ name, rating, comment });
      setName("");
      setRating(0);
      setComment("");
      onClose();
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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1100"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-1101"
          >
            <div
              className="rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: colors.background }}
            >
              <div className="relative p-6 border-b" style={{ borderColor: `${colors.textLight}20` }}>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-1 rounded-full transition-colors hover:bg-black/5"
                >
                  <X size={20} style={{ color: colors.textDark }} />
                </button>
                <h2 className="text-2xl font-medium text-center" style={{ color: colors.textDark }}>
                  Donnez votre avis
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Votre nom
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-all"
                    style={{
                      borderColor: `${colors.textLight}30`,
                      background: colors.background,
                      color: colors.textDark
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = `${colors.textLight}30`}
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
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          fill={(hoverRating || rating) >= star ? colors.primary : "none"}
                          style={{
                            color: (hoverRating || rating) >= star ? colors.primary : colors.textLight,
                            transition: "all 0.2s"
                          }}
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
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none transition-all resize-none"
                    style={{
                      borderColor: `${colors.textLight}30`,
                      background: colors.background,
                      color: colors.textDark
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = colors.primary}
                    onBlur={(e) => e.currentTarget.style.borderColor = `${colors.textLight}30`}
                    placeholder="Partagez votre expérience avec nous..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-full text-white font-medium transition-all shadow-lg"
                  style={{ background: colors.primary }}
                >
                  Publier mon avis
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};