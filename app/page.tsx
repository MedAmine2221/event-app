/* eslint-disable @next/next/no-img-element */
"use client";

import { CheckCircle, Music, Utensils, Star, Crown, Gem } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { SectionWithAnimation } from "@/components/SectionWithAnimation";
import { motion } from "framer-motion";
import { ReviewsSection } from "@/components/ReviewsSection";
import { bands, colors, menuPacks, pastries, tableDrinks, tablePackages, tableSweets, teamMembers, venues } from "@/constants";


export default function Home() {
  return (
    <div
      className="font-['Playfair_Display','Times_New_Roman',Georgia,serif] min-h-screen"
      style={{ background: colors.background, color: colors.textDark }}
    >
      <Navbar colors={colors} />
      <Hero colors={colors} />

      {/* Section Présentation de l'agence */}
      <SectionWithAnimation className="py-20 px-10 max-w-350 mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
            QUI SOMMES-NOUS
          </span>
          <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
            Dar Bouraoui Events
          </h2>
          <div className="w-20 h-0.5 mx-auto mb-8" style={{ background: colors.primary }} />
          <p className="max-w-3xl mx-auto text-[15px] leading-relaxed" style={{ color: colors.textLight }}>
            Dar Bouraoui Events est une agence événementielle de premier plan en Tunisie, 
            spécialisée dans l&#39;organisation de mariages, fiançailles, séminaires et soirées privées. 
            Avec plus de 10 ans d&lsquo;expérience, nous transformons vos rêves en réalité, 
            en créant des moments uniques et inoubliables.
          </p>
        </div>
      </SectionWithAnimation>

      {/* Section Photos de l'équipe */}
      <SectionWithAnimation className="py-20 px-10">
        <div className="max-w-350 mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
              NOTRE ÉQUIPE
            </span>
            <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
              Des professionnels passionnés
            </h2>
            <p className="text-sm" style={{ color: colors.textLight }}>
              Une équipe dévouée à votre service pour faire de votre événement un succès
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="text-center group cursor-pointer"
              >
                <div className="rounded-full overflow-hidden w-48 h-48 mx-auto mb-4 ring-4 ring-white shadow-lg">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-medium mb-1">{member.name}</h3>
                <p className="text-sm" style={{ color: colors.primary }}>{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWithAnimation>

      {/* Section Salles de fête */}
      <SectionWithAnimation className="py-20 px-10 max-w-350 mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
            NOS ESPACES
          </span>
          <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
            Salles de fête disponibles
          </h2>
          <p className="text-sm max-w-2xl mx-auto" style={{ color: colors.textLight }}>
            Des lieux d&apos;exception pour tous vos événements
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {venues.map((venue, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg"
            >
              <div className="h-64 overflow-hidden">
                <img src={venue.image} alt={venue.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-medium mb-2">{venue.name}</h3>
                <p className="text-sm mb-3" style={{ color: colors.primary }}>Capacité: {venue.capacity}</p>
                <p className="text-sm mb-4" style={{ color: colors.textLight }}>{venue.price}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {venue.features.map((feature, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-full" style={{ background: `${colors.primary}10`, color: colors.textDark }}>
                      {feature}
                    </span>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="w-full py-2 rounded-full text-white text-sm"
                  style={{ background: colors.primary }}
                >
                  Réserver
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWithAnimation>

      {/* Section Bands */}
      <SectionWithAnimation className="py-20 px-10">
        <div className="max-w-350 mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
              ANIMATION MUSICALE
            </span>
            <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
              Bands & Artistes
            </h2>
            <Music size={32} className="mx-auto mb-4" style={{ color: colors.primary }} />
            <p className="text-sm max-w-2xl mx-auto" style={{ color: colors.textLight }}>
              Une sélection des meilleurs artistes pour animer votre soirée
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bands.map((band, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl overflow-hidden shadow-md"
              >
                <div>
                  <img src={band.image} alt={band.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">{band.name}</h3>
                  <p className="text-xs mb-2" style={{ color: colors.textLight }}>{band.genre}</p>
                  <p className="text-sm font-semibold" style={{ color: colors.primary }}>{band.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWithAnimation>
      {/* Section Pâtisserie Traditionnelle */}
      <SectionWithAnimation className="py-20 px-10">
        <div className="max-w-350 mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
              DOUCEURS TUNISIENNES
            </span>
            <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
              Nos Pâtisseries & Douceurs
            </h2>
            <div className="w-20 h-0.5 mx-auto mb-6" style={{ background: colors.primary }} />
            <p className="text-sm max-w-2xl mx-auto" style={{ color: colors.textLight }}>
              Un voyage gustatif à travers les saveurs authentiques de la pâtisserie tunisienne
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {pastries.map((pastry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg group"
              >
                <div className="relative">
                  <img 
                    src={pastry.image} 
                    alt={pastry.name}
                    className="w-60 h-60 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90" style={{ color: colors.primary }}>
                      {pastry.specialty}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold">{pastry.name}</h3>
                    <p className="text-sm font-bold" style={{ color: colors.primary }}>{pastry.price}</p>
                  </div>
                  <p className="text-sm mb-4" style={{ color: colors.textLight }}>
                    {pastry.description}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="w-full py-2 rounded-full border-2 text-sm font-medium transition-all"
                    style={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    Commander
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWithAnimation>
      {/* Section Boissons & Fruits secs pour tables */}
      <SectionWithAnimation className="py-20 px-10">
        <div className="max-w-350 mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
              SUR VOTRE TABLE
            </span>
            <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
              Boissons & Fruits secs
            </h2>
            <div className="w-20 h-0.5 mx-auto mb-6" style={{ background: colors.primary }} />
            <p className="text-sm max-w-2xl mx-auto" style={{ color: colors.textLight }}>
              Pour le confort de vos invités, nous mettons à disposition sur chaque table
            </p>
          </div>

          {/* Boissons */}
          <div className="mb-16">
            <h3 className="text-2xl font-medium mb-6 text-center" style={{ color: colors.textDark }}>
              Boissons
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tableDrinks.map((drink, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={drink.image} 
                      alt={drink.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90" style={{ color: colors.primary }}>
                        {drink.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{drink.name}</h4>
                      <span className="text-sm font-bold" style={{ color: colors.primary }}>{drink.price}</span>
                    </div>
                    <p className="text-xs" style={{ color: colors.textLight }}>{drink.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-2xl font-medium mb-6 text-center" style={{ color: colors.textDark }}>
              Fruits secs & Douceurs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tableSweets.map((sweet, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={sweet.image} 
                      alt={sweet.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/90" style={{ color: colors.primary }}>
                        {sweet.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{sweet.name}</h4>
                      <span className="text-sm font-bold" style={{ color: colors.primary }}>{sweet.price}</span>
                    </div>
                    <p className="text-xs" style={{ color: colors.textLight }}>{sweet.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Formules pour tables */}
          <div className="mt-12">
            <h3 className="text-2xl font-medium mb-6 text-center" style={{ color: colors.textDark }}>
              Formules spéciales tables
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tablePackages.map((pkg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className={`rounded-2xl overflow-hidden shadow-lg ${
                    idx === 1 ? 'border-2' : ''
                  }`}
                  style={{ 
                    background: 'white',
                    borderColor: idx === 1 ? colors.primary : 'transparent'
                  }}
                >
                  {idx === 1 && (
                    <div className="absolute top-0 right-0">
                      <div className="px-4 py-1 text-white text-xs font-semibold rounded-bl-lg" style={{ background: colors.primary }}>
                        POPULAIRE
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold mb-2">{pkg.name}</h4>
                      <p className="text-lg font-semibold" style={{ color: colors.primary }}>{pkg.price}</p>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {pkg.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: colors.primary }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="w-full py-2 rounded-full text-white text-sm font-medium transition-all"
                      style={{ background: colors.primary }}
                    >
                      Choisir cette formule
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionWithAnimation>
      <SectionWithAnimation className="py-20 px-10 max-w-350 mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
            NOS FORMULES
          </span>
          <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
            Packs Traiteur
          </h2>
          <Utensils size={32} className="mx-auto mb-4" style={{ color: colors.primary }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pack Normal */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="bg-white rounded-2xl overflow-hidden shadow-lg border-t-4"
            style={{ borderTopColor: colors.primary }}
          >
            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold mb-2">{menuPacks.normal.name}</h3>
                <p className="text-lg font-semibold" style={{ color: colors.primary }}>{menuPacks.normal.price}</p>
              </div>
              <ul className="space-y-3">
                {menuPacks.normal.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: colors.primary }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full mt-6 py-2 rounded-full border-2 text-sm font-medium transition-all"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                Choisir ce pack
              </motion.button>
            </div>
          </motion.div>

          {/* Pack Premium */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 relative"
            style={{ borderColor: colors.primary }}
          >
            <div className="absolute top-0 right-0">
              <div className="px-4 py-1 text-white text-xs font-semibold rounded-bl-lg" style={{ background: colors.primary }}>
                POPULAIRE
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <Star size={24} className="mx-auto mb-2" style={{ color: colors.primary }} />
                <h3 className="text-2xl font-bold mb-2">{menuPacks.premium.name}</h3>
                <p className="text-lg font-semibold" style={{ color: colors.primary }}>{menuPacks.premium.price}</p>
              </div>
              <ul className="space-y-3">
                {menuPacks.premium.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: colors.primary }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full mt-6 py-2 rounded-full text-white text-sm font-medium"
                style={{ background: colors.primary }}
              >
                Choisir ce pack
              </motion.button>
            </div>
          </motion.div>

          {/* Pack Gold */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="bg-linear-to-br from-amber-50 to-amber-100 rounded-2xl overflow-hidden shadow-lg relative"
          >
            <div className="absolute top-0 left-0 right-0">
              <div className="flex justify-center -mt-2">
                <Crown size={32} style={{ color: colors.primary }} />
              </div>
            </div>
            <div className="p-6 pt-8">
              <div className="text-center mb-4">
                <Gem size={24} className="mx-auto mb-2" style={{ color: colors.primary }} />
                <h3 className="text-2xl font-bold mb-2">{menuPacks.gold.name}</h3>
                <p className="text-lg font-semibold" style={{ color: colors.primary }}>{menuPacks.gold.price}</p>
              </div>
              <ul className="space-y-3">
                {menuPacks.gold.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: colors.primary }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full mt-6 py-2 rounded-full text-white text-sm font-medium"
                style={{ background: colors.primary }}
              >
                Choisir ce pack
              </motion.button>
            </div>
          </motion.div>
        </div>
      </SectionWithAnimation>

      {/* Section Call to Action */}
      <SectionWithAnimation className="py-20 px-10">
        <div className="max-w-250 mx-auto text-center">
          <h2 className="text-[clamp(32px,5vw,42px)] font-medium mb-4">
            {"Prêt à créer l'événement parfait ?"}
          </h2>
          <p className="text-lg mb-8" style={{ color: colors.textLight }}>
            {"Contactez-nous dès aujourd'hui pour une consultation personnalisée"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-3 rounded-full text-white text-lg font-medium shadow-lg"
            style={{ background: colors.primary }}
          >
            Demander un devis gratuit
          </motion.button>
        </div>
      </SectionWithAnimation>
      <ReviewsSection colors={colors} />

      <Footer colors={colors} />
    </div>
  );
}