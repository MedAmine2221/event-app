"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageCircle, User, Calendar } from "lucide-react";
import { ReviewModal } from "./ReviewModal";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchReviews, subscribeToReviews } from "@/store/reviewsSlice";

interface ReviewsSectionProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
}

export const ReviewsSection = ({ colors }: ReviewsSectionProps) => {
  const dispatch = useAppDispatch();
  const { reviews, loading, averageRating, totalReviews } = useAppSelector(
    (state) => state.reviews
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les avis et s'abonner aux mises à jour en temps réel
  useEffect(() => {
    // Chargement initial
    dispatch(fetchReviews());
    
    // Option 1: Mise à jour en temps réel (recommended)
    const unsubscribe = dispatch(subscribeToReviews());
    
    // Nettoyer l'abonnement
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [dispatch]);

  // Affichage du loader
  if (loading && reviews.length === 0) {
    return (
      <section className="py-20 px-10" style={{ background: colors.secondary }}>
        <div className="max-w-350 mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" 
               style={{ borderColor: `${colors.primary} transparent transparent transparent` }} />
          <p className="mt-4" style={{ color: colors.textLight }}>Chargement des avis...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 px-10" style={{ background: colors.secondary }}>
        <div className="max-w-350 mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
              TÉMOIGNAGES
            </span>
            <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
              Ce que nos clients disent
            </h2>
            <div className="w-20 h-0.5 mx-auto mb-6" style={{ background: colors.primary }} />
            
            {/* Statistiques des avis */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    fill={star <= Math.round(averageRating) ? colors.primary : "none"}
                    style={{ color: colors.primary }}
                  />
                ))}
              </div>
              <p className="text-lg font-semibold" style={{ color: colors.textDark }}>
                {averageRating.toFixed(1)} / 5
              </p>
              <p className="text-sm" style={{ color: colors.textLight }}>
                Basé sur {totalReviews} avis clients
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 rounded-full text-white font-medium shadow-lg"
              style={{ background: colors.primary }}
            >
              ✍️ Donner mon avis
            </motion.button>
          </div>

          {/* Liste des avis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {reviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${colors.primary}15` }}
                    >
                      <User size={24} style={{ color: colors.primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: colors.textDark }}>
                        {review.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              fill={star <= review.rating ? colors.primary : "none"}
                              style={{ color: colors.primary }}
                            />
                          ))}
                        </div>
                        <span className="text-xs flex items-center gap-1" style={{ color: colors.textLight }}>
                          <Calendar size={10} />
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-4" style={{ color: colors.textLight }}>
                  {review.comment}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Message si pas d'avis */}
          {reviews.length === 0 && !loading && (
            <div className="text-center py-12">
              <MessageCircle size={48} className="mx-auto mb-4" style={{ color: colors.textLight }} />
              <p style={{ color: colors.textLight }}>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
            </div>
          )}
        </div>
      </section>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        colors={colors}
      />
    </>
  );
};