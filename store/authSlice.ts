/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  resetEmailSent: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  resetEmailSent: false,
};

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string) => {
    await sendPasswordResetEmail(auth, email);
    return email;
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name, role = "client" }: { email: string; password: string; name: string; role?: string }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      displayName: name,
      photoURL: null,
      createdAt: new Date().toISOString(),
      role: role
    });
    
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: name,
      photoURL: null,
      role: role
    };
  }
);

export const setUser = createAsyncThunk(
  'auth/setUser',
  async (user: User | null) => {
    if (!user) return null;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || userData?.displayName,
      photoURL: user.photoURL || userData?.photoURL,
      role: userData?.role || "client"
    };
  }
);


export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.data();
    
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName || userData?.displayName,
      photoURL: userCredential.user.photoURL || userData?.photoURL,
    };
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        createdAt: new Date().toISOString(),
      });
    }
    
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL,
    };
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await signOut(auth);
  return null;
});


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResetEmailSent: (state) => {
      state.resetEmailSent = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign up failed';
      })
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Google sign in failed';
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetEmailSent = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetEmailSent = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de l\'envoi de l\'email';
      })
      .addCase(setUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearError, clearResetEmailSent } = authSlice.actions;
export default authSlice.reducer;