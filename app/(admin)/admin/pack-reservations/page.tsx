// app/admin/pack-reservations/page.tsx
"use client";

import { AdminPackReservations } from "@/components/admin/AdminPackReservations";

const colors = {
  primary: "#C3937C",
  secondary: "#EAD9C9",
  background: "#FBF8F1",
  textDark: "#2C2C2C",
  textLight: "#787878",
};

export default function AdminPackReservationsPage() {
  return <AdminPackReservations colors={colors} />;
}