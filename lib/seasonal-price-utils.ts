// lib/seasonal-price-utils.ts
import { Season, SeasonalPrice, VenueSeasonalPrice } from "@/types/pack";
export const getSeason = (date: Date): Season => {
  const month = date.getMonth(); // 0 = janvier
  if (month >= 2 && month <= 4) return "spring"; // Mars, Avril, Mai
  if (month >= 5 && month <= 7) return "summer"; // Juin, Juillet, Août
  if (month >= 8 && month <= 10) return "autumn"; // Sept, Oct, Nov
  return "winter"; // Déc, Jan, Fév
};

export const getSeasonalPrice = <T extends { seasonalPrices?: SeasonalPrice[] | VenueSeasonalPrice[] }>(
  item: T,
  season: Season
): string | null => {
  if (!item.seasonalPrices || item.seasonalPrices.length === 0) {
    return null;
  }
  
  const seasonalPrice = item.seasonalPrices.find(sp => sp.season === season);
  if (seasonalPrice) {
    return seasonalPrice.price;
  }
  
  return null;
};

export const getSeasonalPriceNumber = <T extends { seasonalPrices?: SeasonalPrice[] | VenueSeasonalPrice[] }>(
  item: T,
  season: Season
): number | null => {
  if (!item.seasonalPrices || item.seasonalPrices.length === 0) {
    return null;
  }
  
  const seasonalPrice = item.seasonalPrices.find(sp => sp.season === season);
  if (seasonalPrice) {
    return seasonalPrice.priceNumber;
  }
  
  return null;
};

export const getDisplayPrice = <T extends { price: string; seasonalPrices?: SeasonalPrice[] | VenueSeasonalPrice[] }>(
  item: T,
  season: Season
): string => {
  const seasonalPrice = getSeasonalPrice(item, season);
  return seasonalPrice || item.price;
};

export const getDisplayPriceNumber = <T extends { price: string; seasonalPrices?: SeasonalPrice[] | VenueSeasonalPrice[] }>(
  item: T,
  season: Season
): number | null => {
  const seasonalPrice = getSeasonalPriceNumber(item, season);
  if (seasonalPrice !== null) return seasonalPrice;
  
  return extractPriceNumber(item.price);
};

import { extractPriceNumber } from "./price-utils";