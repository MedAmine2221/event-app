// lib/engagement-service.ts
import { db } from "./firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { BandReview, PastryReview } from "@/types/engagement";

const BAND_LIKES_COLLECTION = "bandLikes";
const PASTRY_LIKES_COLLECTION = "pastryLikes";
const BAND_REVIEWS_COLLECTION = "bandReviews";
const PASTRY_REVIEWS_COLLECTION = "pastryReviews";

// Identifiant anonyme stable côté navigateur (utilisé si le client n'est pas connecté)
export const getOrCreateAnonymousId = (): string => {
  if (typeof window === "undefined") return "anonymous";
  const key = "ce_anonymous_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
};

type LikeTarget = "bands" | "pastries";

const toggleLike = async (
  targetCollection: LikeTarget,
  likesCollection: string,
  targetId: string,
  userKey: string
): Promise<{ liked: boolean; likes: number }> => {
  const likeRef = doc(db, likesCollection, `${targetId}_${userKey}`);
  const targetRef = doc(db, targetCollection, targetId);

  const existing = await getDoc(likeRef);
  const alreadyLiked = existing.exists();

  if (alreadyLiked) {
    await deleteDoc(likeRef);
    await updateDoc(targetRef, { likes: increment(-1) });
  } else {
    await setDoc(likeRef, { targetId, userKey, createdAt: Timestamp.now() });
    await updateDoc(targetRef, { likes: increment(1) });
  }

  const updatedTarget = await getDoc(targetRef);
  const likes = Math.max(0, (updatedTarget.data()?.likes as number) || 0);

  return { liked: !alreadyLiked, likes };
};

export const toggleBandLike = (bandId: string, userKey: string) =>
  toggleLike("bands", BAND_LIKES_COLLECTION, bandId, userKey);

export const togglePastryLike = (pastryId: string, userKey: string) =>
  toggleLike("pastries", PASTRY_LIKES_COLLECTION, pastryId, userKey);

const hasLiked = async (likesCollection: string, targetId: string, userKey: string): Promise<boolean> => {
  const snap = await getDoc(doc(db, likesCollection, `${targetId}_${userKey}`));
  return snap.exists();
};

export const hasUserLikedBand = (bandId: string, userKey: string) =>
  hasLiked(BAND_LIKES_COLLECTION, bandId, userKey);

export const hasUserLikedPastry = (pastryId: string, userKey: string) =>
  hasLiked(PASTRY_LIKES_COLLECTION, pastryId, userKey);

// ---------- Avis (bands / pâtisseries) ----------
const recomputeAggregates = async (
  targetCollection: LikeTarget,
  reviewsCollection: string,
  idField: "bandId" | "pastryId",
  targetId: string
) => {
  const q = query(collection(db, reviewsCollection), where(idField, "==", targetId));
  const snapshot = await getDocs(q);
  let sum = 0;
  snapshot.forEach((d) => {
    sum += d.data().rating || 0;
  });
  const reviewCount = snapshot.size;
  const averageRating = reviewCount > 0 ? sum / reviewCount : 0;

  await updateDoc(doc(db, targetCollection, targetId), { reviewCount, averageRating });
};

export const addBandReview = async (
  bandId: string,
  data: Omit<BandReview, "id" | "createdAt">
): Promise<void> => {
  await addDoc(collection(db, BAND_REVIEWS_COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  await recomputeAggregates("bands", BAND_REVIEWS_COLLECTION, "bandId", bandId);
};

export const addPastryReview = async (
  pastryId: string,
  data: Omit<PastryReview, "id" | "createdAt">
): Promise<void> => {
  await addDoc(collection(db, PASTRY_REVIEWS_COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  await recomputeAggregates("pastries", PASTRY_REVIEWS_COLLECTION, "pastryId", pastryId);
};

export const getBandReviews = async (bandId: string): Promise<BandReview[]> => {
  const q = query(collection(db, BAND_REVIEWS_COLLECTION), where("bandId", "==", bandId));
  const snapshot = await getDocs(q);
  const reviews: BandReview[] = [];
  snapshot.forEach((d) => reviews.push({ id: d.id, ...d.data() } as BandReview));
  return reviews.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
};

export const getPastryReviews = async (pastryId: string): Promise<PastryReview[]> => {
  const q = query(collection(db, PASTRY_REVIEWS_COLLECTION), where("pastryId", "==", pastryId));
  const snapshot = await getDocs(q);
  const reviews: PastryReview[] = [];
  snapshot.forEach((d) => reviews.push({ id: d.id, ...d.data() } as PastryReview));
  return reviews.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
};