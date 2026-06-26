import { Timestamp } from "firebase/firestore";
import { VenueSeasonalPrice } from "./pack";

export type UnavailablePeriod = "morning" | "evening" | "full";

export interface UnavailableDate {
  date: string;
  period: UnavailablePeriod;
}

export interface Venue {
  id?: string;
  name: string;
  description: string;
  image: string;
  capacity: string;
  tables: number;
  chairs: number;
  type: "salle_fete" | "salle_planaire" | "espace_vert" | "espace_mer" | "jardin" | "terrasse";
  surface?: string;
  isIndoor: boolean;
  price?: string;
  featured: boolean;
  unavailableDates: UnavailableDate[];
  seasonalPrices: VenueSeasonalPrice[];
  periodPrices?: PeriodPrice[];
}

export interface Band {
  id?: string;
  name: string;
  genre: string;
  price: string;
  image: string;
  description: string;
  contact?: string;
  socialMedia: string[];
  likes?: number;
  averageRating?: number;
  reviewCount?: number;

}

export interface BaseDoc {
  id: string;
  createdAt?: Timestamp | string;
}

export interface VenueDashboard extends BaseDoc {
  name: string;
  capacity: string;
  price: string;
  featured: boolean;
  type: string;
  isIndoor: boolean;
}

export interface PeriodPrice {
  period: "morning" | "evening";
  price: string;
  priceNumber: number;
}

export interface BandDashboard extends BaseDoc {
  name: string;
  genre: string;
  price: string;
}

export interface PastryDashboard extends BaseDoc {
  name: string;
  specialty: string;
  price: string;
}

export interface GalleryImage extends BaseDoc {
  title: string;
  category: string;
  featured: boolean;
}

export interface Review extends BaseDoc {
  name: string;
  rating: number;
  comment: string;
  likes: number;
}

export interface WeddingPackage extends BaseDoc {
  name: string;
  type: string;
  price: string;
  isPopular: boolean;
}

export interface ReservationPack extends BaseDoc {
  packId: string;
  name: string;
  price: string;
}

export interface PackReservation extends BaseDoc {
  packId: string;
  packName: string;
  venueId: string;
  venueName: string;
  date: string;
  period: "morning" | "evening";
  clientName: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface Booking extends BaseDoc {
  venueId: string;
  date: string;
  period: "morning" | "evening";
  clientName: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface TimeSlot extends BaseDoc {
  venueId: string;
  date: string;
  period: "morning" | "evening";
  isAvailable: boolean;
}

export interface AppUser extends BaseDoc {
  email: string;
  displayName: string;
  role: string;
}