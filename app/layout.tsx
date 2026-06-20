// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/ReduxProviders";
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";

export const metadata: Metadata = {
  title: "Carthage Events",
  description: "Wedding App",
  icons: {
    icon: "/logo-dar-bouraoui.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body cz-shortcut-listen="true">
        <ReduxProvider>
          <AdminLayoutWrapper>
            {children}
          </AdminLayoutWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}