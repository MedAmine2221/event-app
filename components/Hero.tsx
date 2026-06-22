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
          LA VIE EST UN ÉVÉNEMENT
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[clamp(36px,6vw,56px)] font-medium my-5 leading-[1.2] tracking-[-0.5px]"
        >
          CRÉER LA PLUS BELLE JOURNÉE <br />
          DE TOUS LES TEMPS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[15px] leading-relaxed mb-8 max-w-112.5"
          style={{ color: colors.textLight }}
        >
          {"Faites de chaque célébration un moment inoubliable avec Carthage Events. Mariages, fiançailles, événements d'entreprise, soirées privées : nous transformons votre vision en une expérience unique, empreinte d'élégance, de créativité et de souvenirs mémorables. Confiez-nous la création d'un événement à votre image, qui surpassera vos attentes."}
        </motion.p>

      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full pb-[100%] rounded-full bg-cover bg-center"
        style={{
          backgroundImage: `url('/App-Logo.png')`
        }}
      />
    </section>
  );
};