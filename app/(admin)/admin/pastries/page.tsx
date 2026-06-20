// app/admin/users/page.tsx
"use client";

import { AdminPastry } from "@/components/admin/AdminPastry";
    const colors = {
  primary: "#C3937C",
  secondary: "#EAD9C9",
  background: "#FBF8F1",
  textDark: "#2C2C2C",
  textLight: "#787878",
};

export default function AdminPastryPage() {
  return <AdminPastry colors={colors} />;
}