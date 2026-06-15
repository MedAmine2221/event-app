/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import { SectionWithAnimation } from "./SectionWithAnimation";

interface CateringSectionProps {
  colors: {
    primary: string;
    secondary: string;
    textLight: string;
  };
}

const menuItems = [
  { name: "PULLED JACKFRUIT", price: "$50", ingredients: "summ seeds, paprika, tomato, jackfruit" },
  { name: "WEDDING WEALTH", price: "$68", ingredients: "spinach, tofu, nutmeg, cherries" },
  { name: "MACARONICS", price: "$23", ingredients: "almond, milk, sugar, vanilla" }
];

export const CateringSection = ({ colors }: CateringSectionProps) => {
  return (
    <SectionWithAnimation className="py-20 px-10 max-w-350 mx-auto">
      <div className="grid lg:grid-cols-2 gap-15 items-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl overflow-hidden"
          style={{ background: colors.secondary }}
        >
          <img
            src="https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=500&fit=crop"
            alt="Catering"
            className="w-full h-100 object-cover"
          />
        </motion.div>

        <div>
          <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
            ELLITE CATERING
          </span>
          <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-5 leading-[1.2]">
            WE PLAN YOUR DAY <br />
            TO PERFECTION
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: colors.textLight }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Cras aliquam mi id augue ultricies, in tempus elit tristique.
            Aliquam ultricies sem non.
          </p>

          <div className="mb-8">
            {menuItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex justify-between items-center py-3 border-b border-black/10"
              >
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-[11px]" style={{ color: colors.textLight }}>
                    {item.ingredients}
                  </div>
                </div>
                <div className="text-lg font-medium" style={{ color: colors.primary }}>
                  {item.price}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-none px-8 py-3 rounded-full text-white text-sm cursor-pointer"
            style={{ background: colors.primary }}
          >
            EXPLORE
          </motion.button>
        </div>
      </div>
    </SectionWithAnimation>
  );
};