import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "@/lib/firebase";

const secondaryApp =
  getApps().find((a) => a.name === "secondary") ??
  initializeApp(firebaseConfig, "secondary");

export const secondaryAuth = getAuth(secondaryApp);