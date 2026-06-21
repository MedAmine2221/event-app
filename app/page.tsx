/* eslint-disable @next/next/no-img-element */
"use client";

import { CheckCircle, Music, Star, Crown, Gem, Loader2, Sparkles, Heart, ImageIcon } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { SectionWithAnimation } from "@/components/SectionWithAnimation";
import { motion } from "framer-motion";
import { ReviewsSection } from "@/components/ReviewsSection";
import { VenueAvailabilityFilter, VenueFilterValue } from "@/components/VenueAvailabilityFilter";
import { colors } from "@/constants";
import { extractPriceNumber } from "@/lib/price-utils";
import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ReservationPack, PackId, getSeasonLabel } from "@/types/pack";
import { getReservationPacks } from "@/lib/pack-service";
import { PackReservationModal } from "@/components/PackReservationModal";
import { getSeason, getDisplayPrice, getDisplayPriceNumber } from "@/lib/seasonal-price-utils";
import { VenueBookingModal } from "@/components/VenueBookingModal";

type UnavailablePeriod = "morning" | "evening" | "full";

interface UnavailableDate {
  date: string; // YYYY-MM-DD
  period: UnavailablePeriod;
}

// Interfaces pour les données Firebase
interface Venue {
  id: string;
  name: string;
  description: string;
  image: string;
  capacity: string;
  tables: number;
  chairs: number;
  type: string;
  price: string;
  surface?: string;
  isIndoor: boolean;
  featured: boolean;
  unavailableDates?: UnavailableDate[];
}

interface Band {
  id?: string;
  name: string;
  genre: string;
  image: string;
  contact: string;
  price?: string;
  description?: string;
  socialMedia: string[];
}

interface Pastry {
  id: string;
  name: string;
  specialty: string;
  price: string;
  image: string;
  description: string;
}

interface Drink {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
}

interface Sweet {
  id: string;
  name: string;
  type: string;
  price: string;
  image: string;
  description: string;
}

interface TablePackage {
  id: string;
  name: string;
  price: string;
  items: string[];
  featured?: boolean;
}

interface WeddingPackage {
  id: string;
  name: string;
  type: "normal" | "pro" | "gold" | "premium";
  description: string;
  price: string;
  priceDetails?: {
    perPerson?: string;
    total?: string;
    minGuests?: number;
    maxGuests?: number;
  };
  features: {
    venue: { included: boolean; description: string };
    band: { included: boolean; description: string };
    pastries: { included: boolean; description: string };
    drinks: { included: boolean; description: string };
    sweets: { included: boolean; description: string };
    decoration?: { included: boolean; description: string };
    weddingPlanner?: { included: boolean; description: string };
    animation?: { included: boolean; description: string };
    photography?: { included: boolean; description: string };
  };
  includedItems: string[];
  isPopular?: boolean;
  image?: string;
}

interface GalleryImage {
  id: string;
  title: string;
  image: string;
  category: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [pastries, setPastries] = useState<Pastry[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [tablePackages, setTablePackages] = useState<TablePackage[]>([]);
  const [weddingPackages, setWeddingPackages] = useState<WeddingPackage[]>([]);
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState<Venue | null>(null);
const [isVenueBookingModalOpen, setIsVenueBookingModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
const [reservationPacks, setReservationPacks] = useState<ReservationPack[]>([]);
const [isPackModalOpen, setIsPackModalOpen] = useState(false);
const [selectedPackForModal, setSelectedPackForModal] = useState<PackId | undefined>(undefined);
const currentSeason = getSeason(new Date());

const [filterValue, setFilterValue] = useState<VenueFilterValue>({
    date: "",
    period: null,
    maxBudget: null,
    minGuests: null,  
    maxGuests: null,  
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [availableVenueIds, setAvailableVenueIds] = useState<Set<string> | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch venues
        const venuesSnapshot = await getDocs(collection(db, "venues"));
        const venuesData: Venue[] = [];
        venuesSnapshot.forEach((doc) => {
          venuesData.push({ id: doc.id, ...doc.data() } as Venue);
        });
        setVenues(venuesData);

        // Fetch bands
        const bandsSnapshot = await getDocs(collection(db, "bands"));
        const bandsData: Band[] = [];
        bandsSnapshot.forEach((doc) => {
          bandsData.push({ id: doc.id, ...doc.data() } as Band);
        });
        setBands(bandsData);

        // Fetch pastries
        const pastriesSnapshot = await getDocs(collection(db, "pastries"));
        const pastriesData: Pastry[] = [];
        pastriesSnapshot.forEach((doc) => {
          pastriesData.push({ id: doc.id, ...doc.data() } as Pastry);
        });
        setPastries(pastriesData);

        // Fetch drinks
        const drinksSnapshot = await getDocs(collection(db, "drinks"));
        const drinksData: Drink[] = [];
        drinksSnapshot.forEach((doc) => {
          drinksData.push({ id: doc.id, ...doc.data() } as Drink);
        });
        setDrinks(drinksData);

        // Fetch sweets
        const sweetsSnapshot = await getDocs(collection(db, "sweets"));
        const sweetsData: Sweet[] = [];
        sweetsSnapshot.forEach((doc) => {
          sweetsData.push({ id: doc.id, ...doc.data() } as Sweet);
        });
        setSweets(sweetsData);

        // Fetch table packages (formules)
        const formulesSnapshot = await getDocs(collection(db, "formules"));
        const formulesData: TablePackage[] = [];
        formulesSnapshot.forEach((doc) => {
          formulesData.push({ id: doc.id, ...doc.data() } as TablePackage);
        });
        setTablePackages(formulesData);

        // Fetch wedding packages
        const weddingPackagesSnapshot = await getDocs(collection(db, "weddingPackages"));
        const weddingPackagesData: WeddingPackage[] = [];
        weddingPackagesSnapshot.forEach((doc) => {
          weddingPackagesData.push({ id: doc.id, ...doc.data() } as WeddingPackage);
        });
        setWeddingPackages(weddingPackagesData);

        // Fetch gallery images
        const galleryRef = collection(db, "gallery");
        const q = query(galleryRef, orderBy("order", "asc"));
        const gallerySnapshot = await getDocs(q);
        const galleryData: GalleryImage[] = [];
        gallerySnapshot.forEach((doc) => {
          galleryData.push({ id: doc.id, ...doc.data() } as GalleryImage);
        });
        setGalleryImages(galleryData);
const packs = await getReservationPacks();
setReservationPacks(packs);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Recherche des salles disponibles pour la date/créneau choisis.
  // Une salle est indisponible si elle a une entrée "unavailableDates" correspondant
  // à la date sélectionnée avec period = "full", ou period = créneau choisi.
  const handleSearchAvailability = async () => {
    if (!filterValue.date || !filterValue.period) return;

    setFilterLoading(true);
    try {
      const available = new Set(
        venues
          .filter((v) => {
            const blocked = (v.unavailableDates || []).some(
              (u) =>
                u.date === filterValue.date &&
                (u.period === "full" || u.period === filterValue.period)
            );
            return !blocked;
          })
          .map((v) => v.id)
      );

      setAvailableVenueIds(available);
      setIsFiltering(true);
    } catch (error) {
      console.error("Erreur lors de la vérification de disponibilité:", error);
    } finally {
      setFilterLoading(false);
    }
  };

 const handleResetFilter = () => {
  setFilterValue({ 
    date: "", 
    period: null, 
    maxBudget: null,
    minGuests: null,
    maxGuests: null,
  });
  setIsFiltering(false);
  setAvailableVenueIds(null);
};

const filteredVenues = useMemo(() => {
  if (!isFiltering) return venues;

  return venues.filter((venue) => {
    // Filtre de disponibilité
    const isAvailable = availableVenueIds ? availableVenueIds.has(venue.id) : true;
    if (!isAvailable) return false;

    // Filtre budget
    if (filterValue.maxBudget !== null) {
      const venuePrice = getDisplayPriceNumber(venue, currentSeason) || extractPriceNumber(venue.price);
      if (venuePrice !== null && venuePrice > filterValue.maxBudget) return false;
    }

    // Filtre nombre d'invités
    // Extraction du nombre d'invités depuis la capacité
    const capacityMatch = venue.capacity.match(/(\d+)/);
    if (capacityMatch) {
      const venueCapacity = parseInt(capacityMatch[1]);
      
      if (filterValue.minGuests !== null && venueCapacity < filterValue.minGuests) {
        return false;
      }
      if (filterValue.maxGuests !== null && venueCapacity > filterValue.maxGuests) {
        return false;
      }
    }

    return true;
  });
}, [venues, isFiltering, availableVenueIds, filterValue.maxBudget, filterValue.minGuests, filterValue.maxGuests]);

  // Fonction pour obtenir l'icône du type de package
  const getPackageIcon = (type: string) => {
    switch(type) {
      case "normal": return <Heart size={24} />;
      case "pro": return <Star size={24} />;
      case "gold": return <Crown size={24} />;
      case "premium": return <Gem size={24} />;
      default: return <Heart size={24} />;
    }
  };

  // Fonction pour obtenir la couleur du type de package
  const getPackageColor = (type: string) => {
    switch(type) {
      case "normal": return "#4CAF50";
      case "pro": return "#2196F3";
      case "gold": return "#FFD700";
      case "premium": return "#9C27B0";
      default: return colors.primary;
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: colors.background }}
      >
        <Loader2 size={48} className="animate-spin" style={{ color: colors.primary }} />
        <p className="mt-4 text-sm" style={{ color: colors.textLight }}>Chargement des données...</p>
      </div>
    );
  }

  // Séparer les images mises en avant et les autres
  const featuredImages = galleryImages.filter(img => img.featured);
  const regularImages = galleryImages.filter(img => !img.featured);

  return (
    <div
      className="font-['Playfair_Display','Times_New_Roman',Georgia,serif] min-h-screen"
      style={{ background: colors.background, color: colors.textDark }}
    >
      <Navbar colors={colors} />
      {/* Hero Section - HOME */}
      <section id="home">
        <Hero colors={colors} />
      <VenueAvailabilityFilter
        colors={colors}
        value={filterValue}
        onChange={setFilterValue}
        onSearch={handleSearchAvailability}
        onReset={handleResetFilter}
        isFiltering={isFiltering}
        resultsCount={filteredVenues.length}
        loading={filterLoading}
      />
      </section>

      {/* Section Présentation de l'agence - ABOUT */}
      <section id="about">
        <SectionWithAnimation className="py-20 px-10 max-w-350 mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
              QUI SOMMES-NOUS
            </span>
            <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
              Carthage Events
            </h2>
            <div className="w-20 h-0.5 mx-auto mb-8" style={{ background: colors.primary }} />
            <p className="max-w-3xl mx-auto text-[15px] leading-relaxed" style={{ color: colors.textLight }}>
              Carthage Events est une agence événementielle de premier plan en Tunisie, 
              spécialisée dans l&apos;organisation de mariages, fiançailles, séminaires et soirées privées. 
              Avec plus de 10 ans d&apos;expérience, nous transformons vos rêves en réalité, 
              en créant des moments uniques et inoubliables.
            </p>
          </div>
        </SectionWithAnimation>
      </section>

      {/* Section Galerie - GALLERY */}
      <section id="gallery">
        {galleryImages.length > 0 && (
          <SectionWithAnimation className="py-20 px-10 max-w-350 mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
                NOS RÉALISATIONS
              </span>
              <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
                Galerie d&apos;Événements
              </h2>
              <div className="w-20 h-0.5 mx-auto mb-4" style={{ background: colors.primary }} />
              <p className="text-sm max-w-2xl mx-auto" style={{ color: colors.textLight }}>
                Découvrez nos plus belles créations en images
              </p>
            </div>

            {/* Images à la une (en grand) */}
            {featuredImages.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2" style={{ color: colors.textDark }}>
                  <Sparkles size={18} style={{ color: colors.primary }} />
                  À la une
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredImages.map((img, idx) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="relative rounded-2xl overflow-hidden group"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        <img
                          src={img.image}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <p className="text-white font-medium text-sm">{img.title}</p>
                        <p className="text-white/70 text-xs">{img.category}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Grille d'images */}
            {regularImages.length > 0 && (
              <div>
                {featuredImages.length > 0 && (
                  <h3 className="text-lg font-medium mb-4" style={{ color: colors.textDark }}>
                    Nos événements
                  </h3>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {regularImages.map((img, idx) => (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      viewport={{ once: true }}
                      className="relative rounded-xl overflow-hidden group cursor-pointer"
                    >
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={img.image}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                        <div className="p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 w-full">
                          <p className="text-white text-xs font-medium truncate">{img.title}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </SectionWithAnimation>
        )}
      </section>

      {/* Section Services - SERVICES */}
      <section id="services">
        {/* Salles de fête */}
        <SectionWithAnimation className="py-20 px-10 max-w-350 mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
              NOS ESPACES
            </span>
            <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">
              Salles de fête disponibles
            </h2>
            <p className="text-sm max-w-2xl mx-auto" style={{ color: colors.textLight }}>
              {isFiltering
                ? "Résultats filtrés selon votre date, créneau et budget"
                : "Des lieux d'exception pour tous vos événements"}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredVenues.map((venue, idx) => {
            const displayPrice = getDisplayPrice(venue, currentSeason);

            return (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg"
              >
                <div className="h-64 overflow-hidden relative">
                  <img src={venue.image} alt={venue.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  {isFiltering && (
                    <span
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-medium text-white flex items-center gap-1"
                      style={{ background: "#4CAF50" }}
                    >
                      <CheckCircle size={12} />
                      Disponible
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-medium mb-2">{venue.name}</h3>
                  <p className="text-sm mb-1" style={{ color: colors.primary }}>Capacité: {venue.capacity}</p>
                  <p className="text-sm mb-1" style={{ color: colors.textLight }}>Tables: {venue.tables}</p>
                  {venue.surface && <p className="text-sm mb-2" style={{ color: colors.textLight }}>Surface: {venue.surface}</p>}
                  <p className="text-sm mb-4" style={{ color: colors.primary }}>
                    Tarif: {getDisplayPrice(venue, currentSeason)} DT
                  </p>
                  <motion.button
                    onClick={() => {
    setSelectedVenueForBooking(venue);
    setIsVenueBookingModalOpen(true);
  }}
                    whileHover={{ scale: 1.05 }}
                    className="w-full py-2 rounded-full text-white text-sm"
                    style={{ background: colors.primary }}
                  >
                    Réserver
                  </motion.button>
                </div>
              </motion.div>
            )})}
          </div>
          {filteredVenues.length === 0 && isFiltering && (
            <div className="text-center py-10">
              <p className="text-sm mb-2" style={{ color: colors.textDark }}>
                Aucune salle disponible pour ces critères.
              </p>
              <p className="text-xs" style={{ color: colors.textLight }}>
                Essayez une autre date, un autre créneau ou augmentez votre budget.
              </p>
            </div>
          )}
          {venues.length === 0 && (
            <p className="text-center text-sm" style={{ color: colors.textLight }}>Aucune salle disponible pour le moment.</p>
          )}
        </SectionWithAnimation>

        {/* Bands */}
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
                  key={band.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md"
                >
                  <div className="h-48 overflow-hidden">
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
            {bands.length === 0 && (
              <p className="text-center text-sm" style={{ color: colors.textLight }}>Aucun groupe disponible pour le moment.</p>
            )}
          </div>
        </SectionWithAnimation>

        {/* Pâtisserie Traditionnelle */}
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
                  key={pastry.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg group"
                >
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={pastry.image} 
                      alt={pastry.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
            {pastries.length === 0 && (
              <p className="text-center text-sm" style={{ color: colors.textLight }}>Aucune pâtisserie disponible pour le moment.</p>
            )}
          </div>
        </SectionWithAnimation>

        {/* Boissons & Fruits secs pour tables */}
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
                {drinks.map((drink, idx) => (
                  <motion.div
                    key={drink.id}
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
                          {drink.category}
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
              {drinks.length === 0 && (
                <p className="text-center text-sm" style={{ color: colors.textLight }}>Aucune boisson disponible pour le moment.</p>
              )}
            </div>

            <div className="mb-16">
              <h3 className="text-2xl font-medium mb-6 text-center" style={{ color: colors.textDark }}>
                Fruits secs & Douceurs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sweets.map((sweet, idx) => (
                  <motion.div
                    key={sweet.id}
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
              {sweets.length === 0 && (
                <p className="text-center text-sm" style={{ color: colors.textLight }}>Aucune douceur disponible pour le moment.</p>
              )}
            </div>

            {/* Formules pour tables */}
            {tablePackages.length > 0 && (
              <div className="mt-12">
                <h3 className="text-2xl font-medium mb-6 text-center" style={{ color: colors.textDark }}>
                  Formules spéciales tables
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {tablePackages.map((pkg, idx) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ y: -5 }}
                      className={`rounded-2xl overflow-hidden shadow-lg relative ${
                        pkg.featured ? 'border-2' : ''
                      }`}
                      style={{ 
                        background: 'white',
                        borderColor: pkg.featured ? colors.primary : 'transparent'
                      }}
                    >
                      {pkg.featured && (
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
            )}
          </div>
        </SectionWithAnimation>
      </section>
      {reservationPacks.length > 0 && (
        <section className="py-20 px-10 max-w-350 mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs tracking-[4px] uppercase" style={{ color: colors.primary }}>
              RÉSERVATION RAPIDE
            </span>
            <h2 className="text-[clamp(32px,5vw,42px)] font-medium my-4">Nos Packs de Réservation</h2>
            <p className="text-sm" style={{ color: colors.textLight }}>
              Tarifs pour la saison actuelle: {getSeasonLabel(currentSeason)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reservationPacks.map((pack) => {
              const displayPrice = getDisplayPrice(pack, currentSeason);
              return (
                <div key={pack.packId} className="bg-white rounded-2xl overflow-hidden shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">{pack.name}</h3>
                  <p className="text-sm mb-3" style={{ color: colors.textLight }}>{pack.description}</p>
                  <p className="text-sm font-semibold mb-4" style={{ color: colors.primary }}>
                    {displayPrice}
                  </p>
                  <button
                    onClick={() => { setSelectedPackForModal(pack.packId); setIsPackModalOpen(true); }}
                    className="w-full py-2.5 rounded-full text-white text-sm font-medium"
                    style={{ background: colors.primary }}
                  >
                    Réserver ce pack
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <PackReservationModal
        isOpen={isPackModalOpen}
        onClose={() => { setIsPackModalOpen(false); setSelectedPackForModal(undefined); }}
        colors={colors}
        packs={reservationPacks}
        venues={venues} 
        initialPackId={selectedPackForModal}
        initialDate={filterValue.date}   
        initialPeriod={filterValue.period}
      />

      {selectedVenueForBooking && (
        <VenueBookingModal
          isOpen={isVenueBookingModalOpen}
          onClose={() => {
            setIsVenueBookingModalOpen(false);
            setSelectedVenueForBooking(null);
          }}
          venue={selectedVenueForBooking}
          colors={colors}
        />
      )}
      <ReviewsSection colors={colors} />

      <Footer colors={colors} />
    </div>
  );
}