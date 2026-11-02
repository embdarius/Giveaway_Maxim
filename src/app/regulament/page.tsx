import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { campaign } from "@/lib/campaign";
import { legalDetails } from "@/content/legal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Regulamentul giveaway-ului — La MAXIM",
  robots: { index: false },
};

export default function Rules() {
  return (
    <LegalLayout
      title="Regulamentul giveaway-ului"
      version={campaign.rulesVersion}
    >
      <h2>Organizatorul</h2>
      <p>
        {process.env.ORGANIZER_NAME ||
          "[De completat] Numele / denumirea organizatorului"}
        <br />
        {process.env.ORGANIZER_ADDRESS ||
          "[De completat] Adresa organizatorului"}
        <br />
        Contact:{" "}
        {process.env.ORGANIZER_CONTACT_EMAIL ||
          "[De completat] Adresa de e-mail"}
      </p>
      <h2>Perioada înscrierilor</h2>
      <p>
        Înscrierile sunt deschise începând cu 2 noiembrie 2026 și se încheie pe{" "}
        {campaign.deadlineLabel}, ora României.
      </p>
      <h2>Premiul</h2>
      <p>
        Un eveniment pentru maximum {campaign.maxGuests} de persoane la{" "}
        {campaign.venue}, în {campaign.location}. {campaign.prizeDetail}
      </p>
      <p>{legalDetails.prizeConditions}</p>
      <h2>Cine poate participa</h2>
      <p>{legalDetails.eligibility}</p>
      <h2>Cum te înscrii</h2>
      <p>
        Completează numele, prenumele și un număr de telefon valid, acceptă
        regulamentul și confirmă citirea informării privind datele personale.
        Participarea este gratuită. Este înregistrată o singură înscriere pentru
        fiecare număr de telefon; retrimiterea formularului nu oferă șanse
        suplimentare.
      </p>
      <h2>Extragerea și contactarea câștigătorului</h2>
      <p>{legalDetails.draw}</p>
      <h2>Datele participanților</h2>
      <p>
        Detaliile privind prelucrarea datelor sunt disponibile în{" "}
        <a href="/confidentialitate">informarea privind datele personale</a>.
      </p>
    </LegalLayout>
  );
}
