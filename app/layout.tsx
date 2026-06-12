import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/Navbar";

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
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar />
        {children}</body>
    </html>
  );
}
