// components/AdminSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  LayoutDashboard,
  Users,
  Music,
  Cake,
  Package,
  Calendar,
  LogOut,
  Menu,
  X,
  Home,
  Package2,
  GalleryHorizontal,
  CalendarCheck,
} from "lucide-react";

const adminTabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { id: "users", label: "Utilisateurs", icon: Users, path: "/admin/users" },
  { id: "gallery", label: "Gallery", icon: GalleryHorizontal, path: "/admin/gallery" },
  { id: "bands", label: "Bands & Artistes", icon: Music, path: "/admin/bands" },
  { id: "pastries", label: "Pâtisseries", icon: Cake, path: "/admin/pastries" },
    { id: "bookings", label: "Réservations Salles", icon: CalendarCheck, path: "/admin/bookings" },

  { id: "pack-reservations", label: "Réservations Packs", icon: Package, path: "/admin/pack-reservations" },
  { id: "venues", label: "Salles", icon: Calendar, path: "/admin/venues" },
  { id: "packs", label: "Packages", icon: Package2, path: "/admin/packages" },
];

const colors = {
  primary: "#C3937C",
  secondary: "#EAD9C9",
  background: "#FBF8F1",
  textDark: "#2C2C2C",
  textLight: "#787878",
};

export const AdminSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/");
        return;
      }
      
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();
        
        if (userData?.role === "admin") {
          setIsAuthorized(true);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Erreur:", error);
        router.push("/");
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <motion.aside
      initial={{ width: sidebarOpen ? 280 : 80 }}
      animate={{ width: sidebarOpen ? 280 : 80 }}
      className="fixed left-0 top-0 h-full shadow-xl z-50 overflow-hidden"
      style={{ background: colors.textDark }}
    >
      <div className="p-5 border-b" style={{ borderColor: `${colors.secondary}20` }}>
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <span className="text-lg tracking-[2px] font-medium block" style={{ color: colors.primary }}>
                Carthage Events
              </span>
              <span className="text-[10px] tracking-[1px]" style={{ color: colors.secondary }}>
                ADMIN PANEL
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
        </div>
      </div>

      <nav className="p-3">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => handleNavigation(tab.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <Icon size={20} className={isActive ? `text-[${colors.primary}]` : "text-white/60"} />
              {sidebarOpen && (
                <span className={`text-sm ${isActive ? "text-white" : "text-white/60"}`}>
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
        
        <div className="border-t my-3" style={{ borderColor: `${colors.secondary}20` }} />
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
        >
          <LogOut size={20} className="text-white/60" />
          {sidebarOpen && <span className="text-sm text-white/60">Déconnexion</span>}
        </button>
      </nav>
    </motion.aside>
  );
};