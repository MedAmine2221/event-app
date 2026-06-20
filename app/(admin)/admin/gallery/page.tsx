// app/admin/gallery/page.tsx
"use client";

import { AdminGallery } from "@/components/admin/Gallery";


const colors = {
  primary: "#C3937C",
  secondary: "#EAD9C9",
  background: "#FBF8F1",
  textDark: "#2C2C2C",
  textLight: "#787878",
};

export default function AdminGalleryPage() {
  return <AdminGallery colors={colors} />;
}