import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alerts — Redesign Prototype",
  description: "SwiftUI-style web prototype",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alerts",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#020B18",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-black flex items-start justify-center">
        <div className="w-[390px] min-h-screen bg-background relative overflow-x-hidden shadow-2xl shadow-black/50 border-x border-white/5">
          {children}
        </div>
      </body>
    </html>
  );
}
