// app/admin/bookings/page.tsx
"use client";

import { AdminBookings } from "@/components/admin/AdminBookings";

const colors = {
  primary: "#C3937C",
  secondary: "#EAD9C9",
  background: "#FBF8F1",
  textDark: "#2C2C2C",
  textLight: "#787878",
};

export default function AdminBookingsPage() {
  return <AdminBookings colors={colors} />;
}