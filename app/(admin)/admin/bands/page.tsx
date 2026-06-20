// app/admin/bands/page.tsx
"use client";

import { AdminBands } from "@/components/admin/AdminBands";

export default function AdminBandsPage() {
    const colors = {
  primary: "#C3937C",
  secondary: "#EAD9C9",
  background: "#FBF8F1",
  textDark: "#2C2C2C",
  textLight: "#787878",
};
  return <AdminBands colors={colors} />;
}