// store/reviewsSlice.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  Timestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  createdAt: string; // ← Changé de Timestamp à string
  likes: number;
}

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  averageRating: number;
  totalReviews: number;
}

const initialState: ReviewsState = {
  reviews: [],
  loading: false,
  error: null,
  averageRating: 0,
  totalReviews: 0,
};

// Async thunk pour charger les avis
export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async () => {
    const reviewsRef = collection(db, "ratings");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const fetchedReviews: Review[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp;
      fetchedReviews.push({
        id: doc.id,
        name: data.name,
        rating: data.rating,
        comment: data.comment,
        date: createdAt 
          ? createdAt.toDate().toLocaleDateString("fr-FR", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })
          : new Date().toLocaleDateString("fr-FR"),
        createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(), // ← Converti en string
        likes: data.likes || 0
      });
    });
    
    return fetchedReviews;
  }
);

// Async thunk pour ajouter un avis
export const addReview = createAsyncThunk(
  'reviews/addReview',
  async (reviewData: { name: string; rating: number; comment: string; userId?: string }) => {
    const now = Timestamp.now();
    const reviewsRef = collection(db, "ratings");
    
    const docRef = await addDoc(reviewsRef, {
      name: reviewData.name,
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: now,
      updatedAt: now,
      likes: 0,
      userId: reviewData.userId || null
    });

    const newReview: Review = {
      id: docRef.id,
      name: reviewData.name,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: now.toDate().toLocaleDateString("fr-FR", { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      }),
      createdAt: now.toDate().toISOString(), // ← Converti en string
      likes: 0
    };

    return newReview;
  }
);

// Pour les mises à jour en temps réel (optionnel)
export const subscribeToReviews = () => (dispatch: any) => {
  const reviewsRef = collection(db, "ratings");
  const q = query(reviewsRef, orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const fetchedReviews: Review[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp;
      fetchedReviews.push({
        id: doc.id,
        name: data.name,
        rating: data.rating,
        comment: data.comment,
        date: createdAt 
          ? createdAt.toDate().toLocaleDateString("fr-FR", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })
          : new Date().toLocaleDateString("fr-FR"),
        createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString(), // ← Converti en string
        likes: data.likes || 0
      });
    });
    
    dispatch(setReviews(fetchedReviews));
  });
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReviews: (state, action: PayloadAction<Review[]>) => {
      state.reviews = action.payload;
      state.totalReviews = action.payload.length;
      state.averageRating = action.payload.length > 0
        ? action.payload.reduce((acc, review) => acc + review.rating, 0) / action.payload.length
        : 0;
    },
    addReviewOptimistic: (state, action: PayloadAction<Review>) => {
      state.reviews = [action.payload, ...state.reviews];
      state.totalReviews = state.reviews.length;
      state.averageRating = state.reviews.reduce((acc, review) => acc + review.rating, 0) / state.reviews.length;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
        state.totalReviews = action.payload.length;
        state.averageRating = action.payload.length > 0
          ? action.payload.reduce((acc, review) => acc + review.rating, 0) / action.payload.length
          : 0;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      .addCase(addReview.pending, (state) => {
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviews = [action.payload, ...state.reviews];
        state.totalReviews = state.reviews.length;
        state.averageRating = state.reviews.reduce((acc, review) => acc + review.rating, 0) / state.reviews.length;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add review';
      });
  },
});

export const { setReviews, addReviewOptimistic, clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;