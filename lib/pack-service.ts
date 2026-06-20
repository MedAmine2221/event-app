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
  const q = query(
    collection(db, SLOTS_COLLECTION),
    where("venueId", "==", data.venueId),
    where("date", "==", data.date),
    where("period", "==", data.period),
    where("isAvailable", "==", true)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Ce créneau n'est plus disponible pour cette salle");
  }

  const slotDoc = snapshot.docs[0];
  const now = new Date().toISOString();

  const reservation: Omit<PackReservation, "id"> = {
    ...data,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, PACK_RESERVATIONS_COLLECTION), reservation);

  await updateDoc(slotDoc.ref, {
    isAvailable: false,
    bookedBy: docRef.id,
    bookedAt: Timestamp.now(),
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    clientPhone: data.clientPhone,
  });

  return { id: docRef.id, ...reservation };
};

// Pour l'admin : lister toutes les réservations de packs
export const getAllPackReservations = async (): Promise<PackReservation[]> => {
  const snapshot = await getDocs(collection(db, PACK_RESERVATIONS_COLLECTION));
  const reservations: PackReservation[] = [];
  snapshot.forEach((d) => reservations.push({ id: d.id, ...d.data() } as PackReservation));
  return reservations;
};