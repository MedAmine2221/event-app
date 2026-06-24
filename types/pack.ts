/* eslint-disable @typescript-eslint/no-explicit-any */
// types/pack.ts
export type PackId = "pack1" | "pack2" | "pack3";

export interface JuiceOption {
  id: string;
  name: string;
}
export interface PackReservation {
  id?: string;
  packId: PackId;
  packName: string;
  venueId: string;
  venueName: string;
  date: string;
  period: "morning" | "evening";
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  message?: string;
  decorChoice?: {
    label: string;
    color: string;
    nappeColor: string;
    chairCoverColor: string;
  };
  juiceChoice?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export const PACK_LABELS: Record<PackId, string> = {
  pack1: "Pack 1 — Salle & Décor sur mesure",
  pack2: "Pack 2 — Salle, Eau & Thé + Service",
  pack3: "Pack 3 — Salle, Serveur & Boissons",
};

export type Season = "summer" | "spring" | "autumn" | "winter";

export interface SeasonalPrice {
  season: Season;
  price: string;
  priceNumber: number;
  isActive?: boolean;
}

export interface DecorOption {
  id: string;
  label: string;
  color: string;
  nappeColor: string;
  chairCoverColor: string;
}

export interface ReservationPack {
  id?: string;
  packId: PackId;
  name: string;
  description: string;
  price: string; // Prix par défaut
  seasonalPrices: SeasonalPrice[]; // Tarifs saisonniers
  image?: string;
  // Pack 1 : personnalisation décor
  decorOptions?: DecorOption[];
  // Pack 2 & 3 : eau / thé / service
  includesWater?: boolean;
  includesTea?: boolean;
  serviceDescription?: string;
  // Pack 3 : serveur + choix de jus
  includesWaiter?: boolean;
  juiceOptions?: JuiceOption[];
}

export interface VenueSeasonalPrice {
  season: Season;
  price: string;
  priceNumber: number;
}

export interface VenueWithSeasonalPrices {
  id: string;
  name: string;
  description: string;
  image: string;
  capacity: string;
  tables: number;
  chairs: number;
  type: string;
  price: string; // Prix par défaut
  seasonalPrices: VenueSeasonalPrice[];
  surface?: string;
  isIndoor: boolean;
  featured: boolean;
  unavailableDates?: any[];
}

export const SEASONS: { value: Season; label: string; emoji: string }[] = [
  { value: "summer", label: "Été (Juin - Août)", emoji: "☀️" },
  { value: "spring", label: "Printemps (Mars - Mai)", emoji: "🌸" },
  { value: "autumn", label: "Automne (Sept - Nov)", emoji: "🍂" },
  { value: "winter", label: "Hiver (Déc - Fév)", emoji: "❄️" },
];

export const getSeason = (date: Date): Season => {
  const month = date.getMonth(); // 0 = janvier
  if (month >= 2 && month <= 4) return "spring"; // Mars, Avril, Mai
  if (month >= 5 && month <= 7) return "summer"; // Juin, Juillet, Août
  if (month >= 8 && month <= 10) return "autumn"; // Sept, Oct, Nov
  return "winter"; // Déc, Jan, Fév
};

export const getSeasonEmoji = (season: Season): string => {
  const found = SEASONS.find(s => s.value === season);
  return found?.emoji || "📅";
};

export const getSeasonLabel = (season: Season): string => {
  const found = SEASONS.find(s => s.value === season);
  return found?.label || season;
};