import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/latin-ext-400.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-ext-500.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-ext-400-italic.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/manrope/latin-ext-400.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-ext-500.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-ext-600.css";
import "@fontsource/manrope/latin-600.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: "Un eveniment al tău, la MAXIM — Giveaway",
  description:
    "Câștigă un eveniment la La MAXIM pentru până la 70 de persoane. Înscrie-te la giveaway și adună oamenii dragi în Răstolțu Mare, Sălaj.",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: "La MAXIM",
    title: "Un eveniment al tău. Un loc doar pentru voi.",
    description:
      "Participă la giveaway-ul La MAXIM pentru un eveniment de până la 70 de persoane.",
    images: [
      {
        url: "/images/la-maxim-seara.jpg",
        width: 682,
        height: 682,
        alt: "La MAXIM, la lumina serii",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
