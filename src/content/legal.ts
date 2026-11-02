// Replace each [De completat] value with the organizer's confirmed text.
// Then bump campaign.rulesVersion / privacyVersion and approve the documents in Vercel.
export const legalDetails = {
  eligibility:
    "[De completat] Condițiile de eligibilitate și eventualele excluderi.",
  prizeConditions:
    "[De completat] Conținutul final al premiului, durata evenimentului, serviciile incluse și excluse, perioada în care poate fi folosit și modul de stabilire a datei.",
  draw: "[De completat] Data și metoda extragerii, desemnarea rezervelor, contactarea câștigătorului și termenul de răspuns.",
  privacyBasis:
    "[De completat] Temeiul prelucrării datelor, stabilit de organizator pentru fiecare scop.",
  privacyRequests:
    "[De completat] Procedura de exercitare a drepturilor privind datele personale, inclusiv autoritatea de supraveghere competentă.",
};

export function legalDocumentsReady() {
  return (
    process.env.LEGAL_DOCUMENTS_APPROVED === "true" &&
    Object.values(legalDetails).every(
      (value) => !value.includes("[De completat]"),
    ) &&
    Boolean(
      process.env.ORGANIZER_NAME &&
      process.env.ORGANIZER_ADDRESS &&
      process.env.ORGANIZER_CONTACT_EMAIL &&
      process.env.DATA_RETENTION_DESCRIPTION,
    )
  );
}
