/* eslint-disable @typescript-eslint/no-explicit-any */
// composant complet du dashboard avec les avis corrigés
"use client";

import { motion } from "framer-motion";
import { 
  Users, Music, Cake, Star, Calendar, 
  DollarSign, TrendingUp, TrendingDown,
  Activity, Eye, Heart, MessageSquare, Clock,
  MapPin, Utensils, Wine, Sparkles, ThumbsUp
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, Area, AreaChart
} from "recharts";

const colors = {
  primary: "#C3937C",
  secondary: "#EAD9C9",
  background: "#FBF8F1",
  textDark: "#2C2C2C",
  textLight: "#787878",
  chartColors: ["#C3937C", "#E8C4A8", "#A67B6A", "#D4A89B", "#B8877A", "#8B6B5A"]
};

// Interfaces
interface Venue {
  id: string;
  name: string;
  capacity: string;
  price: string;
  featured: boolean;
  type: string;
  isIndoor: boolean;
  createdAt: Timestamp;
}

interface Band {
  id: string;
  name: string;
  genre: string;
  price: string;
  createdAt: Timestamp;
}

interface Pastry {
  id: string;
  name: string;
  specialty: string;
  price: string;
  createdAt: Timestamp;
}

interface Drink {
  id: string;
  name: string;
  category: string;
  price: string;
  createdAt: Timestamp;
}

interface Sweet {
  id: string;
  name: string;
  type: string;
  price: string;
  createdAt: Timestamp;
}

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  featured: boolean;
  createdAt: Timestamp | string;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  likes: number;
  userId: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
}

interface WeddingPackage {
  id: string;
  name: string;
  type: string;
  price: string;
  isPopular: boolean;
  createdAt: Timestamp;
}

interface TablePackage {
  id: string;
  name: string;
  price: string;
  featured: boolean;
  items: string[];
}

export const AdminDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    venues: 0,
    bands: 0,
    pastries: 0,
    drinks: 0,
    sweets: 0,
    reviews: 0,
    gallery: 0,
    packages: 0,
    tablePackages: 0,
    featuredVenues: 0,
    popularPackages: 0,
    totalItems: 0,
    totalLikes: 0
  });
  
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [packageDistribution, setPackageDistribution] = useState<any[]>([]);
  const [galleryStats, setGalleryStats] = useState<any[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);
  const [venueTypes, setVenueTypes] = useState<any[]>([]);
  const [priceRanges, setPriceRanges] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({ 
    average: 0, 
    total: 0, 
    distribution: [0, 0, 0, 0, 0],
    totalLikes: 0 
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all collections
        const [
          venuesSnap, bandsSnap, pastriesSnap, drinksSnap, 
          sweetsSnap, reviewsSnap, gallerySnap, packagesSnap, 
          tablePackagesSnap
        ] = await Promise.all([
          getDocs(collection(db, "venues")),
          getDocs(collection(db, "bands")),
          getDocs(collection(db, "pastries")),
          getDocs(collection(db, "drinks")),
          getDocs(collection(db, "sweets")),
          getDocs(collection(db, "reviews")),
          getDocs(collection(db, "gallery")),
          getDocs(collection(db, "weddingPackages")),
          getDocs(collection(db, "formules"))
        ]);

        const venues = venuesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venue));
        const bands = bandsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Band));
        const pastries = pastriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pastry));
        const drinks = drinksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Drink));
        const sweets = sweetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sweet));
        const reviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        const gallery = gallerySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
        const packages = packagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeddingPackage));
        const tablePackages = tablePackagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TablePackage));

        // Calculate basic stats
        const totalItems = venues.length + bands.length + pastries.length + drinks.length + 
                          sweets.length + reviews.length + gallery.length + packages.length + tablePackages.length;
        
        const totalLikes = reviews.reduce((acc, r) => acc + (r.likes || 0), 0);

        setStats({
          venues: venues.length,
          bands: bands.length,
          pastries: pastries.length,
          drinks: drinks.length,
          sweets: sweets.length,
          reviews: reviews.length,
          gallery: gallery.length,
          packages: packages.length,
          tablePackages: tablePackages.length,
          featuredVenues: venues.filter(v => v.featured).length,
          popularPackages: packages.filter(p => p.isPopular).length,
          totalItems: totalItems,
          totalLikes: totalLikes
        });

        // Package type distribution
        const packageTypes: { [key: string]: number } = {};
        packages.forEach(p => {
          packageTypes[p.type] = (packageTypes[p.type] || 0) + 1;
        });
        setPackageDistribution(
          Object.entries(packageTypes).map(([name, value]) => ({ 
            name: name.charAt(0).toUpperCase() + name.slice(1), 
            value 
          }))
        );

        // Gallery by category
        const categoryCount: { [key: string]: number } = {};
        gallery.forEach(img => {
          categoryCount[img.category] = (categoryCount[img.category] || 0) + 1;
        });
        setGalleryStats(
          Object.entries(categoryCount).map(([name, value]) => ({ 
            name: name.charAt(0).toUpperCase() + name.slice(1), 
            value 
          }))
        );

        // Venue types
        const venueTypeCount: { [key: string]: number } = {};
        venues.forEach(v => {
          venueTypeCount[v.type] = (venueTypeCount[v.type] || 0) + 1;
        });
        setVenueTypes(
          Object.entries(venueTypeCount).map(([name, value]) => ({ 
            name: name.charAt(0).toUpperCase() + name.slice(1), 
            value 
          }))
        );

        // Price ranges for bands
        const bandPrices = bands.map(b => {
          if (b.price && typeof b.price === 'string') {
            return parseInt(b.price.replace(/[^\d]/g, '')) || 0;
          }
          return 0;
        });

        const priceCategories = [
          { range: '0-500', count: 0, label: '0-500 DT' },
          { range: '501-1000', count: 0, label: '501-1000 DT' },
          { range: '1001-2000', count: 0, label: '1001-2000 DT' },
          { range: '2001+', count: 0, label: '2000+ DT' }
        ];
        bandPrices.forEach(price => {
          if (price <= 500) priceCategories[0].count++;
          else if (price <= 1000) priceCategories[1].count++;
          else if (price <= 2000) priceCategories[2].count++;
          else priceCategories[3].count++;
        });
        setPriceRanges(priceCategories);

        // Reviews - TRIÉS PAR DATE (les plus récents d'abord)
        const sortedReviews = [...reviews].sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        setReviewsData(sortedReviews.slice(0, 5));

        // Review statistics
        if (reviews.length > 0) {
          const total = reviews.length;
          const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
          const avg = sum / total;
          const dist = [0, 0, 0, 0, 0];
          reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
          });
          const totalLikesReviews = reviews.reduce((acc, r) => acc + (r.likes || 0), 0);
          setReviewStats({ 
            average: avg, 
            total, 
            distribution: dist,
            totalLikes: totalLikesReviews 
          });
        }

        // Monthly activity (based on real data with createdAt timestamps)
        const allItems = [
          ...venues.map(v => ({ ...v, type: 'Salle' })),
          ...bands.map(b => ({ ...b, type: 'Band' })),
          ...pastries.map(p => ({ ...p, type: 'Pâtisserie' })),
          ...reviews.map(r => ({ ...r, type: 'Avis' })),
          ...packages.map(p => ({ ...p, type: 'Formule' }))
        ];

        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juillet', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthlyData: { [key: string]: { month: string; venues: number; bands: number; pastries: number; reviews: number; packages: number } } = {};
        
        // Initialize last 6 months
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentDate);
          d.setMonth(d.getMonth() - i);
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthKey] = {
            month: months[d.getMonth()],
            venues: 0,
            bands: 0,
            pastries: 0,
            reviews: 0,
            packages: 0
          };
        }

        // Count items by month
        allItems.forEach(item => {
          if (item.createdAt) {
            const date = item.createdAt instanceof Timestamp ? item.createdAt.toDate() : new Date(item.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyData[monthKey]) {
              if (item.type === 'Salle') monthlyData[monthKey].venues++;
              else if (item.type === 'Band') monthlyData[monthKey].bands++;
              else if (item.type === 'Pâtisserie') monthlyData[monthKey].pastries++;
              else if (item.type === 'Avis') monthlyData[monthKey].reviews++;
              else if (item.type === 'Formule') monthlyData[monthKey].packages++;
            }
          }
        });

        setMonthlyActivity(Object.values(monthlyData));

        // Top categories (most items by type)
        const categoryItems = [
          { name: 'Salles', value: venues.length },
          { name: 'Bands', value: bands.length },
          { name: 'Pâtisseries', value: pastries.length },
          { name: 'Douceurs', value: sweets.length },
          { name: 'Formules', value: packages.length },
        ].sort((a, b) => b.value - a.value);
        setTopCategories(categoryItems);

        // Recent activity (mix of recent items)
        const recent = [
          ...venues.slice(0, 2).map(v => ({ 
            icon: MapPin, 
            label: `Salle "${v.name}" ajoutée`, 
            time: v.createdAt ? (v.createdAt instanceof Timestamp ? v.createdAt.toDate() : new Date(v.createdAt)) : new Date(),
            color: colors.primary 
          })),
          ...bands.slice(0, 2).map(b => ({ 
            icon: Music, 
            label: `Band "${b.name}" ajouté`, 
            time: b.createdAt ? (b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(),
            color: "#4CAF50" 
          })),
          ...reviews.slice(0, 2).map(r => ({ 
            icon: Star, 
            label: `Avis de ${r.name} (${r.rating}★)`, 
            time: r.createdAt ? (r.createdAt instanceof Timestamp ? r.createdAt.toDate() : new Date(r.createdAt)) : new Date(),
            color: "#FFC107" 
          })),
        ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

        setRecentItems(recent);

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        // Ajouter un état d'erreur pour éviter l'affichage cassé
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

  const statCards = [
    { label: "Salles", value: stats.venues, icon: Calendar, sub: `${stats.featuredVenues} en vedette`, color: colors.primary },
    { label: "Bands", value: stats.bands, icon: Music, sub: `${stats.bands} artistes`, color: "#4CAF50" },
    { label: "Pâtisseries", value: stats.pastries, icon: Cake, sub: "Douceurs tunisiennes", color: "#FF9800" },
    { label: "Douceurs", value: stats.sweets, icon: Utensils, sub: `${stats.sweets} fruits secs`, color: "#9C27B0" },
    { label: "Avis", value: stats.reviews, icon: Star, sub: `${stats.totalLikes} ❤️ reçus`, color: "#FFC107" },
    { label: "Galerie", value: stats.gallery, icon: Eye, sub: `${stats.gallery} photos`, color: "#E91E63" },
    { label: "Formules", value: stats.packages, icon: Heart, sub: `${stats.popularPackages} populaires`, color: colors.primary },
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

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

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
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textLight }}>
            Vue d'ensemble de votre site Carthage Events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm px-4 py-2 rounded-full bg-white shadow-sm" style={{ color: colors.textLight }}>
            <Clock size={14} className="inline mr-2" />
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span className="text-sm px-4 py-2 rounded-full bg-white shadow-sm" style={{ color: colors.primary }}>
            <Activity size={14} className="inline mr-2" />
            {stats.totalItems} éléments
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
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
                        background: percentage > 0 ? colors.primary : '#e0e0e0'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Activity Chart */}
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
            {monthlyActivity.length > 0 && monthlyActivity.some(m => m.venues > 0 || m.bands > 0 || m.pastries > 0 || m.reviews > 0 || m.packages > 0) ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <AreaChart data={monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke={colors.textLight} fontSize={12} />
                  <YAxis stroke={colors.textLight} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="venues" 
                    stackId="1"
                    stroke={colors.chartColors[0]} 
                    fill={colors.chartColors[0]} 
                    fillOpacity={0.2}
                    name="Salles"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bands" 
                    stackId="1"
                    stroke={colors.chartColors[1]} 
                    fill={colors.chartColors[1]} 
                    fillOpacity={0.2}
                    name="Bands"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pastries" 
                    stackId="1"
                    stroke={colors.chartColors[2]} 
                    fill={colors.chartColors[2]} 
                    fillOpacity={0.2}
                    name="Pâtisseries"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reviews" 
                    stackId="1"
                    stroke={colors.chartColors[3]} 
                    fill={colors.chartColors[3]} 
                    fillOpacity={0.2}
                    name="Avis"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="packages" 
                    stackId="1"
                    stroke={colors.chartColors[4]} 
                    fill={colors.chartColors[4]} 
                    fillOpacity={0.2}
                    name="Formules"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center" style={{ color: colors.textLight }}>
                <p>Aucune donnée d&apos;activité disponible</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Package Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: colors.textDark }}>
            Formules Mariage
          </h3>
          <div className="h-64">
            {packageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <RePieChart>
                  <Pie
                    data={packageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {packageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors.chartColors[index % colors.chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: colors.textDark }}>
            Top Catégories
          </h3>
          <div className="space-y-3">
            {topCategories.map((cat, idx) => {
              const maxValue = topCategories[0]?.value || 1;
              const percentage = (cat.value / maxValue) * 100;
              const icons = [Calendar, Music, Cake, Wine, Utensils, Heart];
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

        {/* Recent Reviews - CORRIGÉ */}
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
              {reviewsData.length} avis
            </span>
          </div>
          {reviewsData.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: colors.textLight }}>
              Aucun avis pour le moment
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {reviewsData.map((review, idx) => (
                <motion.div 
                  key={idx} 
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
                            <Star key={i} size={13} className={i < review.rating ? 'fill-current' : ''} style={{ color: i < review.rating ? '#FFC107' : '#e0e0e0' }} />
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
                      {review.createdAt instanceof Timestamp 
                        ? new Date(review.createdAt.toDate()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                        : new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                      }
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
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-medium mb-4" style={{ color: colors.textDark }}>
            Activité Récente
          </h3>
          <div className="space-y-3">
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

      {/* Quick Stats Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Taux de remplissage", value: stats.venues > 0 ? `${Math.round((stats.featuredVenues / stats.venues) * 100)}%` : "0%", icon: TrendingUp },
          { label: "Formules populaires", value: stats.packages > 0 ? `${Math.round((stats.popularPackages / stats.packages) * 100)}%` : "0%", icon: Sparkles },
          { label: "Total produits", value: stats.pastries + stats.drinks + stats.sweets, icon: Cake },
          { label: "Éléments en ligne", value: stats.totalItems, icon: Activity },
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