// app/admin/venues/page.tsx
"use client";

import { AdminVenues } from "@/components/admin/AdminVenues";


const colors = {
  primary: "#C3937C",
  secondary: "#EAD9C9",
  background: "#FBF8F1",
  textDark: "#2C2C2C",
  textLight: "#787878",
};

export default function AdminVenuesPage() {
  return <AdminVenues colors={colors} />;
}