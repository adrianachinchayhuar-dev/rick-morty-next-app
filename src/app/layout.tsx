
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js - Laboratorio 10",
  description: "Pokédex con App Router, SSG e ISR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
