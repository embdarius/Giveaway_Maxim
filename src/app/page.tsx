import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, MapPin, MoveUpRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { EntryForm } from "@/components/entry-form";
import { campaign } from "@/lib/campaign";

export const dynamic = "force-dynamic";

export default function Home() {
  const now = Date.now();
  return (
    <>
      <a className="skip-link" href="#inscriere">
        Mergi la formularul de înscriere
      </a>
      <div className="site-shell">
        <header className="site-header">
          <Brand />
          <span className="header-location">
            <MapPin size={14} strokeWidth={1.4} aria-hidden="true" />
            {campaign.location}
          </span>
          <a href="#inscriere" className="header-link">
            Participă la giveaway
            <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </header>
        <main className="giveaway-layout">
          <section className="intro" aria-labelledby="hero-title">
            <h1 id="hero-title">
              Un eveniment al tău.{" "}
              <em>
                Un loc doar <br className="mobile-break" />
                pentru voi.
              </em>
            </h1>
            <p className="intro-copy">
              Câștigă un eveniment la La MAXIM pentru până la{" "}
              <strong>70 de persoane.</strong> Adună oamenii dragi și lasă o
              nouă poveste să înceapă aici.
            </p>
            <a className="mobile-entry-link" href="#inscriere">
              Participă la giveaway
              <ArrowDown size={16} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </section>
          <figure className="main-photo">
            <div className="photo-frame">
              <Image
                src="/images/la-maxim-seara.jpg"
                alt="Foișorul de la La MAXIM, luminat seara de ghirlande calde care se reflectă în apă"
                fill
                priority
                sizes="(max-width: 760px) 100vw, (max-width: 1100px) 48vw, 650px"
                className="venue-photo"
              />
              <div className="photo-invitation">
                <span>O seară de ținut minte.</span>
                <MoveUpRight size={25} strokeWidth={1} aria-hidden="true" />
              </div>
            </div>
            <figcaption>
              <span>La MAXIM, cu oamenii tăi.</span>
              <span>Răstolțu Mare · Sălaj</span>
            </figcaption>
          </figure>
          <EntryForm serverNow={now} />
          <section className="venue-story" aria-labelledby="story-title">
            <div className="story-heading">
              <span className="story-rule" />
              <h2 id="story-title">
                Locul e aici.
                <br />
                <em>Amintirile sunt ale voastre.</em>
              </h2>
            </div>
            <div className="day-photo-wrap">
              <figure className="day-photo">
                <Image
                  src="/images/la-maxim-ceremonie.jpg"
                  alt="Amenajare de ceremonie în aer liber la La MAXIM, cu scaune verzi, flori și voaluri albe"
                  fill
                  sizes="(max-width: 760px) 82vw, 360px"
                  className="venue-photo"
                />
              </figure>
              <div className="photo-note">
                <span>
                  Voi aduceți
                  <br />
                  bucuria.
                </span>
                <span>
                  Noi pregătim
                  <br />
                  locul.
                </span>
              </div>
            </div>
            <p className="prize-detail">
              {campaign.prizeDetail}{" "}
              <Link href="/regulament">
                Vezi detaliile premiului
                <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
            </p>
          </section>
        </main>
        <footer className="site-footer">
          <span className="footer-brand">
            Sărbătorește <i>la MAXIM.</i>
          </span>
          <nav aria-label="Informații giveaway">
            <Link href="/regulament">Regulament</Link>
            <Link href="/confidentialitate">Date personale</Link>
          </nav>
          <span className="copyright">© 2026 La MAXIM</span>
        </footer>
      </div>
    </>
  );
}
