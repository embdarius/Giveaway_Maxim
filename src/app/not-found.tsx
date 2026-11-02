import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Brand />
      </header>
      <main className="legal-page">
        <h1>Drumul spre poveste începe aici.</h1>
        <p>Pagina căutată nu a fost găsită.</p>
        <Link href="/">Înapoi la giveaway</Link>
      </main>
    </div>
  );
}
