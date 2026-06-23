"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  if (isAdminPage) {
    return (
      <div className="min-h-screen flex">
        <AdminSidebar />
        <main className="flex-1 ml-70">
          {children}
        </main>
      </div>
    );
  }

  return <>{children}</>;
}