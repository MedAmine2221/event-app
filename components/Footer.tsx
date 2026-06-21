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
  return (
    <footer className="mt-10 py-15 px-10" style={{ background: colors.textDark, color: colors.secondary }}>
      <div className="max-w-350 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg mb-4"> </h3>
          <p className="text-xs text-white/50 leading-relaxed">
            Creating unforgettable moments for your special day.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <h4 className="text-sm mb-4">SITEMAP</h4>
          <ul className="list-none p-0">
            {navLinks
              .filter((link) => link.name !== "Admin")
              .map((link) => (
                <li key={link.name} className="mb-2">
                  <a
                    href={link.link}
                    className="text-xs text-white/50 no-underline hover:text-white/80 transition-colors capitalize"
                  >
                    {link.name.toLowerCase()}
                  </a>
                </li>
              ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        viewport={{ once: true }}
        className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center gap-4 text-[11px] text-white/40"
      >
        <div className="flex flex-col items-center gap-2">
          <p>
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
            >
              <FiInstagram size={16} />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2, color: colors.primary }}
              href="https://www.facebook.com/mouhamed.amine.lazreg/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de Mohamed Amine"
            >
              <FaFacebook size={16} />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2, color: colors.primary }}
              href="https://www.linkedin.com/in/mohamed-amine-lazreg-831b1817a/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn de Mohamed Amine"
            >
              <FiLinkedin size={16} />
            </motion.a>
          </div>
        </div>

        <p className="text-center">
          Avec la collaboration de <span className="font-medium" style={{ color: colors.primary }}>Mariem Bouagina</span> pour la logique des événements en Tunisie
        </p>
      </motion.div>
            <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-5 text-[11px] text-white/40"
      >
        <div>Copyright DotCreativeMarket</div>
      </motion.div>
    </footer>
  );
};