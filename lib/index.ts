import { colors } from "@/constants";
import { Timestamp } from "firebase/firestore";

export const toDate = (value: Timestamp | string | undefined): Date => {
  if (!value) return new Date(0);
  if (value instanceof Timestamp) return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date(0) : d;
};


export const statusColor = (status: string) => {
  switch (status) {
    case "confirmed": return colors.success;
    case "pending": return colors.warning;
    case "cancelled": return colors.danger;
    default: return colors.textLight;
  }
};


export const statusLabel = (status: string) => {
  switch (status) {
    case "confirmed": return "Confirmées";
    case "pending": return "En attente";
    case "cancelled": return "Annulées";
    default: return status;
  }
};

export const formatTND = (n: number) =>
  `${n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} TND`;
