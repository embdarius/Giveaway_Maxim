import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "./brand";
import { legalDocumentsReady } from "@/content/legal";

export function LegalLayout({
  title,
  version,
  children,
}: {
  title: string;
  version: string;
  children: React.ReactNode;
}) {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Brand />
        <Link href="/#inscriere" className="legal-back">
          <ArrowLeft size={15} aria-hidden="true" />
          Înapoi la înscriere
        </Link>
      </header>
      <main className="legal-page">
        <span className="legal-version">La MAXIM · Versiunea {version}</span>
        <h1>{title}</h1>
        {!legalDocumentsReady() && (
          <aside className="draft-notice">
            <strong>Document în pregătire.</strong> Acest text este provizoriu.
            Organizatorul trebuie să completeze și să confirme detaliile înainte
            de activarea înscrierilor.
          </aside>
        )}
        {children}
      </main>
    </div>
  );
}
