// lib/pack-service.ts
import { db } from "./firebase";
import {
    collection,
    doc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    query,
    where,
    Timestamp,
    getDoc,
} from "firebase/firestore";
import { ReservationPack, PackReservation, PackId } from "@/types/pack";

const PACKS_COLLECTION = "reservationPacks";
const PACK_RESERVATIONS_COLLECTION = "packReservations";
const SLOTS_COLLECTION = "timeSlots";

// Récupérer les packs (pack1, pack2, pack3)
export const getReservationPacks = async (): Promise<ReservationPack[]> => {
  const snapshot = await getDocs(collection(db, PACKS_COLLECTION));
  const packs: ReservationPack[] = [];
  snapshot.forEach((d) => packs.push({ id: d.id, ...d.data() } as ReservationPack));
  return packs;
};

// Récupérer un pack par son ID
export const getReservationPackById = async (packId: string): Promise<ReservationPack | null> => {
  const docRef = doc(db, PACKS_COLLECTION, packId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ReservationPack;
  }
  return null;
};

// Créer ou mettre à jour un pack (id du document = packId)
export const saveReservationPack = async (
  packId: PackId,
  data: Omit<ReservationPack, "id" | "packId">
): Promise<void> => {
  await setDoc(doc(db, PACKS_COLLECTION, packId), { ...data, packId });
};

// Vérifier la disponibilité du créneau puis créer la réservation
export const createPackReservation = async (
  data: Omit<PackReservation, "id" | "status" | "createdAt" | "updatedAt">
): Promise<PackReservation> => {
  console.log("🔍 Vérification du créneau:", {
    venueId: data.venueId,
    date: data.date,
    period: data.period,
  });

  // 1. Vérifier si le créneau existe et est disponible
  const q = query(
    collection(db, SLOTS_COLLECTION),
    where("venueId", "==", data.venueId),
    where("date", "==", data.date),
    where("period", "==", data.period)
  );
  
  const snapshot = await getDocs(q);
  console.log("📋 Créneaux trouvés:", snapshot.size);

  if (snapshot.empty) {
    console.error("❌ Aucun créneau trouvé pour:", {
      venueId: data.venueId,
      date: data.date,
      period: data.period,
    });
    throw new Error("Aucun créneau disponible pour cette salle à cette date et période");
  }

  // Vérifier que le créneau est disponible
  const slotDoc = snapshot.docs[0];
  const slotData = slotDoc.data();
  console.log("📊 Données du créneau:", slotData);

  if (!slotData.isAvailable) {
    console.error("❌ Créneau déjà réservé par:", slotData.bookedBy);
    throw new Error("Ce créneau n'est plus disponible pour cette salle");
  }

  // 2. Créer la réservation
  const now = new Date().toISOString();
  const reservation: Omit<PackReservation, "id"> = {
    ...data,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  console.log("📝 Création de la réservation:", reservation);
  const docRef = await addDoc(collection(db, PACK_RESERVATIONS_COLLECTION), reservation);

  // 3. Marquer le créneau comme indisponible
  await updateDoc(slotDoc.ref, {
    isAvailable: false,
    bookedBy: docRef.id,
    bookedAt: Timestamp.now(),
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
  });

  console.log("✅ Réservation créée avec succès:", docRef.id);
  return { id: docRef.id, ...reservation };
};

// Vérifier la disponibilité d'un créneau (sans créer de réservation)
export const checkSlotAvailability = async (
  venueId: string,
  date: string,
  period: string
): Promise<{ available: boolean; message?: string }> => {
  try {
    const q = query(
      collection(db, SLOTS_COLLECTION),
      where("venueId", "==", venueId),
      where("date", "==", date),
      where("period", "==", period)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { 
        available: false, 
        message: "Aucun créneau disponible pour cette salle à cette date et période" 
      };
    }

    const slotDoc = snapshot.docs[0];
    const slotData = slotDoc.data();
    
    if (!slotData.isAvailable) {
      return { 
        available: false, 
        message: "Ce créneau est déjà réservé" 
      };
    }

    return { available: true };
  } catch (error) {
    console.error("Erreur lors de la vérification du créneau:", error);
    return { 
      available: false, 
      message: "Erreur lors de la vérification du créneau" 
    };
  }
};

// Pour l'admin : lister toutes les réservations de packs
export const getAllPackReservations = async (): Promise<PackReservation[]> => {
  const snapshot = await getDocs(collection(db, PACK_RESERVATIONS_COLLECTION));
  const reservations: PackReservation[] = [];
  snapshot.forEach((d) => reservations.push({ id: d.id, ...d.data() } as PackReservation));
  return reservations;
};

// Pour l'admin : annuler une réservation (rendre le créneau disponible)
export const cancelPackReservation = async (reservationId: string): Promise<void> => {
  // 1. Récupérer la réservation
  const reservationRef = doc(db, PACK_RESERVATIONS_COLLECTION, reservationId);
  const reservationSnap = await getDoc(reservationRef);
  
  if (!reservationSnap.exists()) {
    throw new Error("Réservation introuvable");
  }
  
  const reservation = reservationSnap.data() as PackReservation;
  
  // 2. Trouver et libérer le créneau
  const q = query(
    collection(db, SLOTS_COLLECTION),
    where("venueId", "==", reservation.venueId),
    where("date", "==", reservation.date),
    where("period", "==", reservation.period),
    where("bookedBy", "==", reservationId)
  );
  
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const slotDoc = snapshot.docs[0];
    await updateDoc(slotDoc.ref, {
      isAvailable: true,
      bookedBy: null,
      bookedAt: null,
      clientName: null,
      clientEmail: null,
      clientPhone: null,
    });
  }
  
  // 3. Supprimer ou mettre à jour la réservation
  await updateDoc(reservationRef, {
    status: "cancelled",
    updatedAt: new Date().toISOString(),
  });
};

// Créer des créneaux pour une salle (admin)
export const createTimeSlots = async (
  venueId: string,
  dates: string[],
  periods: string[]
): Promise<void> => {
  for (const date of dates) {
    for (const period of periods) {
      const slotRef = doc(collection(db, SLOTS_COLLECTION));
      await setDoc(slotRef, {
        venueId,
        date,
        period,
        isAvailable: true,
        createdAt: Timestamp.now(),
      });
    }
  }
};