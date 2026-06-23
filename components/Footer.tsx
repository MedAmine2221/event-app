"use client";
import { FiInstagram, FiLinkedin } from "react-icons/fi";
import { FaFacebook } from "react-icons/fa";
import { motion } from "framer-motion";
import { navLinks } from "@/constants";

interface FooterProps {
  colors: {
    primary: string;
    secondary: string;
    textDark: string;
  };
}

export const Footer = ({ colors }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-10 pt-16 pb-8 px-10" style={{ background: colors.textDark, color: colors.secondary }}>
      <div className="max-w-350 mx-auto">
        {/* Colonnes principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-12 border-b border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-xl tracking-[4px] font-medium block mb-2" style={{ color: colors.primary }}>
              CARTHAGE
            </span>
            <span className="text-xs tracking-[2px] block mb-4 text-white/40">EVENTS</span>
            <p className="text-xs text-white/50 leading-relaxed max-w-xs">
              Créer des moments inoubliables pour votre journée spéciale.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm tracking-[2px] mb-5 text-white/80">SITEMAP</h4>
            <ul className="list-none p-0 space-y-3">
              {navLinks
                .filter((link) => link.name !== "Admin")
                .map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.link}
                      className="text-xs text-white/50 no-underline hover:text-white/90 transition-colors capitalize"
                    >
                      {link.name.toLowerCase()}
                    </a>
                  </li>
                ))}
            </ul>
          </motion.div>
        </div>

        {/* Crédits */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="py-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 border-b border-white/10"
        >
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-white/50">
              Développé par{" "}
              <a
                href="https://mohamed-amine-laz.vercel.app/fr"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline hover:opacity-80 transition-opacity font-medium"
                style={{ color: colors.primary }}
              >
                Mohamed Amine
              </a>
            </p>
            <div className="flex gap-4">
              <motion.a
                whileHover={{ scale: 1.2, color: colors.primary }}
                href="https://www.instagram.com/mouhamedaminelz/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Mohamed Amine"
                className="text-white/50"
              >
                <FiInstagram size={16} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, color: colors.primary }}
                href="https://www.facebook.com/mouhamed.amine.lazreg/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Mohamed Amine"
                className="text-white/50"
              >
                <FaFacebook size={16} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, color: colors.primary }}
                href="https://www.linkedin.com/in/mohamed-amine-lazreg-831b1817a/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn de Mohamed Amine"
                className="text-white/50"
              >
                <FiLinkedin size={16} />
              </motion.a>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-white/10" />

          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs text-white/50 max-w-xs">
              Avec la collaboration de{" "}
              <span className="font-medium" style={{ color: colors.primary }}>
                Mariem Bouagina
              </span>
            </p>
            <p className="text-[11px] text-white/30">
              {"Pour la logique des événements en Tunisie, les retours d'avis sur l'application, son design et la cohérence de sa logique métier."}</p>
          </div>
        </motion.div> */}

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="pt-6 text-center text-[11px] text-white/30"
        >
          © {currentYear} Carthage Events — Tous droits réservés
        </motion.div>
      </div>
    </footer>
  );
};