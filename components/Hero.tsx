"use client";

import { motion } from "framer-motion";

interface HeroProps {
  colors: {
    primary: string;
    secondary: string;
    textDark: string;
    textLight: string;
  };
}

export const Hero = ({ colors }: HeroProps) => {
  return (
    <section className="pt-40 pb-25 px-10 max-w-350 mx-auto grid lg:grid-cols-2 gap-15 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs tracking-[4px] uppercase"
          style={{ color: colors.primary }}
        >
          LIFE IS AN EVENT
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[clamp(36px,6vw,56px)] font-medium my-5 leading-[1.2] tracking-[-0.5px]"
        >
          CREATING THE <br />
          BEST DAY EVER
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[15px] leading-relaxed mb-8 max-w-112.5"
          style={{ color: colors.textLight }}
        >
          Make every celebration unforgettable with Carthage Events. From weddings and engagements to corporate events and private parties, we transform your vision into a unique experience filled with elegance, creativity, and memorable moments. Let us create an event that reflects your style and exceeds your expectations.
        </motion.p>

      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full pb-[100%] rounded-full bg-cover bg-center"
        style={{
          backgroundImage: `url('/logo-dar-bouraoui.png')`
        }}
      />
    </section>
  );
};