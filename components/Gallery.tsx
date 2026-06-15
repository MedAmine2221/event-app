/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";

interface GalleryProps {
  colors: {
    primary: string;
  };
}

const galleryImages = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1532712932887-1f7605f463cf?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop"
];

export const Gallery = ({ colors }: GalleryProps) => {
  return (
    <section className="py-20 px-10 max-w-350 mx-auto text-center">
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-xs tracking-[4px] uppercase"
        style={{ color: colors.primary }}
      >
        THE WEDDING PARTY
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-[clamp(32px,5vw,42px)] font-medium my-3 mb-10"
      >
        OUR GALLERY
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {galleryImages.map((img, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl overflow-hidden aspect-4/3 cursor-pointer"
          >
            <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-transparent border px-8 py-3 rounded-full text-sm cursor-pointer"
        style={{ borderColor: colors.primary, color: colors.primary }}
      >
        EXPLORE
      </motion.button>
    </section>
  );
};