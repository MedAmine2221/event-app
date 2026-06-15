"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageCircle, User, Calendar, ThumbsUp } from "lucide-react";
import { ReviewModal } from "./ReviewModal";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

interface ReviewsSectionProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    textDark: string;
    textLight: string;
  };
}

const initialReviews: Review[] = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    comment: "Une organisation exceptionnelle pour notre mariage ! Dar Bouraoui Events a dépassé toutes nos attentes. Tout était parfait, du début à la fin. Merci pour cette journée inoubliable !",
    date: "15 Mars 2024",
    likes: 24
  },
  {
    id: 2,
    name: "Ahmed K.",
    rating: 5,
    comment: "Professionnalisme et créativité au rendez-vous. Notre séminaire d'entreprise a été un franc succès grâce à leur équipe. Je recommande vivement !",
    date: "28 Février 2024",
    likes: 18
  },
  {
    id: 3,
    name: "Nadia B.",
    rating: 4,
    comment: "Très belle expérience avec Dar Bouraoui. La décoration était magnifique et l'équipe à l'écoute. Seul petit bémol sur les délais, mais globalement satisfaite.",
    date: "10 Janvier 2024",
    likes: 12
  },
  {
    id: 4,
    name: "Mohamed T.",
    rating: 5,
    comment: "La meilleure agence événementielle en Tunisie ! Ils ont organisé nos fiançailles et tout était parfait. Un grand merci à toute l'équipe !",
    date: "20 Décembre 2023",
    likes: 31
  }
];

export const ReviewsSection = ({ colors }: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedReviews, setLikedReviews] = useState<number[]>([]);

  const handleReviewSubmit = (newReview: { name: string; rating: number; comment: string }) => {
    const review: Review = {
      id: reviews.length + 1,
      name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      likes: 0
    };
    setReviews([review, ...reviews]);
  };

  const handleLike = (id: number) => {
    if (likedReviews.includes(id)) {
      setReviews(reviews.map(review =>
        review.id === id ? { ...review, likes: review.likes - 1 } : review
      ));
      setLikedReviews(likedReviews.filter(likeId => likeId !== id));
    } else {
      setReviews(reviews.map(review =>
        review.id === id ? { ...review, likes: review.likes + 1 } : review
      ));
      setLikedReviews([...likedReviews, id]);
    }
  };

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

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
                Basé sur {reviews.length} avis clients
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
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
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

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: `${colors.textLight}15` }}>
                  <button
                    onClick={() => handleLike(review.id)}
                    className="flex items-center gap-2 text-sm transition-colors hover:opacity-70"
                    style={{ color: likedReviews.includes(review.id) ? colors.primary : colors.textLight }}
                  >
                    <ThumbsUp size={16} />
                    <span>{review.likes}</span>
                  </button>
                  <div className="flex items-center gap-1 text-xs" style={{ color: colors.textLight }}>
                    <MessageCircle size={12} />
                    <span>Recommandé</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message si pas d'avis */}
          {reviews.length === 0 && (
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
        onReviewSubmit={handleReviewSubmit}
      />
    </>
  );
};