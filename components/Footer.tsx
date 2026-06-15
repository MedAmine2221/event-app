"use client";
import { FiInstagram } from "react-icons/fi";
import { FaFacebook, FaTiktok } from "react-icons/fa";
import { motion } from "framer-motion";

interface FooterProps {
  colors: {
    primary: string;
    secondary: string;
    textDark: string;
  };
}

export const Footer = ({ colors }: FooterProps) => {
  const footerLinks = ["Home", "About", "Services", "Blog", "Contact Us"];

  return (
    <footer className="mt-10 py-15 px-10" style={{ background: colors.textDark, color: colors.secondary }}>
      <div className="max-w-350 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg mb-4">Dar Bouraoui CARTHAGE</h3>
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
            {footerLinks.map((item) => (
              <li key={item} className="mb-2">
                <a href="#" className="text-xs text-white/50 no-underline hover:text-white/80 transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h4 className="text-sm mb-4">NEWSLETTER</h4>
          <div className="flex gap-2.5">
            <input
              type="email"
              placeholder="enter your email address"
              className="px-3.5 py-2.5 rounded-full border-none flex-1 text-xs"
            />
            <motion.button
              className="border-none px-5 py-2.5 rounded-full text-white text-xs cursor-pointer"
              style={{ background: colors.primary }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              SUBSCRIBE
            </motion.button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-5 text-[11px] text-white/40"
      >
        <div>Copyright DotCreativeMarket</div>
        <div className="flex gap-5">
          <a href="#" className="text-inherit no-underline hover:text-white/60 transition-colors">
            Terms of Use
          </a>
          <a href="#" className="text-inherit no-underline hover:text-white/60 transition-colors">
            Privacy Policy
          </a>
        </div>
        <div className="flex gap-4">
          <motion.a whileHover={{ scale: 1.2, color: colors.primary }} href="https://www.instagram.com/dar.bouraoui.carthage/" target="_blank">
            <FiInstagram size={16} />
          </motion.a>
          <motion.a whileHover={{ scale: 1.2, color: colors.primary }} href="https://www.facebook.com/ESPACE.DAR.BOURAOUI" target="_blank">
            <FaFacebook size={16} />
          </motion.a>
          <motion.a whileHover={{ scale: 1.2, color: colors.primary }} href="https://www.tiktok.com/@darbouraouicarthage" target="_blank">
            <FaTiktok size={16} />
          </motion.a>
        </div>
      </motion.div>
    </footer>
  );
};