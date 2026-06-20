// types/pack.ts
export type PackId = "pack1" | "pack2" | "pack3";

export interface DecorOption {
  id: string;
  label: string;
  color: string;
  nappeColor: string;
  chairCoverColor: string;
}

export interface JuiceOption {
  id: string;
  name: string;
}

export interface ReservationPack {
  id?: string;
  packId: PackId;
  name: string;
  description: string;
  price: string;
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