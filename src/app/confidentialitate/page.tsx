import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal-layout";
import { campaign } from "@/lib/campaign";
import { legalDetails } from "@/content/legal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Date personale — La MAXIM",
  robots: { index: false },
};

export default function Privacy() {
  return (
    <LegalLayout
      title="Informare privind datele personale"
      version={campaign.privacyVersion}
    >
      <h2>Cine gestionează datele</h2>
      <p>
        {process.env.ORGANIZER_NAME ||
          "[De completat] Numele / denumirea organizatorului"}
        ,{" "}
        {process.env.ORGANIZER_ADDRESS ||
          "[De completat] adresa organizatorului"}
        . Pentru întrebări:{" "}
        {process.env.ORGANIZER_CONTACT_EMAIL ||
          "[De completat] adresa de e-mail de contact"}
        .
      </p>
      <h2>Ce date sunt colectate</h2>
      <p>
        Numele, prenumele, numărul de telefon, data înscrierii și versiunile
        documentelor acceptate. Pentru limitarea solicitărilor automate, adresa
        IP este transformată criptografic într-un identificator; adresa IP brută
        nu este salvată în tabelul înscrierilor.
      </p>
      <h2>De ce sunt folosite</h2>
      <p>
        Datele din formular sunt folosite pentru înregistrarea participării,
        prevenirea înscrierilor duplicate, gestionarea giveaway-ului și
        contactarea câștigătorului. Formularul nu înscrie participanții la
        mesaje de marketing.
      </p>
      <p>{legalDetails.privacyBasis}</p>
      <h2>Stocare și furnizori tehnici</h2>
      <p>
        Site-ul este pregătit pentru găzduire pe Vercel, iar înscrierile sunt
        păstrate în Supabase. Datele participanților nu sunt afișate public.
        Organizatorul trebuie să confirme configurația furnizorilor și
        eventualele transferuri de date înainte de publicare.
      </p>
      <h2>Cât timp sunt păstrate datele</h2>
      <p>
        {process.env.DATA_RETENTION_DESCRIPTION ||
          "[De completat] Perioada de păstrare și procedura de ștergere a datelor participanților."}{" "}
        Identificatorii pentru limitarea solicitărilor sunt eliminați după
        expirarea ferestrei de 15 minute, la următoarea înscriere procesată sau
        prin curățare programată.
      </p>
      <h2>Solicitări privind datele tale</h2>
      <p>{legalDetails.privacyRequests}</p>
      <p>
        Contact:{" "}
        {process.env.ORGANIZER_CONTACT_EMAIL ||
          "[De completat] adresa de e-mail"}
        .
      </p>
      <h2>Module și stocare în browser</h2>
      <p>
        Formularul nu folosește cookie-uri pentru publicitate sau servicii de
        analiză. Datele introduse rămân în formular în cazul unei erori și nu
        sunt salvate de aplicație în localStorage.
      </p>
    </LegalLayout>
  );
}
