// app/admin/users/page.tsx
"use client";;
import { AdminPacks } from "@/components/admin/AdminPack";
const colors = {
primary: "#C3937C",
secondary: "#EAD9C9",
background: "#FBF8F1",
textDark: "#2C2C2C",
textLight: "#787878",
};

export default function AdminWeddingPackagesPages() {
  return <AdminPacks colors={colors} />;
}