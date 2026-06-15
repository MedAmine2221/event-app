import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/ReduxProviders";

export const metadata: Metadata = {
  title: "Dar Bouraoui",
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
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}