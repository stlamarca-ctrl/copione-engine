import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Copione Engine — Archivio mobile",
  description: "Consulta, apri e stampa raccolte e copioni da telefono.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
