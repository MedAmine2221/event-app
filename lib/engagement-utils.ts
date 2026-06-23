// lib/engagement-utils.ts
// Fonctions pures pour exploiter les likes/notes des bands et pâtisseries
// (utilisable aussi bien dans l'API IA côté serveur que côté client).

export interface GenreEngagementScore {
  genre: string;
  totalLikes: number;
  averageRating: number;
  itemCount: number;
}

/**
 * Regroupe des bands (par "genre") ou des pâtisseries (par "specialty") et calcule
 * un score de popularité (likes cumulés + note moyenne) par groupe. Sert à orienter
 * les suggestions vers le genre musical / type de pâtisserie le plus apprécié.
 */
export const computeTopGenreByEngagement = <
  T extends { genre?: string; specialty?: string; likes?: number; averageRating?: number }
>(
  items: T[],
  groupField: "genre" | "specialty"
): GenreEngagementScore[] => {
  const groups: Record<
    string,
    { totalLikes: number; ratingSum: number; ratingCount: number; itemCount: number }
  > = {};

  items.forEach((item) => {
    const key = (item[groupField] as string) || "Autre";
    if (!groups[key]) {
      groups[key] = { totalLikes: 0, ratingSum: 0, ratingCount: 0, itemCount: 0 };
    }
    groups[key].totalLikes += item.likes || 0;
    groups[key].itemCount += 1;
    if (item.averageRating) {
      groups[key].ratingSum += item.averageRating;
      groups[key].ratingCount += 1;
    }
  });

  return Object.entries(groups)
    .map(([genre, stats]) => ({
      genre,
      totalLikes: stats.totalLikes,
      averageRating: stats.ratingCount > 0 ? stats.ratingSum / stats.ratingCount : 0,
      itemCount: stats.itemCount,
    }))
    .sort((a, b) => b.totalLikes - a.totalLikes || b.averageRating - a.averageRating);
};