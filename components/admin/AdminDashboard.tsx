/* eslint-disable @typescript-eslint/no-explicit-any */
// composant complet du dashboard — vue exhaustive de toutes les collections Firebase
"use client";;
import { AiReviewInsights } from "./AiReviewInsights";
import { motion } from "framer-motion";
import {
  Users,
  Music,
  Cake,
  Star,
  Calendar,
  TrendingUp,
  Activity,
  Eye,
  Heart,
  Clock,
  MapPin,
  Utensils,
  Wine,
  Sparkles,
  ThumbsUp,
  Package,
  Package2,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { extractPriceNumber } from "@/lib/price-utils";
import {
  PieChart as RePieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { AppUser, BandDashboard, Booking, GalleryImage, PackReservation, PastryDashboard, ReservationPack, Review, TimeSlot, VenueDashboard, WeddingPackage } from "@/types";
import { formatTND, statusColor, statusLabel, toDate } from "@/lib";
import { colors } from "@/constants";
export const AdminDashboard = () => {

  const [loading, setLoading] = useState(true);

  // Raw collections
  const [venues, setVenues] = useState<VenueDashboard[]>([]);
  const [bands, setBands] = useState<BandDashboard[]>([]);
  const [pastries, setPastries] = useState<PastryDashboard[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [weddingPackages, setWeddingPackages] = useState<WeddingPackage[]>([]);
  const [reservationPacks, setReservationPacks] = useState<ReservationPack[]>([]);
  const [packReservations, setPackReservations] = useState<PackReservation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);

  // Derived UI state
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);
  const [packageDistribution, setPackageDistribution] = useState<any[]>([]);
  const [reservationStatusData, setReservationStatusData] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0],
    totalLikes: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          venuesSnap, bandsSnap, pastriesSnap,
          gallerySnap, ratingsSnap, packagesSnap,
          reservationPacksSnap, packReservationsSnap,
          bookingsSnap, timeSlotsSnap, usersSnap,
        ] = await Promise.all([
          getDocs(collection(db, "venues")),
          getDocs(collection(db, "bands")),
          getDocs(collection(db, "pastries")),
          getDocs(collection(db, "gallery")),
          getDocs(collection(db, "ratings")),
          getDocs(collection(db, "weddingPackages")),
          getDocs(collection(db, "formules")),
          getDocs(collection(db, "reservationPacks")),
          getDocs(collection(db, "packReservations")),
          getDocs(collection(db, "bookings")),
          getDocs(collection(db, "timeSlots")),
          getDocs(collection(db, "users")),
        ]);

        const venuesData = venuesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as VenueDashboard));
        const bandsData = bandsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as BandDashboard));
        const pastriesData = pastriesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PastryDashboard));
        const galleryData = gallerySnap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryImage));
        const reviewsData = ratingsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
        const packagesData = packagesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as WeddingPackage));
        const reservationPacksData = reservationPacksSnap.docs.map((d) => ({ id: d.id, ...d.data() } as ReservationPack));
        const packReservationsData = packReservationsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as PackReservation));
        const bookingsData = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
        const timeSlotsData = timeSlotsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as TimeSlot));
        const usersData = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AppUser));

        setVenues(venuesData);
        setBands(bandsData);
        setPastries(pastriesData);
        setGallery(galleryData);
        setReviews(reviewsData);
        setWeddingPackages(packagesData);
        setReservationPacks(reservationPacksData);
        setPackReservations(packReservationsData);
        setBookings(bookingsData);
        setTimeSlots(timeSlotsData);
        setUsers(usersData);

        // ---- Distribution des formules mariage ----
        const packageTypes: { [key: string]: number } = {};
        packagesData.forEach((p) => {
          packageTypes[p.type] = (packageTypes[p.type] || 0) + 1;
        });
        setPackageDistribution(
          Object.entries(packageTypes).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
          }))
        );

        // ---- Statut des réservations (packs + bookings) ----
        const allReservations = [
          ...packReservationsData.map((r) => ({ status: r.status || "pending" })),
          ...bookingsData.map((b) => ({ status: b.status || "pending" })),
        ];
        const statusCount: { [key: string]: number } = { pending: 0, confirmed: 0, cancelled: 0 };
        allReservations.forEach((r) => {
          statusCount[r.status] = (statusCount[r.status] || 0) + 1;
        });
        setReservationStatusData(
          Object.entries(statusCount)
            .filter(([, v]) => v > 0)
            .map(([status, value]) => ({ name: statusLabel(status), value, status }))
        );

        // ---- Avis : stats ----
        if (reviewsData.length > 0) {
          const total = reviewsData.length;
          const sum = reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0);
          const avg = sum / total;
          const dist = [0, 0, 0, 0, 0];
          reviewsData.forEach((r) => {
            if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
          });
          const totalLikesReviews = reviewsData.reduce((acc, r) => acc + (r.likes || 0), 0);
          setReviewStats({ average: avg, total, distribution: dist, totalLikes: totalLikesReviews });
        } else {
          setReviewStats({ average: 0, total: 0, distribution: [0, 0, 0, 0, 0], totalLikes: 0 });
        }

        // ---- Activité mensuelle (toutes collections confondues) ----
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juillet", "Août", "Sep", "Oct", "Nov", "Déc"];
        const monthlyData: {
          [key: string]: {
            month: string; venues: number; bands: number; pastries: number;
            reviews: number; packages: number; reservations: number;
          };
        } = {};

        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentDate);
          d.setMonth(d.getMonth() - i);
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          monthlyData[monthKey] = {
            month: months[d.getMonth()],
            venues: 0, bands: 0, pastries: 0, reviews: 0, packages: 0, reservations: 0,
          };
        }

        const bump = (createdAt: Timestamp | string | undefined, key: keyof typeof monthlyData[string]) => {
          if (!createdAt) return;
          const date = toDate(createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (monthlyData[monthKey]) {
            (monthlyData[monthKey][key] as number)++;
          }
        };

        venuesData.forEach((v) => bump(v.createdAt, "venues"));
        bandsData.forEach((b) => bump(b.createdAt, "bands"));
        pastriesData.forEach((p) => bump(p.createdAt, "pastries"));
        reviewsData.forEach((r) => bump(r.createdAt, "reviews"));
        packagesData.forEach((p) => bump(p.createdAt, "packages"));
        packReservationsData.forEach((r) => bump(r.createdAt, "reservations"));
        bookingsData.forEach((b) => bump(b.createdAt, "reservations"));

        setMonthlyActivity(Object.values(monthlyData));

        // ---- Top catégories (étendu) ----
        const categoryItems = [
          { name: "Salles", value: venuesData.length },
          { name: "Bands", value: bandsData.length },
          { name: "Pâtisseries", value: pastriesData.length },
          { name: "Formules", value: packagesData.length },
          { name: "Galerie", value: galleryData.length },
          { name: "Réservations", value: packReservationsData.length + bookingsData.length },
        ].sort((a, b) => b.value - a.value);
        setTopCategories(categoryItems);

        // ---- Activité récente (fusion multi-collections) ----
        const recent = [
          ...venuesData.slice(0, 3).map((v) => ({
            icon: MapPin,
            label: `Salle "${v.name}" ajoutée`,
            time: toDate(v.createdAt),
            color: colors.primary,
          })),
          ...bandsData.slice(0, 2).map((b) => ({
            icon: Music,
            label: `Band "${b.name}" ajouté`,
            time: toDate(b.createdAt),
            color: colors.success,
          })),
          ...reviewsData.slice(0, 3).map((r) => ({
            icon: Star,
            label: `Avis de ${r.name} (${r.rating}★)`,
            time: toDate(r.createdAt),
            color: colors.warning,
          })),
          ...packReservationsData.slice(0, 3).map((r) => ({
            icon: Package,
            label: `Réservation pack "${r.packName}" par ${r.clientName}`,
            time: toDate(r.createdAt),
            color: colors.info,
          })),
          ...bookingsData.slice(0, 3).map((b) => ({
            icon: CalendarCheck,
            label: `Réservation salle par ${b.clientName}`,
            time: toDate(b.createdAt),
            color: "#9C27B0",
          })),
        ]
          .sort((a, b) => b.time.getTime() - a.time.getTime())
          .slice(0, 8);

        setRecentItems(recent);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: colors.primary }} />
          <p className="mt-4 text-sm" style={{ color: colors.textLight }}>Chargement des données...</p>
        </div>
      </div>
    );
  }

  // ---- Calculs dérivés ----
  const totalReservations = packReservations.length + bookings.length;
  const confirmedPackReservations = packReservations.filter((r) => r.status === "confirmed");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const pendingReservations =
    packReservations.filter((r) => r.status === "pending").length +
    bookings.filter((b) => b.status === "pending").length;
  const cancelledReservations =
    packReservations.filter((r) => r.status === "cancelled").length +
    bookings.filter((b) => b.status === "cancelled").length;
  const confirmedReservationsCount = confirmedPackReservations.length + confirmedBookings.length;
  const conversionRate = totalReservations > 0
    ? Math.round((confirmedReservationsCount / totalReservations) * 100)
    : 0;

  // Revenus estimés : packReservations confirmées -> prix du pack lié
  // bookings confirmées -> prix de la salle liée
  const packPriceById = new Map(reservationPacks.map((p) => [p.packId, extractPriceNumber(p.price) || 0]));
  const venuePriceById = new Map(venues.map((v) => [v.id, extractPriceNumber(v.price) || 0]));

  const packRevenue = confirmedPackReservations.reduce((sum, r) => {
    const price = packPriceById.get(r.packId) || 0;
    return sum + price;
  }, 0);
  const bookingRevenue = confirmedBookings.reduce((sum, b) => {
    const price = venuePriceById.get(b.venueId) || 0;
    return sum + price;
  }, 0);
  const estimatedRevenue = packRevenue + bookingRevenue;

  const totalItems =
    venues.length + bands.length + pastries.length +
    reviews.length + gallery.length + weddingPackages.length +
    reservationPacks.length + packReservations.length + bookings.length + users.length;

  const occupiedSlots = timeSlots.filter((s) => !s.isAvailable).length;
  const slotOccupancyRate = timeSlots.length > 0
    ? Math.round((occupiedSlots / timeSlots.length) * 100)
    : 0;

  const featuredVenues = venues.filter((v) => v.featured).length;
  const popularPackages = weddingPackages.filter((p) => p.isPopular).length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const statCards = [
    { label: "Salles", value: venues.length, icon: Calendar, sub: `${featuredVenues} en vedette`, color: colors.primary },
    { label: "Bands", value: bands.length, icon: Music, sub: `${bands.length} artistes`, color: colors.success },
    { label: "Pâtisseries", value: pastries.length, icon: Cake, sub: "Douceurs tunisiennes", color: colors.warning },
    { label: "Avis", value: reviews.length, icon: Star, sub: `${reviewStats.totalLikes} ❤️ reçus`, color: "#FFC107" },
    { label: "Galerie", value: gallery.length, icon: Eye, sub: `${gallery.length} photos`, color: "#E91E63" },
    { label: "Formules Mariage", value: weddingPackages.length, icon: Heart, sub: `${popularPackages} populaires`, color: colors.primary },
  ];

  const secondaryCards = [
    { label: "Utilisateurs", value: users.length, icon: Users, sub: `${adminCount} admin${adminCount > 1 ? "s" : ""}`, color: "#3F51B5" },
    { label: "Packs Réservation", value: reservationPacks.length, icon: Package2, sub: "Configurés", color: "#795548" },
    { label: "Réservations Packs", value: packReservations.length, icon: Package, sub: `${confirmedPackReservations.length} confirmées`, color: colors.info },
    { label: "Réservations Salles", value: bookings.length, icon: CalendarCheck, sub: `${confirmedBookings.length} confirmées`, color: "#9C27B0" },
    { label: "Créneaux", value: timeSlots.length, icon: CalendarClock, sub: `${slotOccupancyRate}% occupés`, color: "#607D8B" },
  ];

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    return `Il y a ${Math.floor(days / 7)} sem`;
  };

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-medium" style={{ color: colors.textDark }}>
            Tableau de bord
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textLight }}>
            Vue d&apos;ensemble complète de votre site Carthage Events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm px-4 py-2 rounded-full bg-white shadow-sm" style={{ color: colors.textLight }}>
            <Clock size={14} className="inline mr-2" />
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="text-sm px-4 py-2 rounded-full bg-white shadow-sm" style={{ color: colors.primary }}>
            <Activity size={14} className="inline mr-2" />
            {totalItems} éléments
          </span>
        </div>
      </motion.div>

      {/* Revenus + Réservations (bandeau prioritaire) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 shadow-sm text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, #8B6B5A)` }}
        >
          <Wallet size={20} className="mb-2 opacity-90" />
          <p className="text-xs opacity-80 mb-1">Revenus estimés (confirmés)</p>
          <p className="text-2xl font-bold">{formatTND(estimatedRevenue)}</p>
          <p className="text-[11px] opacity-70 mt-1">
            {formatTND(packRevenue)} packs · {formatTND(bookingRevenue)} salles
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg" style={{ background: `${colors.success}15` }}>
              <CheckCircle2 size={18} style={{ color: colors.success }} />
            </div>
            <span className="text-2xl font-bold" style={{ color: colors.textDark }}>
              {confirmedReservationsCount}
            </span>
          </div>
          <p className="text-xs font-medium" style={{ color: colors.textDark }}>Réservations confirmées</p>
          <p className="text-[11px] mt-0.5" style={{ color: colors.textLight }}>
            sur {totalReservations} au total
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg" style={{ background: `${colors.warning}15` }}>
              <AlertCircle size={18} style={{ color: colors.warning }} />
            </div>
            <span className="text-2xl font-bold" style={{ color: colors.textDark }}>
              {pendingReservations}
            </span>
          </div>
          <p className="text-xs font-medium" style={{ color: colors.textDark }}>En attente</p>
          <p className="text-[11px] mt-0.5" style={{ color: colors.textLight }}>
            Nécessitent une action
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg" style={{ background: `${colors.info}15` }}>
              <TrendingUp size={18} style={{ color: colors.info }} />
            </div>
            <span className="text-2xl font-bold" style={{ color: colors.textDark }}>
              {conversionRate}%
            </span>
          </div>
          <p className="text-xs font-medium" style={{ color: colors.textDark }}>Taux de confirmation</p>
          <p className="text-[11px] mt-0.5" style={{ color: colors.textLight }}>
            {cancelledReservations} annulée{cancelledReservations > 1 ? "s" : ""}
          </p>
        </motion.div>
      </div>

      {/* Stats Grid - Contenu / catalogue */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>
          Catalogue
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-gray-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-1.5 rounded-lg" style={{ background: `${stat.color}15` }}>
                    <Icon size={14} style={{ color: stat.color }} />
                  </div>
                  <span className="text-xl font-bold" style={{ color: colors.textDark }}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: colors.textDark }}>{stat.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: colors.textLight }}>{stat.sub}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stats Grid - Opérationnel */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: colors.textLight }}>
          Opérationnel
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {secondaryCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer border border-gray-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="p-1.5 rounded-lg" style={{ background: `${stat.color}15` }}>
                    <Icon size={14} style={{ color: stat.color }} />
                  </div>
                  <span className="text-xl font-bold" style={{ color: colors.textDark }}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: colors.textDark }}>{stat.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: colors.textLight }}>{stat.sub}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Review Stats Summary */}
      {reviewStats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-6 flex-wrap"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full" style={{ background: `${colors.primary}15` }}>
              <Star size={20} style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: colors.textDark }}>
                {reviewStats.average.toFixed(1)}
              </p>
              <p className="text-xs" style={{ color: colors.textLight }}>
                {reviewStats.total} avis • {reviewStats.totalLikes} ❤️
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            {reviewStats.distribution.map((count, i) => {
              const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
              return (
                <div key={i} className="flex-1">
                  <div className="flex items-center gap-1 text-xs" style={{ color: colors.textLight }}>
                    <span>{i + 1}★</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${percentage}%`,
                        background: percentage > 0 ? colors.primary : "#e0e0e0",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
      <AiReviewInsights colors={colors} />

      {/* Charts Row 1: Activité mensuelle + Statut réservations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium" style={{ color: colors.textDark }}>
              Activité Mensuelle
            </h3>
            <div className="flex items-center gap-2 text-xs" style={{ color: colors.textLight }}>
              <Activity size={14} className="inline" />
              6 derniers mois
            </div>
          </div>
          <div className="h-64">
            {monthlyActivity.length > 0 && monthlyActivity.some((m) => m.venues > 0 || m.bands > 0 || m.pastries > 0 || m.reviews > 0 || m.packages > 0 || m.reservations > 0) ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <AreaChart data={monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke={colors.textLight} fontSize={12} />
                  <YAxis stroke={colors.textLight} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="venues" stackId="1" stroke={colors.chartColors[0]} fill={colors.chartColors[0]} fillOpacity={0.2} name="Salles" />
                  <Area type="monotone" dataKey="bands" stackId="1" stroke={colors.chartColors[1]} fill={colors.chartColors[1]} fillOpacity={0.2} name="Bands" />
                  <Area type="monotone" dataKey="pastries" stackId="1" stroke={colors.chartColors[2]} fill={colors.chartColors[2]} fillOpacity={0.2} name="Pâtisseries" />
                  <Area type="monotone" dataKey="reviews" stackId="1" stroke={colors.chartColors[3]} fill={colors.chartColors[3]} fillOpacity={0.2} name="Avis" />
                  <Area type="monotone" dataKey="packages" stackId="1" stroke={colors.chartColors[4]} fill={colors.chartColors[4]} fillOpacity={0.2} name="Formules" />
                  <Area type="monotone" dataKey="reservations" stackId="1" stroke={colors.chartColors[5]} fill={colors.chartColors[5]} fillOpacity={0.2} name="Réservations" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center" style={{ color: colors.textLight }}>
                <p>Aucune donnée d&apos;activité disponible</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Statut des réservations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: colors.textDark }}>
            Statut des Réservations
          </h3>
          <div className="h-64">
            {reservationStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <RePieChart>
                  <Pie
                    data={reservationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {reservationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center" style={{ color: colors.textLight }}>
                <p>Aucune réservation pour le moment</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2: Formules + Top categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: colors.textDark }}>
            Formules Mariage
          </h3>
          <div className="h-56">
            {packageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                <RePieChart>
                  <Pie
                    data={packageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {packageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors.chartColors[index % colors.chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center" style={{ color: colors.textLight }}>
                <p>Aucune formule disponible</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm lg:col-span-2"
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: colors.textDark }}>
            Top Catégories
          </h3>
          <div className="space-y-3">
            {topCategories.map((cat, idx) => {
              const maxValue = topCategories[0]?.value || 1;
              const percentage = (cat.value / maxValue) * 100;
              const icons = [Calendar, Music, Cake, Wine, Utensils, Heart, ImageIcon, Package];
              const Icon = icons[idx % icons.length];
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2" style={{ color: colors.textDark }}>
                      <Icon size={14} style={{ color: colors.primary }} />
                      {cat.name}
                    </span>
                    <span style={{ color: colors.textLight }}>{cat.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: colors.primary }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Avis + Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium" style={{ color: colors.textDark }}>
              Derniers Avis
            </h3>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${colors.primary}10`, color: colors.primary }}>
              {reviews.length} avis
            </span>
          </div>
          {reviews.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: colors.textLight }}>
              Aucun avis pour le moment
            </p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {[...reviews]
                .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
                .slice(0, 5)
                .map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-50"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-medium text-sm"
                      style={{ background: colors.primary }}
                    >
                      {getInitials(review.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <p className="font-medium text-sm truncate" style={{ color: colors.textDark }}>
                          {review.name}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={13} className={i < review.rating ? "fill-current" : ""} style={{ color: i < review.rating ? "#FFC107" : "#e0e0e0" }} />
                            ))}
                          </div>
                          {review.likes > 0 && (
                            <span className="flex items-center gap-0.5 text-xs" style={{ color: colors.textLight }}>
                              <ThumbsUp size={10} /> {review.likes}
                            </span>
                          )}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: colors.textLight }}>
                          {review.comment}
                        </p>
                      )}
                      <p className="text-[10px] mt-1" style={{ color: colors.textLight }}>
                        {toDate(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: colors.textDark }}>
            Activité Récente
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {recentItems.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: colors.textLight }}>
                Aucune activité récente
              </p>
            ) : (
              recentItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${item.color}15` }}>
                      <Icon size={14} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: colors.textDark }}>
                        {item.label}
                      </p>
                      <p className="text-xs" style={{ color: colors.textLight }}>
                        {getTimeAgo(item.time)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Réservations récentes (packs + salles) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2" style={{ color: colors.textDark }}>
              <Package size={18} style={{ color: colors.primary }} />
              Réservations de Packs
            </h3>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${colors.primary}10`, color: colors.primary }}>
              {packReservations.length} total
            </span>
          </div>
          {packReservations.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: colors.textLight }}>
              Aucune réservation de pack pour le moment
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {[...packReservations]
                .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
                .slice(0, 6)
                .map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: `${colors.textLight}15` }}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: colors.textDark }}>{r.clientName}</p>
                      <p className="text-xs truncate" style={{ color: colors.textLight }}>{r.packName} · {r.venueName}</p>
                    </div>
                    <span
                      className="text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ml-2"
                      style={{ background: `${statusColor(r.status)}15`, color: statusColor(r.status) }}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2" style={{ color: colors.textDark }}>
              <CalendarCheck size={18} style={{ color: colors.primary }} />
              Réservations de Salles
            </h3>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${colors.primary}10`, color: colors.primary }}>
              {bookings.length} total
            </span>
          </div>
          {bookings.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: colors.textLight }}>
              Aucune réservation de salle pour le moment
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {[...bookings]
                .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
                .slice(0, 6)
                .map((b) => {
                  const venue = venues.find((v) => v.id === b.venueId);
                  return (
                    <div key={b.id} className="flex items-center justify-between p-2.5 rounded-lg border" style={{ borderColor: `${colors.textLight}15` }}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: colors.textDark }}>{b.clientName}</p>
                        <p className="text-xs truncate" style={{ color: colors.textLight }}>
                          {venue?.name || "Salle"} · {b.date} · {b.period === "morning" ? "Matin" : "Soir"}
                        </p>
                      </div>
                      <span
                        className="text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ml-2"
                        style={{ background: `${statusColor(b.status)}15`, color: statusColor(b.status) }}
                      >
                        {statusLabel(b.status)}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Stats Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Taux de remplissage vedettes", value: venues.length > 0 ? `${Math.round((featuredVenues / venues.length) * 100)}%` : "0%", icon: TrendingUp },
          { label: "Formules populaires", value: weddingPackages.length > 0 ? `${Math.round((popularPackages / weddingPackages.length) * 100)}%` : "0%", icon: Sparkles },
          { label: "Occupation créneaux", value: `${slotOccupancyRate}%`, icon: CalendarClock },
          { label: "Éléments en ligne", value: totalItems, icon: Activity },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: colors.textLight }}>{stat.label}</p>
                <p className="text-xl font-bold" style={{ color: colors.textDark }}>{stat.value}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ background: `${colors.primary}10` }}>
                <Icon size={18} style={{ color: colors.primary }} />
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};