// lib/price-utils.ts

/**
 * Extrait le premier nombre trouvé dans une chaîne de prix libre.
 * Gère les formats avec espaces, points ou virgules comme séparateurs de milliers.
 * Ex: "À partir de 5000 TND" -> 5000
 *     "3 500 - 8 000 TND"    -> 3500 (le premier nombre = le minimum)
 *     "12,500 TND"           -> 12500
 */
export const extractPriceNumber = (price: string | number | undefined | null): number | null => {
  if (price === undefined || price === null) return null;
  if (typeof price === "number") return Number.isNaN(price) ? null : price;

  // Cherche le premier nombre (avec espaces/virgules comme séparateurs de milliers)
  const match = price.match(/(\d[\d\s,.]*)/);
  if (!match) return null;

  const cleaned = match[1].replace(/[\s,]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "");
  const value = parseFloat(cleaned);
  return Number.isNaN(value) ? null : value;
};